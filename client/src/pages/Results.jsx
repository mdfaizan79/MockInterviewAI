import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, XCircle, ChevronDown, ChevronUp, Download, RefreshCw,
  Target, BarChart2, Brain, Zap, Trophy, Clock, ArrowRight, Loader2,
  BookOpen, AlertCircle, Star, Share2
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts'
import { resultsAPI } from '../services/api'

const ScoreRing = ({ pct, size = 140 }) => {
  const sw = 12
  const r  = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#f59e0b' : pct >= 40 ? '#f97316' : '#ef4444'
  const grade = pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 60 ? 'Average' : pct >= 40 ? 'Needs Work' : 'Poor'
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-slate-900">{pct}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold mt-1" style={{ color }}>{grade}</span>
    </div>
  )
}

const QuestionReviewCard = ({ q, index }) => {
  const [open, setOpen] = useState(false)

  const isCorrect  = q.correct || q.partialScore >= 0.8
  const isPartial  = !isCorrect && q.partialScore >= 0.4
  const isWrong    = !isCorrect && !isPartial

  const headerStyle = isCorrect ? 'border-green-200 bg-green-50' :
                      isPartial ? 'border-yellow-200 bg-yellow-50' :
                      'border-red-100 bg-red-50'

  const icon = isCorrect
    ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
    : isPartial
      ? <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
      : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />

  const scoreText = isCorrect ? '+1 point' : isPartial ? '~0.5 point' : '0 points'


// Extract Code
  const codeMatch = q.question.match(/```[\s\S]*?```/)
  const questionText = q.question.replace(/```[\s\S]*?```/, '').trim()
  const codeContent  = codeMatch ? codeMatch[0].replace(/```\w*\n?/, '').replace(/```/, '') : null

  return (
    <div className={`border rounded-2xl overflow-hidden transition-shadow hover:shadow-md ${headerStyle}`}>
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setOpen(o => !o)}>
        {icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold text-slate-500">Q{index + 1}</span>
            {q.tech && <span className="badge badge-tech text-xs">{q.tech}</span>}
            {q.difficulty && <span className={`badge badge-${q.difficulty} text-xs`}>{q.difficulty}</span>}
            <span className={`text-xs font-semibold ${isCorrect ? 'text-green-600' : isPartial ? 'text-yellow-600' : 'text-red-600'}`}>
              {scoreText}
            </span>
            {q.flagged && <span className="text-xs text-yellow-600">🚩 Flagged</span>}
          </div>
          <p className="text-sm font-medium text-slate-800 line-clamp-2">{questionText}</p>
        </div>
        <div className="flex-shrink-0 ml-2">
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-t border-slate-100 p-5 space-y-4">
              {codeContent && <div className="code-block text-xs">{codeContent}</div>}

              {/* Answers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Your Answer</p>
                  <div className={`flex items-start gap-2 text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    <span>{q.userAnswer || <em className="text-slate-400">No answer</em>}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Correct Answer</p>
                  <div className="flex items-start gap-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{q.correctAnswer}</span>
                  </div>
                </div>
              </div>

              {/* Short answer AI evaluation */}
              {q.aiEvaluation && (
                <div className="space-y-3">
                  {q.aiEvaluation.whatWasRight?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1.5">✅ What You Got Right</p>
                      <ul className="space-y-1">
                        {q.aiEvaluation.whatWasRight.map((w, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" /> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {q.aiEvaluation.whatWasMissing?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1.5">❌ What Was Missing</p>
                      <ul className="space-y-1">
                        {q.aiEvaluation.whatWasMissing.map((w, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" /> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {q.aiEvaluation.idealAnswer && (
                    <div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1.5">✅ Complete Ideal Answer</p>
                      <p className="text-sm text-slate-700 bg-blue-50 rounded-xl p-3 leading-relaxed">{q.aiEvaluation.idealAnswer}</p>
                    </div>
                  )}
                  {q.aiEvaluation.specificFeedback && (
                    <p className="text-sm text-slate-600 italic border-l-2 border-primary-300 pl-3">{q.aiEvaluation.specificFeedback}</p>
                  )}
                </div>
              )}

              {/* Explanation */}
              {q.explanation && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Detailed Explanation</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3">{q.explanation}</p>
                </div>
              )}

              {/* Why others wrong (MCQ) */}
              {q.whyOthersWrong && Object.keys(q.whyOthersWrong).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Why Other Options Are Wrong</p>
                  <div className="space-y-2">
                    {Object.entries(q.whyOthersWrong).map(([opt, reason]) => (
                      <div key={opt} className="flex items-start gap-2 text-sm">
                        <span className="font-bold text-red-500 flex-shrink-0">❌ {opt})</span>
                        <span className="text-slate-600">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real world context */}
              {q.realWorldContext && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">💡 Real-World Context</p>
                  <p className="text-sm text-amber-800">{q.realWorldContext}</p>
                </div>
              )}

              {/* Topics & Resources */}
              {(q.topicsToStudy?.length > 0 || q.resources?.length > 0) && (
                <div className="flex flex-wrap gap-4">
                  {q.topicsToStudy?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 font-semibold mb-1">Topics to Study</p>
                      <div className="flex flex-wrap gap-1">
                        {q.topicsToStudy.map(t => (
                          <span key={t} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {q.resources?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 font-semibold mb-1">📚 Resources</p>
                      <div className="flex flex-wrap gap-1">
                        {q.resources.map((r, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Results() {
  const { sessionId } = useParams()
  const navigate      = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('all')
  const reportRef = useRef()

  useEffect(() => {
    let active = true
    let poll
    const fetchResults = async () => {
      try {
        const r = await resultsAPI.get(sessionId)
        if (r.data.results) {
          if (!active) return
          setData(r.data)
          setLoading(false)
          clearInterval(poll)
        }
      } catch {
        if (!active) return
        setLoadError('We could not load this result. Please check that the server is running and try again.')
        setLoading(false)
      }
    }
    fetchResults()
    poll = setInterval(fetchResults, 2000)
    return () => { active = false; clearInterval(poll) }
  }, [sessionId])

  if (loadError) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <AlertCircle className="w-10 h-10 text-red-500" />
      <div><h1 className="font-bold text-slate-900">Results unavailable</h1><p className="text-sm text-slate-500 mt-1">{loadError}</p></div>
      <button onClick={() => navigate('/upload')} className="btn-primary">Start a new interview</button>
    </div>
  )

  if (loading || !data) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      <p className="text-slate-500">Loading your results…</p>
    </div>
  )
  const { session, results, questions, improvementPlan, badges } = data
  const { percentage, totalScore, maxScore, categoryScores = {}, difficultyScores = {}, typeScores = {} } = results

  const catData = Object.entries(categoryScores)
    .map(([name, v]) => ({ name, score: v.pct, correct: v.correct, total: v.total }))
    .sort((a, b) => b.score - a.score)

  const diffData = Object.entries(difficultyScores)
    .map(([name, v]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), score: v.pct }))

  const radarData = catData.slice(0, 6).map(c => ({ subject: c.name, score: c.score }))

  const filteredQs = questions.filter(q => {
    if (filter === 'correct')  return q.correct || q.partialScore >= 0.8
    if (filter === 'wrong')    return !q.correct && q.partialScore < 0.8
    if (filter === 'flagged')  return q.flagged
    return true
  })

  const timeFmt = (s) => {
    const m = Math.floor(s / 60), sec = s % 60
    return `${m}m ${sec}s`
  }

  const planLines = improvementPlan ? improvementPlan.split('\n').filter(l => l.trim()) : []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/upload')} className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1">
            ← New Test
          </button>
          <span className="font-semibold text-slate-900 text-sm">Mock Interview Results</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                try {
                  const text = `I scored ${percentage}% on my Mock Interview!\nStacks: ${session.selectedStacks?.join(', ')}\nScore: ${totalScore}/${maxScore}\n\nTest yours at MockAI!`
                  navigator.clipboard.writeText(text)
                  alert('Score copied to clipboard!')
                } catch { alert('Copy score manually') }
              }}
              className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* ── SECTION 1 — Score Hero ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card p-6 lg:p-8 bg-gradient-to-br from-white to-slate-50"
        >
          <div className="text-center mb-6">
            <p className="text-slate-400 text-sm mb-1">
              {session.selectedStacks?.join(' + ')} · {session.level} Level · {session.candidateName || 'Candidate'}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Mock Interview Results</h1>
          </div>

          <div className="flex flex-col items-center gap-4 mb-6">
            <ScoreRing pct={percentage} />
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{totalScore}/{maxScore} correct</p>
              {results.timeTaken > 0 && (
                <p className="text-sm text-slate-400">
                  Time: {timeFmt(results.timeTaken)} · Avg: {timeFmt(Math.round(results.timeTaken / questions.length))}/Q
                </p>
              )}
            </div>
          </div>

          {/* Score progress bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative h-3 bg-gradient-to-r from-red-300 via-yellow-300 via-green-300 to-green-500 rounded-full">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-2 border-slate-400 shadow-md transition-all duration-1000"
                style={{ left: `calc(${percentage}% - 10px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Needs Work</span><span>Average</span><span>Good</span><span>Excellent</span>
            </div>
          </div>

          {/* Badges */}
          {badges?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {badges.map((b, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-sm">
                  <span className="text-lg">{b.emoji}</span>
                  <div>
                    <p className="font-semibold text-amber-800 text-xs">{b.title}</p>
                    <p className="text-amber-600 text-xs">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <button onClick={() => navigate('/upload')} className="btn-primary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> New Test
            </button>
            <button onClick={() => navigate(`/upload`)} className="btn-secondary flex items-center gap-2">
              🎯 Focus on Weak Areas
            </button>
          </div>
        </motion.div>

        {/* ── SECTION 2 — Category Breakdown ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category bars */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary-600" /> Tech Stack Breakdown
            </h3>
            {catData.map(item => (
              <div key={item.name} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{item.correct}/{item.total} · {item.score}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${item.score}%`,
                      background: item.score >= 80 ? '#16a34a' : item.score >= 60 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-sm font-semibold text-slate-600 mb-2">By Difficulty</h4>
              {diffData.map(d => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className={`badge text-xs ${d.name === 'Easy' ? 'badge-easy' : d.name === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                    {d.name}
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full">
                    <div className="h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${d.score}%`, background: d.score >= 80 ? '#16a34a' : d.score >= 60 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span className="text-xs text-slate-500 w-8">{d.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar chart */}
          {radarData.length >= 3 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-4">Performance Radar</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} tickCount={4} />
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* ── SECTION 3 — Q&A Review ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-600" /> Question-by-Question Review
            </h3>
            <div className="flex gap-2">
              {[
                { id: 'all',     label: `All (${questions.length})` },
                { id: 'correct', label: `✅ Correct (${questions.filter(q => q.correct || q.partialScore >= 0.8).length})` },
                { id: 'wrong',   label: `❌ Wrong (${questions.filter(q => !q.correct && q.partialScore < 0.8).length})` },
                { id: 'flagged', label: `🚩 Flagged (${questions.filter(q => q.flagged).length})` },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    filter === f.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >{f.label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredQs.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <QuestionReviewCard q={q} index={questions.indexOf(q)} />
              </motion.div>
            ))}
          </div>
        </motion.div>


        {/* ---Improvement Plan ── */}
        {planLines.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="card p-6 bg-gradient-to-br from-slate-900 to-primary-950 border-0"
          >
            <h3 className="font-bold text-white text-lg mb-5 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-400" /> 🤖 Your AI-Generated Improvement Plan
            </h3>
            <div className="space-y-2">
              {planLines.map((line, i) => {
                const isSection = line.startsWith('#') || line.startsWith('**') || /^[🔴🟡🟢📅]/.test(line)
                return isSection ? (
                  <p key={i} className="text-primary-300 font-semibold mt-4 first:mt-0 text-sm">{line.replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, '')}</p>
                ) : (
                  <p key={i} className="text-slate-300 text-sm pl-4 leading-relaxed">{line}</p>
                )
              })}
            </div>
          </motion.div>
        )}

        {/*─ CTA ──*/}
        <div className="flex flex-wrap gap-3 pb-8">
          <button onClick={() => navigate('/upload')} className="btn-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retake Same Test
          </button>
          <button onClick={() => navigate('/upload')} className="btn-secondary flex items-center gap-2">
            🆕 Generate New Test
          </button>
          <button onClick={() => navigate('/')} className="btn-ghost">
            ← Home
          </button>
        </div>
      </div>
    </div>
  )
}
