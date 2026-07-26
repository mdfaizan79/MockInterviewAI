import { GoogleGenerativeAI } from '@google/generative-ai'
import TestSession from '../models/TestSession.js'

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured on the server')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' })
}

const parseJSON = (text) => {
  const t = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '')
  return JSON.parse(t)
}

// @desc  Generate interview questions and create session
// @route POST /api/test/generate
export const generateTest = async (req, res) => {
  try {
    const {
      resumeText,
      resumeSummary,
      resumeSkills = [],
      candidateName,
      candidateExp,
      candidateEdu,
      selectedStacks = [],
      difficulty = { easy: 30, medium: 50, hard: 20 },
      questionCount = 10,
      questionTypes = ['mcq', 'true_false'],
      timeLimit = 900,
      level = 'junior',
      tone = 'technical',
    } = req.body

    if (!selectedStacks.length) {
      return res.status(400).json({ success: false, message: 'Please select at least one tech stack' })
    }

    const easyCount   = Math.round((difficulty.easy   / 100) * questionCount)
    const mediumCount = Math.round((difficulty.medium / 100) * questionCount)
    const hardCount   = questionCount - easyCount - mediumCount

    const typeList = questionTypes.join(', ')

    const prompt = `You are a senior technical interviewer with 10+ years experience at FAANG companies.
Generate exactly ${questionCount} interview questions for a ${level} developer.

Tech stacks to cover: ${selectedStacks.join(', ')}
Candidate background: ${resumeSummary || `Skills: ${resumeSkills.slice(0, 10).join(', ')}`}
Interview tone: ${tone}
Question type distribution (use ONLY these types: ${typeList}): mix them naturally
Difficulty: ${easyCount} easy, ${mediumCount} medium, ${hardCount} hard

VERY IMPORTANT: Return ONLY a valid JSON array. No text before or after. No markdown.
[
  {
    "id": 1,
    "question": "What is...",
    "type": "mcq",
    "tech": "React",
    "difficulty": "easy",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "B",
    "explanation": "Detailed 100-150 word explanation of why the correct answer is correct and educational context",
    "whyOthersWrong": {
      "A": "Why A is wrong...",
      "C": "Why C is wrong...",
      "D": "Why D is wrong..."
    },
    "realWorldContext": "How this concept is used in real production code",
    "topicsToStudy": ["topic1", "topic2"],
    "resources": ["Resource name 1", "Resource name 2"]
  }
]

Rules per type:
- "mcq": options = 4 strings ["A) ...", "B) ...", "C) ...", "D) ..."], correctAnswer = "A"/"B"/"C"/"D"
- "true_false": options = ["True", "False"], correctAnswer = "True" or "False", whyOthersWrong = null
- "fill_blank": question has _____ for the blank, options = null, correctAnswer = the exact word/phrase to fill
- "short_answer": options = null, correctAnswer = ideal answer key points (50-80 words), whyOthersWrong = null
- "code_output": include code snippet in question using backtick code block, options = 4 strings, correctAnswer = "A"/"B"/"C"/"D"

Quality rules:
- Hard questions MUST test real gotchas, edge cases, or deep understanding
- Never repeat the same concept twice
- Distribute questions across ALL selected stacks proportionally
- Questions must be specific to their tech, not generic
- For fill_blank, the blank must have exactly ONE correct answer
- Explanations must be educational and mention WHY others are wrong`

    const result = await getModel().generateContent(prompt)
    const questions = parseJSON(result.response.text())

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format from AI')
    }

    // Create session in DB
    const session = await TestSession.create({
      resumeText: resumeText?.substring(0, 8000),
      resumeSummary,
      resumeSkills,
      candidateName,
      candidateExp,
      candidateEdu,
      selectedStacks,
      difficulty,
      questionCount: questions.length,
      questionTypes,
      timeLimit,
      level,
      tone,
      questions,
      status: 'in_progress',
    })

    // Return questions WITHOUT correct answers (so user can't cheat via network tab)
    const sanitized = questions.map(q => ({
      id:           q.id,
      question:     q.question,
      type:         q.type,
      tech:         q.tech,
      difficulty:   q.difficulty,
      options:      q.options,
      // NO correctAnswer, explanation, etc.
    }))

    res.json({
      success:   true,
      sessionId: session._id,
      questions: sanitized,
      timeLimit,
      meta: {
        total:     questions.length,
        stacks:    selectedStacks,
        level,
      }
    })
  } catch (error) {
    console.error('Test generation error:', error)
    res.status(500).json({ success: false, message: 'Failed to generate test', error: error.message })
  }
}

