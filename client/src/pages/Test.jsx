import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Flag, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle,
  Send, Loader2, Eye, EyeOff, AlertCircle
} from 'lucide-react'
import { testAPI } from '../services/api'

const DIFF_STYLE = {
  easy:   { label: 'Easy',   cls: 'badge-easy' },
  medium: { label: 'Medium', cls: 'badge-medium' },
  hard:   { label: 'Hard',   cls: 'badge-hard' },
}
const TYPE_LABEL = {
  mcq:          'MCQ',
  true_false:   'True/False',
  fill_blank:   'Fill Blank',
  short_answer: 'Short Answer',
  code_output:  'Code Output',
}

// ── Question Card ──────────────────────────────────────────────
const QuestionCard = ({ q, userAnswer, onAnswer }) => {
  const [textVal, setTextVal] = useState(userAnswer || '')

  useEffect(() => { setTextVal(userAnswer || '') }, [q.id])

  const handleText = (val) => {
    setTextVal(val)
    onAnswer(val)
  }

  const diff = DIFF_STYLE[q.difficulty] || DIFF_STYLE.medium

  // Extract code block from question

  const codeMatch = q.question.match(/```[\s\S]*?```/)
  const questionText = q.question.replace(/```[\s\S]*?```/, '').trim()
  const codeContent  = codeMatch ? codeMatch[0].replace(/```\w*\n?/, '').replace(/```/, '') : null

  return (
    <div className="card p-6 lg:p-8">
      {/* Meta */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="badge bg-slate-100 text-slate-600">{TYPE_LABEL[q.type] || q.type}</span>
        <span className={`badge ${diff.cls}`}>{diff.label}</span>
        {q.tech && <span className="badge badge-tech">{q.tech}</span>}
      </div>

      {/* Question */}
      <p className="text-base lg:text-lg font-medium text-slate-900 leading-relaxed mb-5">
        {questionText}
      </p>

      {/* Code block */}
      {codeContent && (
        <div className="code-block mb-5">{codeContent}</div>
      )}

      {/* MCQ / True-False / Code Output */}
      {(q.type === 'mcq' || q.type === 'true_false' || q.type === 'code_output') && q.options?.length > 0 && (
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const optKey = opt.match(/^([A-D])\)/)?.[1] || String.fromCharCode(65 + i)
            const isSelected = userAnswer === optKey || userAnswer === opt
            return (
              <button
                key={i}
                onClick={() => onAnswer(q.type === 'true_false' ? opt : optKey)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-800'
                    : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 ${
                  isSelected ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {q.type === 'true_false' ? (i === 0 ? 'T' : 'F') : optKey}
                </span>
                {opt.replace(/^[A-D]\)\s*/, '')}
              </button>
            )
          })}
        </div>
      )}

      {/* Fill in the Blank */}
      {q.type === 'fill_blank' && (
        <div>
          <input
            value={textVal}
            onChange={e => handleText(e.target.value)}
            placeholder="Type your answer here…"
            className="input text-base"
          />
        </div>
      )}

      {/* Short Answer */}
      {q.type === 'short_answer' && (
        <div>
          <textarea
            value={textVal}
            onChange={e => handleText(e.target.value)}
            placeholder="Explain in 2-3 sentences…"
            rows={4}
            maxLength={500}
            className="input resize-none text-sm leading-relaxed"
          />
          <p className="text-xs text-slate-400 mt-1 text-right">{textVal.length}/500 characters</p>
        </div>
      )}
    </div>
  )
}

// ── Submit Confirm Modal ─────────────────

