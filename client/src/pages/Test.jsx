import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Flag, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle,
  Send, Loader2, Eye, EyeOff, AlertCircle, Brain, X
} from 'lucide-react'
import { testAPI } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

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

// ── Question Card ────────────

const QuestionCard = ({ q, userAnswer, onAnswer }) => {
  const [textVal, setTextVal] = useState(userAnswer || '')

  useEffect(() => { setTextVal(userAnswer || '') }, [q.id])

  const handleText = (val) => {
    setTextVal(val)
    onAnswer(val)
  }

  const diff = DIFF_STYLE[q.difficulty] || DIFF_STYLE.medium

  const codeMatch = q.question.match(/```[\s\S]*?```/)
  const questionText = q.question.replace(/```[\s\S]*?```/, '').trim()
  const codeContent  = codeMatch ? codeMatch[0].replace(/```\w*\n?/, '').replace(/```/, '') : null

  return (
    <div className="card p-6 lg:p-10 border-transparent shadow-2xl shadow-primary-500/5 transition-all">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">{TYPE_LABEL[q.type] || q.type}</span>
        <span className={`badge ${diff.cls} font-bold uppercase tracking-wider`}>{diff.label}</span>
        {q.tech && <span className="badge badge-tech font-bold uppercase tracking-wider">{q.tech}</span>}
      </div>

      <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed mb-8">
        {questionText}
      </h2>

      {/* Code block */}
      {codeContent && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
           <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800">Code Snippet</div>
           <div className="code-block !rounded-none">{codeContent}</div>
        </div>
      )}

      {/* MCQ / True-False / Code Output */}
      {(q.type === 'mcq' || q.type === 'true_false' || q.type === 'code_output') && q.options?.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, i) => {
            const optKey = opt.match(/^([A-D])\)/)?.[1] || String.fromCharCode(65 + i)
            const isSelected = userAnswer === optKey || userAnswer === opt
            return (
              <button
                key={i}
                onClick={() => onAnswer(q.type === 'true_false' ? opt : optKey)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 shadow-lg shadow-primary-500/5'
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-200 dark:hover:border-primary-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-colors shadow-sm ${
                  isSelected ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {q.type === 'true_false' ? (i === 0 ? 'T' : 'F') : optKey}
                </div>
                <span className="font-semibold">{opt.replace(/^[A-D]\)\s*/, '')}</span>
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
            className="input text-lg font-semibold"
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
            rows={5}
            maxLength={500}
            className="input resize-none text-base leading-relaxed font-medium"
          />
          <div className="flex justify-between items-center mt-3">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI will evaluate based on accuracy and clarity</p>
             <p className="text-xs text-slate-400 font-bold">{textVal.length}/500</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Submit Confirm Modal ─────────────────

const SubmitModal = ({ answered, flagged, total, onCancel, onConfirm, submitting }) => (
  <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] border border-white dark:border-slate-800 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-600" />
      
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Ready to Submit?</h3>
         <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
         </button>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/50">
          <span className="flex items-center gap-3 text-green-700 dark:text-green-400 font-bold text-sm">
             <CheckCircle className="w-5 h-5" /> Answered
          </span>
          <span className="font-black text-green-800 dark:text-green-300">{answered}/{total}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-900/50">
          <span className="flex items-center gap-3 text-yellow-700 dark:text-yellow-400 font-bold text-sm">
             <Flag className="w-5 h-5" /> Flagged
          </span>
          <span className="font-black text-yellow-800 dark:text-yellow-300">{flagged}</span>
        </div>

        {total - answered > 0 && (
          <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/50">
            <span className="flex items-center gap-3 text-red-600 dark:text-red-400 font-bold text-sm">
               <AlertTriangle className="w-5 h-5" /> Unanswered
            </span>
            <span className="font-black text-red-700 dark:text-red-300">{total - answered}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={onConfirm} disabled={submitting}
          className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-base shadow-xl shadow-primary-500/20">
          {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <><Send className="w-5 h-5" /> Finish Test</>}
        </button>
        <button onClick={onCancel} disabled={submitting} className="w-full text-slate-400 dark:text-slate-500 font-bold text-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2">
          Keep Working
        </button>
      </div>
    </motion.div>
  </div>
)

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
    <div className="min-h-screen bg-[#fcfcff] dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center transition-colors duration-300">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-primary-600/10 dark:bg-primary-500/10 flex items-center justify-center mb-8 relative z-10 animate-pulse-ring">
          <Brain className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-500/20 blur-[60px] animate-pulse pointer-events-none" />
      </div>
      
      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Evaluating Performance</h2>
      
      <div className="h-12 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-primary-600 dark:text-primary-400 text-lg font-bold"
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
      </div>
      
      <p className="text-slate-400 dark:text-slate-600 text-sm mt-8 font-medium">This takes about 15–20 seconds…</p>
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
    <div className="min-h-screen bg-[#fcfcff] dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
       <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-600/10 flex items-center justify-center animate-pulse">
             <Brain className="w-8 h-8 text-primary-600 animate-bounce" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Initializing Environment</p>
       </div>
    </div>
  )

  if (!questions.length) return (
    <div className="min-h-screen bg-[#fcfcff] dark:bg-slate-950 flex flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-2">
         <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Session Expired</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">This interview session could not be retrieved. Please start a new one.</p>
      </div>
      <button onClick={() => navigate('/upload')} className="btn-primary px-8">Create New Interview</button>
    </div>
  )

  if (evaluating) return <EvaluatingScreen />

  const q          = questions[currentIdx]
  const answered   = Object.keys(answers).filter(k => answers[k]).length
  const progress   = questions.length ? (currentIdx + 1) / questions.length : 0

  return (
    <div className="min-h-screen bg-[#fcfcff] dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 inset-x-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6 min-w-0">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-base hidden sm:block">Mock Interview</span>
               </div>
               
               <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
               
               <div className="hidden md:flex items-center gap-2">
                  {meta?.stacks?.slice(0, 2).map(s => (
                    <span key={s} className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">{s}</span>
                  ))}
               </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              {timed && (
                <div className={`flex items-center gap-2 font-black text-xs px-4 py-2 rounded-xl transition-colors ${
                  timerWarning === 'red'    ? 'bg-red-600 text-white animate-pulse' :
                  timerWarning === 'yellow' ? 'bg-yellow-500 text-yellow-900 shadow-lg shadow-yellow-500/10' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
                </div>
              )}

              {/* Progress Count */}
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:block">
                 Question <span className="text-slate-900 dark:text-white">{currentIdx + 1}</span> of {questions.length}
              </div>

              <div className="flex items-center gap-3">
                 <ThemeToggle />
                 <button
                  onClick={() => setShowSubmit(true)}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-2 shadow-lg shadow-primary-500/10"
                >
                  <Send className="w-4 h-4" /> Finish
                </button>
              </div>
            </div>
          </div>

          {/* Smooth Progress bar */}
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 absolute bottom-0 left-0">
            <motion.div 
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 pt-24 pb-32 max-w-7xl mx-auto w-full px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          
          {/* Navigator (Sidebar) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-28 h-fit">
            <div className="card p-6 border-transparent bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Question Map</p>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, i) => {
                  const isCurrent  = i === currentIdx
                  const isAnswered = !!answers[question.id]
                  const isFlagged  = flagged.has(question.id)
                  return (
                    <button
                      key={i}
                      onClick={() => navigateTo(i)}
                      className={`aspect-square rounded-xl text-xs font-black transition-all border-2 ${
                        isCurrent  ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20 scale-110' :
                        isAnswered ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' :
                        isFlagged  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/50 text-yellow-700 dark:text-yellow-400' :
                        'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>

              <div className="mt-8 space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</span>
                    <span className="text-xs font-black text-emerald-600">{Math.round((answered / questions.length) * 100)}%</span>
                 </div>
                 <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${(answered / questions.length) * 100}%` }} className="h-full bg-emerald-500" />
                 </div>
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-9 flex flex-col min-w-0">
            <AnimatePresence mode="wait">
              {q && (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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

            {/* Sticky Mobile Nav / Footer Desktop Nav */}
            <div className="fixed bottom-0 inset-x-0 lg:static bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 p-4 lg:bg-transparent lg:border-none lg:p-0 lg:mt-8 z-40">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleFlag}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black border-2 transition-all ${
                      flagged.has(q?.id)
                        ? 'border-yellow-400 bg-yellow-400 text-white shadow-lg shadow-yellow-500/20'
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-yellow-200'
                    }`}
                  >
                    <Flag className={`w-4 h-4 ${flagged.has(q?.id) ? 'fill-white' : ''}`} /> 
                    {flagged.has(q?.id) ? 'FLAGGED' : 'FLAG'}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => currentIdx > 0 && navigateTo(currentIdx - 1)}
                    disabled={currentIdx === 0}
                    className="p-3 lg:px-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400 font-bold disabled:opacity-30 flex items-center gap-2 hover:border-primary-200 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" /> <span className="hidden lg:inline">Previous</span>
                  </button>
                  
                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => navigateTo(currentIdx + 1)}
                      className="px-8 py-3 lg:px-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black flex items-center gap-3 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5"
                    >
                      Next <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmit(true)}
                      className="px-8 py-3 lg:px-10 rounded-2xl bg-primary-600 text-white font-black flex items-center gap-3 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-primary-500/20"
                    >
                      Review & Submit <Send className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Mobile Question Map Indicator */}
              <div className="lg:hidden mt-4 flex gap-1 justify-center">
                 {questions.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all ${i === currentIdx ? 'w-4 bg-primary-600' : 'w-1.5 bg-slate-200 dark:bg-slate-800'}`} />
                 ))}
              </div>
            </div>
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