// @desc  Get session metadata (for restoring test state)
// @route GET /api/test/:sessionId
export const getSession = async (req, res) => {
  try {
    const session = await TestSession.findById(req.params.sessionId)
      .select('-questions.correctAnswer -questions.explanation -questions.whyOthersWrong')
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' })
    res.json({ success: true, session })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// @desc  Submit test answers for evaluation
// @route POST /api/test/:sessionId/submit
export const submitTest = async (req, res) => {
  try {
    const { answers, totalTimeTaken } = req.body
    // answers = [{ questionId, answer, timeTaken, flagged }]

    const session = await TestSession.findById(req.params.sessionId)
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' })
    if (session.status === 'evaluated') {
      return res.json({ success: true, message: 'Already evaluated', sessionId: session._id })
    }

    session.userAnswers = answers
    session.status = 'submitted'
    session.submittedAt = new Date()
    await session.save()

    // Kick off async evaluation
    evaluateAnswers(session._id.toString(), answers, totalTimeTaken).catch(console.error)

    res.json({ success: true, message: 'Submitted. Evaluating…', sessionId: session._id })
  } catch (error) {
    console.error('Submit error:', error)
    res.status(500).json({ success: false, message: 'Submit failed' })
  }
}

// @desc  Poll evaluation status
// @route GET /api/test/:sessionId/status
export const getStatus = async (req, res) => {
  try {
    const session = await TestSession.findById(req.params.sessionId).select('status')
    if (!session) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, status: session.status })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ─── Internal: evaluate answers asynchronously ───────────────
async function evaluateAnswers(sessionId, answers, totalTimeTaken) {
  const session = await TestSession.findById(sessionId)
  const questions = session.questions

  const questionResults = []
  let totalScore = 0
  const categoryScores   = {}
  const difficultyScores = { easy: { got: 0, total: 0 }, medium: { got: 0, total: 0 }, hard: { got: 0, total: 0 } }
  const typeScores       = {}

  for (const q of questions) {
    const userAns = answers.find(a => a.questionId === q.id)
    const userAnswer = userAns?.answer?.trim() || ''

    let correct = false
    let partialScore = 0
    let aiEvaluation = null

    if (q.type === 'short_answer') {
      // AI evaluate short answers
      try {
        const evalPrompt = `You are evaluating a technical interview answer. Be fair but accurate.

Question: ${q.question}
Ideal Answer Key Points: ${q.correctAnswer}
Candidate's Answer: "${userAnswer}"

Return ONLY valid JSON:
{
  "score": 0,
  "verdict": "incorrect",
  "whatWasRight": ["point1"],
  "whatWasMissing": ["point2"],
  "whatWasWrong": ["point3"],
  "idealAnswer": "Complete ideal answer in 3-5 sentences",
  "specificFeedback": "Direct personalized feedback to the candidate"
}

score: 0 = incorrect/blank, 0.5 = partially correct, 1 = fully correct
verdict: "correct" | "partial" | "incorrect"`

        const evalResult = await getModel().generateContent(evalPrompt)
        aiEvaluation = parseJSON(evalResult.response.text())
        partialScore = aiEvaluation.score || 0
        correct = partialScore >= 0.8
      } catch {
        partialScore = 0
      }
    } else {
      // Objective question
      const ca = q.correctAnswer?.trim().toUpperCase()
      const ua = userAnswer.trim().toUpperCase()

      if (q.type === 'fill_blank') {
        correct = ua.toLowerCase() === ca.toLowerCase()
      } else {
        // mcq, true_false, code_output
        correct = ua === ca || ua === ca.replace(/^[A-D]\)\s*/, '')
      }
      partialScore = correct ? 1 : 0
    }

    totalScore += partialScore
    questionResults.push({ questionId: q.id, correct, partialScore, aiEvaluation })

    // Category scores
    const tech = q.tech || 'Other'
    if (!categoryScores[tech]) categoryScores[tech] = { got: 0, total: 0 }
    categoryScores[tech].total++
    categoryScores[tech].got += partialScore

    // Difficulty scores
    const diff = q.difficulty || 'medium'
    difficultyScores[diff].total++
    if (correct) difficultyScores[diff].got++

    // Type scores
    if (!typeScores[q.type]) typeScores[q.type] = { got: 0, total: 0 }
    typeScores[q.type].total++
    typeScores[q.type].got += partialScore
  }

  const maxScore = questions.length
  const percentage = Math.round((totalScore / maxScore) * 100)

  // Format category scores as percentages
  const catPct = {}
  for (const [k, v] of Object.entries(categoryScores)) {
    catPct[k] = { pct: Math.round((v.got / v.total) * 100), correct: v.got, total: v.total }
  }
  const diffPct = {}
  for (const [k, v] of Object.entries(difficultyScores)) {
    if (v.total) diffPct[k] = { pct: Math.round((v.got / v.total) * 100), correct: v.got, total: v.total }
  }
  const typePct = {}
  for (const [k, v] of Object.entries(typeScores)) {
    typePct[k] = { pct: Math.round((v.got / v.total) * 100), correct: v.got, total: v.total }
  }

  // Generate improvement plan
  const weakAreas = Object.entries(catPct)
    .filter(([, v]) => v.pct < 70)
    .sort(([, a], [, b]) => a.pct - b.pct)
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${v.pct}%`)

  let improvementPlan = ''
  try {
    const planPrompt = `Generate a personalized study plan based on this mock interview performance.

Candidate Level: ${session.level}
Stacks Tested: ${session.selectedStacks.join(', ')}
Overall Score: ${percentage}%
Category Scores: ${JSON.stringify(catPct)}
Difficulty Scores: ${JSON.stringify(diffPct)}
Weak Areas: ${weakAreas.join(', ')}

Write a structured improvement plan with these exact sections:
1. 🔴 WEAK AREAS (below 60%) - for each: what to study, why it matters, hours needed, free resource, practice task
2. 🟡 AVERAGE AREAS (60-79%) - brief improvement notes
3. 🟢 STRONG AREAS (80%+) - brief congratulation and maintenance tips
4. 📅 5-DAY STUDY SCHEDULE - specific daily plan
Keep it encouraging, specific, and actionable. Use bullet points. Plain text, no JSON.`

    const planResult = await getModel().generateContent(planPrompt)
    improvementPlan = planResult.response.text().trim()
  } catch { improvementPlan = 'Focus on your weak areas and practice daily.' }

  // Generate badges
  const badges = []
  if (diffPct.easy?.pct === 100) badges.push({ emoji: '🏆', title: 'Flawless on Easy', desc: 'Got all easy questions right' })
  if (percentage >= 90) badges.push({ emoji: '🎯', title: 'Sharpshooter', desc: 'Scored 90%+ overall' })
  if (percentage >= 80) badges.push({ emoji: '🔥', title: 'Interview Ready', desc: 'Scored 80%+ — you can crack interviews' })
  const avgTime = totalTimeTaken / questions.length
  if (avgTime < 45) badges.push({ emoji: '⚡', title: 'Speed Demon', desc: 'Average under 45 seconds per question' })
  const perfectCats = Object.entries(catPct).filter(([, v]) => v.pct === 100)
  if (perfectCats.length > 0) badges.push({ emoji: '⭐', title: `${perfectCats[0][0]} Expert`, desc: `100% on ${perfectCats[0][0]} questions` })

  session.results = {
    totalScore,
    maxScore,
    percentage,
    timeTaken:       totalTimeTaken,
    categoryScores:  catPct,
    difficultyScores: diffPct,
    typeScores:      typePct,
    questionResults,
  }
  session.improvementPlan = improvementPlan
  session.badges = badges
  session.status = 'evaluated'
  session.evaluatedAt = new Date()
  await session.save()
}