const SubmitModal = ({ answered, flagged, total, onCancel, onConfirm, submitting }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Ready to Submit?</h3>
      <div className="space-y-2 mb-5">
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1.5 text-green-600"><CheckCircle className="w-4 h-4" /> Answered</span>
          <span className="font-semibold">{answered}/{total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1.5 text-yellow-600"><Flag className="w-4 h-4" /> Flagged</span>
          <span className="font-semibold">{flagged}</span>
        </div>
        {total - answered > 0 && (
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1.5 text-red-500"><AlertTriangle className="w-4 h-4" /> Unanswered (marked wrong)</span>
            <span className="font-semibold">{total - answered}</span>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={submitting} className="flex-1 btn-secondary text-sm py-2.5">
          Go Back
        </button>
        <button onClick={onConfirm} disabled={submitting}
          className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit Now</>}
        </button>
      </div>
    </motion.div>
  </div>
)

// ── Evaluating Screen ────

const EvaluatingScreen = () => {
  const [step, setStep] = useState(0)
  const steps = [
    '🤖 AI is evaluating your answers…',
    '📊 Calculating your score…',
    '📝 Generating detailed explanations…',
    '💡 Preparing your improvement plan…',
    '🎯 Almost done — getting your results…',
  ]
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center mb-6 animate-pulse-ring">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Evaluating Your Answers</h2>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-slate-400 text-lg"
        >
          {steps[step]}
        </motion.p>
      </AnimatePresence>
      <p className="text-slate-600 text-sm mt-4">This takes 10–20 seconds…</p>
    </div>
  )
}

// ── Main Test Page ──────────────

export default function Test() {
  const { sessionId } = useParams()
  const navigate      = useNavigate()

  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers]     = useState({})   // { questionId: answer }
  const [flagged, setFlagged]     = useState(new Set())
  const [timeLeft, setTimeLeft]   = useState(0)
  const [timed, setTimed]         = useState(false)
  const [questionTimes, setQuestionTimes] = useState({}) // time spent per question
  const [qStartTime, setQStartTime] = useState(Date.now())
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [timerWarning, setTimerWarning] = useState(null)
  const [meta, setMeta]           = useState(null)
  const timerRef = useRef()
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    testAPI.getSession(sessionId)
      .then(r => {
        const sess = r.data.session
        setQuestions(sess.questions || [])
        setMeta({ stacks: sess.selectedStacks, level: sess.level })
        if (sess.timeLimit > 0) {
          setTimeLeft(sess.timeLimit)
          setTimed(true)
        }
      })
      .catch(() => navigate('/upload'))
      .finally(() => setLoading(false))
  }, [sessionId])

  // Timer
  useEffect(() => {
    if (!timed || !timeLeft) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 120 && t > 60) setTimerWarning('yellow')
        if (t <= 60) setTimerWarning('red')
        if (t <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timed])

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  const navigateTo = (idx) => {
    // Save time on current question
    const elapsed = Math.round((Date.now() - qStartTime) / 1000)
    setQuestionTimes(prev => ({ ...prev, [questions[currentIdx]?.id]: (prev[questions[currentIdx]?.id] || 0) + elapsed }))
    setQStartTime(Date.now())
    setCurrentIdx(idx)
  }

  const handleAnswer = (answer) => {
    setAnswers(prev => ({ ...prev, [questions[currentIdx].id]: answer }))
  }

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev)
      const id = questions[currentIdx].id
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const buildAnswerPayload = () =>
    questions.map(q => ({
      questionId: q.id,
      answer:     answers[q.id] || '',
      timeTaken:  questionTimes[q.id] || 0,
      flagged:    flagged.has(q.id),
    }))

  const handleSubmit = async () => {
    setSubmitting(true)
    clearInterval(timerRef.current)
    try {
      const elapsed = Math.round((Date.now() - qStartTime) / 1000)
      const activeId = questions[currentIdx]?.id
      const finalQuestionTimes = activeId
        ? { ...questionTimes, [activeId]: (questionTimes[activeId] || 0) + elapsed }
        : questionTimes
      const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000)
      await testAPI.submit(sessionId, {
        answers: questions.map(q => ({
          questionId: q.id,
          answer: answers[q.id] || '',
          timeTaken: finalQuestionTimes[q.id] || 0,
          flagged: flagged.has(q.id),
        })),
        totalTimeTaken: totalTime,
      })
      setShowSubmit(false)
      setEvaluating(true)
      

      const poll = setInterval(async () => {
        try {
          const s = await testAPI.getStatus(sessionId)
          if (s.data.status === 'evaluated') {
            clearInterval(poll)
            navigate(`/results/${sessionId}`)
          }
        } catch { clearInterval(poll); navigate(`/results/${sessionId}`) }
      }, 2000)
    } catch {
      setSubmitting(false)
    }
  }

  const handleAutoSubmit = () => {
    setShowSubmit(true) // Show modal briefly then auto-submit
    setTimeout(handleSubmit, 3000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  if (!questions.length) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <AlertCircle className="w-10 h-10 text-amber-500" />
      <div>
        <h1 className="font-bold text-slate-900">No questions found</h1>
        <p className="text-sm text-slate-500 mt-1">This interview session may have expired or could not be generated.</p>
      </div>
      <button onClick={() => navigate('/upload')} className="btn-primary">Create a new interview</button>
    </div>
  )

  if (evaluating) return <EvaluatingScreen />

  const q          = questions[currentIdx]
  const answered   = Object.keys(answers).filter(k => answers[k]).length
  const flaggedIds = [...flagged]
  const progress   = questions.length ? (currentIdx + 1) / questions.length : 0

  const statusIcon = (q) => {
    const id = q.id
    if (id === questions[currentIdx]?.id) return '🔵'
    if (answers[id]) return '✅'
    if (flagged.has(id)) return '⚠️'
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 inset-x-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-semibold text-slate-900 text-sm truncate hidden sm:block">
                Mock Interview{meta?.stacks?.length ? ` — ${meta.stacks.slice(0,2).join(' + ')}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              {timed && (
                <div className={`flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1.5 rounded-lg ${
                  timerWarning === 'red'    ? 'bg-red-100 text-red-600 animate-pulse' :
                  timerWarning === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
                </div>
              )}

              {/* Progress */}
              <span className="text-sm text-slate-500 hidden sm:block">
                {currentIdx + 1}/{questions.length}
              </span>

              {/* Submit */}
              <button
                onClick={() => setShowSubmit(true)}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div className="h-1 bg-primary-500 transition-all duration-300" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Timer warnings */}
      {timerWarning && timed && (
        <div className={`fixed top-16 inset-x-0 z-20 text-center py-2 text-sm font-medium ${
          timerWarning === 'red'
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-yellow-400 text-yellow-900'
        }`}>
          {timerWarning === 'red' ? '🔴 Under 1 minute left! Consider submitting.' : '⏰ Under 2 minutes left!'}
        </div>
      )}

      <div className="flex flex-1 pt-16 max-w-7xl mx-auto w-full">
        {/* Left — Navigator */}
        <div className="hidden lg:flex flex-col w-56 xl:w-64 flex-shrink-0 p-4 border-r border-slate-200 bg-white">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Question Map</p>
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {questions.map((question, i) => {
                const isCurrent  = i === currentIdx
                const isAnswered = !!answers[question.id]
                const isFlagged  = flagged.has(question.id)
                return (
                  <button
                    key={i}
                    onClick={() => navigateTo(i)}
                    className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                      isCurrent  ? 'bg-primary-500 text-white ring-2 ring-primary-300' :
                      isAnswered ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                      isFlagged  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                      'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                    {isFlagged && <span className="absolute -top-1 -right-1 text-xs">⚠</span>}
                  </button>
                )
              })}
            </div>

            <div className="text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-100 border border-green-200 inline-block" /> Answered ({answered})</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary-500 inline-block" /> Current</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-200 inline-block" /> Flagged ({flagged.size})</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 inline-block" /> Not visited</div>
            </div>
          </div>
        </div>

        {/* Main — Question */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            {q && (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <QuestionCard
                  q={q}
                  userAnswer={answers[q.id] || ''}
                  onAnswer={handleAnswer}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border-2 transition-all ${
                  flagged.has(q?.id)
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                    : 'border-slate-200 text-slate-500 hover:border-yellow-300'
                }`}
              >
                <Flag className="w-4 h-4" /> {flagged.has(q?.id) ? 'Unflag' : 'Flag'}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => currentIdx > 0 && navigateTo(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => navigateTo(currentIdx + 1)}
                  className="btn-primary text-sm py-2.5 px-4 flex items-center gap-1.5"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmit(true)}
                  className="btn-primary text-sm py-2.5 px-4 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Submit Test
                </button>
              )}
            </div>
          </div>

          {/* Mobile navigator */}
          <div className="lg:hidden mt-4 overflow-x-auto scrollbar-hide flex gap-1.5 pb-1">
            {questions.map((question, i) => (
              <button
                key={i}
                onClick={() => navigateTo(i)}
                className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-bold ${
                  i === currentIdx ? 'bg-primary-500 text-white' :
                  answers[question.id] ? 'bg-green-100 text-green-700' :
                  flagged.has(question.id) ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showSubmit && (
        <SubmitModal
          answered={answered}
          flagged={flagged.size}
          total={questions.length}
          onCancel={() => !submitting && setShowSubmit(false)}
          onConfirm={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  )
}
