import TestSession from '../models/TestSession.js'

// @desc  Get full results for a session
// @route GET /api/results/:sessionId
export const getResults = async (req, res) => {
  try {
    const session = await TestSession.findById(req.params.sessionId)
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' })

    if (session.status !== 'evaluated') {
      return res.json({ success: true, status: session.status, message: 'Still evaluating…' })
    }

    // Build full Q&A review with answers and explanations
    const questionReview = session.questions.map((q, i) => {
      const qResult = session.results.questionResults?.find(r => r.questionId === q.id)
      const userAns = session.userAnswers?.find(a => a.questionId === q.id)
      return {
        id:              q.id,
        question:        q.question,
        type:            q.type,
        tech:            q.tech,
        difficulty:      q.difficulty,
        options:         q.options,
        correctAnswer:   q.correctAnswer,
        userAnswer:      userAns?.answer || null,
        timeTaken:       userAns?.timeTaken || 0,
        flagged:         userAns?.flagged || false,
        correct:         qResult?.correct || false,
        partialScore:    qResult?.partialScore || 0,
        aiEvaluation:    qResult?.aiEvaluation || null,
        explanation:     q.explanation,
        whyOthersWrong:  q.whyOthersWrong,
        realWorldContext: q.realWorldContext,
        topicsToStudy:   q.topicsToStudy,
        resources:       q.resources,
      }
    })

    res.json({
      success: true,
      session: {
        _id:             session._id,
        candidateName:   session.candidateName,
        candidateExp:    session.candidateExp,
        selectedStacks:  session.selectedStacks,
        level:           session.level,
        questionCount:   session.questionCount,
        createdAt:       session.createdAt,
        submittedAt:     session.submittedAt,
      },
      results:         session.results,
      questions:       questionReview,
      improvementPlan: session.improvementPlan,
      badges:          session.badges || [],
    })
  } catch (error) {
    console.error('Results error:', error)
    res.status(500).json({ success: false, message: 'Failed to load results' })
  }
}
