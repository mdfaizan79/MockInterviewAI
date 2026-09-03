import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud, FileText, CheckCircle, Loader2, X, Plus, ChevronRight,
  Brain, User, Briefcase, GraduationCap, Wrench, Folder, Building2, AlertCircle
} from 'lucide-react'
import { resumeAPI, testAPI } from '../services/api'


const STACKS = {
  '🔵 Frontend':  ['React', 'Vue', 'Angular', 'Next.js', 'HTML/CSS', 'TypeScript'],
  '🟢 Backend':   ['Node.js', 'Express', 'Django', 'FastAPI', 'Spring Boot', 'Go'],
  '🗄️ Database': ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Elasticsearch'],
  '☁️ DevOps':   ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform'],
  '🐍 Language':  ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'Rust'],
  '🤖 AI/ML':     ['TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'LangChain'],
}

const LEVELS = [
  { id: 'fresher', label: 'Fresher',   sub: '0–1 year',  desc: 'Basic concepts & fundamentals' },
  { id: 'junior',  label: 'Junior',    sub: '1–3 years', desc: 'Core concepts + problem solving' },
  { id: 'mid',     label: 'Mid-Level', sub: '3–5 years', desc: 'In-depth + architectural thinking' },
  { id: 'senior',  label: 'Senior',    sub: '5+ years',  desc: 'Advanced + system design' },
]

const Q_TYPES = [
  { id: 'mcq',          label: 'Multiple Choice',    sub: '4 options, 1 correct' },
  { id: 'true_false',   label: 'True / False',       sub: 'Quick concept checks' },
  { id: 'fill_blank',   label: 'Fill in the Blank',  sub: 'Code completions' },
  { id: 'short_answer', label: 'Short Answer',       sub: 'Explain in 2-3 lines' },
  { id: 'code_output',  label: 'Code Output',        sub: 'What does this print?' },
]

const TONES = [
  { id: 'campus',     label: 'Campus / Entry Level' },
  { id: 'technical',  label: 'Technical Job Interview' },
  { id: 'senior',     label: 'Senior / Architect Level' },
  { id: 'faang',      label: 'FAANG Style' },
]

const COUNTS = [10, 15, 20]
const TIME_PER_Q = 90 

const UploadSection = ({ onParsed }) => {
  const [dragOver, setDragOver]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [steps, setSteps]         = useState([])
  const [parsed, setParsed]       = useState(null)
  const [error, setError]         = useState('')
  const [editSkills, setEditSkills] = useState(false)
  const [newSkill, setNewSkill]   = useState('')
  const inputRef = useRef()

  const UPLOAD_STEPS = [
    'Resume uploaded successfully',
    'Reading your resume…',
    'Extracting skills and experience…',
    'Identifying tech stack…',
  ]

  const processFile = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are supported. Please export legacy .doc files as .docx first.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }

    setError('')
    setUploading(true)
    setSteps([0])

    // Fake step animation while parsing
    const stepTimer = setInterval(() => {
      setSteps(prev => prev.length < UPLOAD_STEPS.length - 1 ? [...prev, prev.length] : prev)
    }, 700)

    try {
      const form = new FormData()
      form.append('resume', file)
      const r = await resumeAPI.parse(form)
      clearInterval(stepTimer)
      setSteps([0, 1, 2, 3])
      setParsed(r.data.data)
      onParsed(r.data.data)
    } catch (e) {
      clearInterval(stepTimer)
      setError(e.response?.data?.message || 'Failed to parse resume. Please try again.')
      setSteps([])
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }, [])

  const removeSkill = (skill) => {
    setParsed(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }))
    onParsed({ ...parsed, skills: parsed.skills.filter(s => s !== skill) })
  }

  const addSkill = () => {
    if (newSkill.trim() && !parsed.skills.includes(newSkill.trim())) {
      const updated = { ...parsed, skills: [...parsed.skills, newSkill.trim()] }
      setParsed(updated)
      onParsed(updated)
    }
    setNewSkill('')
  }

  return (
    <div className="space-y-4">
      {!parsed ? (
        <>
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              dragOver ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
            }`}
          >
            <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden"
              onChange={e => processFile(e.target.files[0])} />

            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                <div className="space-y-2 w-full max-w-sm mx-auto text-left">
                  {UPLOAD_STEPS.map((step, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm transition-all ${
                      steps.includes(i) ? 'text-primary-700' : 'text-slate-300'
                    }`}>
                      {steps.includes(i)
                        ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                      }
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-lg font-semibold text-slate-700 mb-1">Drag & Drop Your Resume Here</p>
                <p className="text-sm text-slate-400 mb-4">Supports: PDF, DOCX (Max: 5MB)</p>
                <div className="flex items-center gap-3 justify-center">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-xs text-slate-400">or</span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
                <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                  <UploadCloud className="w-4 h-4" /> Browse Files
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </>
      ) : (
        /* Parsed Resume Card */
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-green-700 font-semibold mb-4">
            <CheckCircle className="w-5 h-5" /> Resume Analyzed Successfully
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {parsed.name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-medium">{parsed.name}</span>
              </div>
            )}
            {parsed.experience && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{parsed.experience}</span>
              </div>
            )}
            {parsed.education && (
              <div className="col-span-2 flex items-start gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{parsed.education}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Folder className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">{parsed.projects || 0} projects</span>
            </div>
            {parsed.companies?.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{parsed.companies.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> Skills Detected ({parsed.skills?.length || 0})
              </p>
              <button
                onClick={() => setEditSkills(e => !e)}
                className="text-xs text-primary-600 hover:underline"
              >
                {editSkills ? 'Done' : '✏️ Edit Skills'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsed.skills?.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-green-200 text-green-700 text-xs rounded-full">
                  {skill}
                  {editSkills && (
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {editSkills && (
                <div className="inline-flex items-center gap-1">
                  <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                    placeholder="Add skill…"
                    className="w-24 text-xs px-2 py-1 border border-slate-200 rounded-full focus:outline-none focus:border-primary-400"
                  />
                  <button onClick={addSkill} className="text-primary-600 hover:text-primary-700">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => { setParsed(null); setSteps([]); onParsed(null) }}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            × Upload a different resume
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Upload Page ───────────────────────────────────────────
export default function Upload() {
  const navigate = useNavigate()

  // Resume data
  const [resumeData, setResumeData] = useState(null)

  // Config state
  const [selectedStacks, setSelectedStacks] = useState([])
  const [level, setLevel]   = useState('junior')
  const [qCount, setQCount] = useState(10)
  const [qTypes, setQTypes] = useState(['mcq', 'true_false'])
  const [difficulty, setDifficulty] = useState({ easy: 30, medium: 50, hard: 20 })
  const [timed, setTimed]   = useState(true)
  const [timePerQ, setTimePerQ] = useState(90)
  const [tone, setTone]     = useState('technical')

  const [generating, setGenerating] = useState(false)
  const [genError, setGenError]     = useState('')

  const toggleStack = (stack) => {
    setSelectedStacks(prev =>
      prev.includes(stack) ? prev.filter(s => s !== stack) : [...prev, stack]
    )
  }

  const toggleType = (t) => {
    setQTypes(prev =>
      prev.includes(t)
        ? prev.length > 1 ? prev.filter(x => x !== t) : prev  // keep at least 1
        : [...prev, t]
    )
  }

  const handleGenerate = async () => {
    if (!resumeData) { setGenError('Please upload your resume first'); return }
    if (selectedStacks.length === 0) { setGenError('Please select at least one tech stack'); return }

    setGenError('')
    setGenerating(true)

    try {
      const r = await testAPI.generate({
        resumeText:    resumeData.rawText,
        resumeSummary: resumeData.summary,
        resumeSkills:  resumeData.skills || [],
        candidateName: resumeData.name,
        candidateExp:  resumeData.experience,
        candidateEdu:  resumeData.education,
        selectedStacks,
        difficulty,
        questionCount: qCount,
        questionTypes: qTypes,
        timeLimit:     timed ? qCount * timePerQ : 0,
        level,
        tone,
      })
      navigate(`/test/${r.data.sessionId}`)
    } catch (e) {
      setGenError(e.response?.data?.message || 'Failed to generate test. Please try again.')
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 page-enter">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate('/')} className="text-primary-200 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Configure Your Mock Interview</h1>
          <p className="text-primary-200">Upload your resume and customize your test experience</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT — Resume Upload */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" /> 1. Upload Your Resume
              </h2>
              <UploadSection onParsed={setResumeData} />
            </div>

            {/* Level — auto-detect from resume */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. Experience Level</h2>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      level === l.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 bg-white hover:border-primary-200'
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-sm">{l.label}</p>
                    <p className="text-xs text-slate-500">{l.sub} · {l.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Test Config */}
          <div className="space-y-6">
            {/* Tech Stacks */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. Select Tech Stack to Test On</h2>
              <div className="space-y-3">
                {Object.entries(STACKS).map(([category, techs]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {techs.map(tech => (
                        <button
                          key={tech}
                          onClick={() => toggleStack(tech)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                            selectedStacks.includes(tech)
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-slate-200 text-slate-600 hover:border-primary-200'
                          }`}
                        >
                          {selectedStacks.includes(tech) && '✓ '}{tech}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {selectedStacks.length > 0 && (
                <p className="text-xs text-primary-600 mt-2">{selectedStacks.length} stack{selectedStacks.length > 1 ? 's' : ''} selected: {selectedStacks.join(', ')}</p>
              )}
            </div>

            {/* Question Count */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. Number of Questions</h2>
              <div className="flex gap-3">
                {COUNTS.map(c => (
                  <button
                    key={c}
                    onClick={() => setQCount(c)}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                      qCount === c ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-primary-200'
                    }`}
                  >
                    {c}
                    <div className="text-xs font-normal text-slate-400">{Math.round(c * timePerQ / 60)} mins</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Question Types</h2>
              <div className="space-y-2">
                {Q_TYPES.map(qt => (
                  <label key={qt.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qTypes.includes(qt.id)}
                      onChange={() => toggleType(qt.id)}
                      className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-700">{qt.label}</span>
                    <span className="text-xs text-slate-400">— {qt.sub}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. Difficulty Mix</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'easy',   label: 'Easy',   color: 'text-green-600' },
                  { key: 'medium', label: 'Medium', color: 'text-yellow-600' },
                  { key: 'hard',   label: 'Hard',   color: 'text-red-600' },
                ].map(d => (
                  <div key={d.key}>
                    <label className={`text-sm font-medium ${d.color} block mb-1`}>
                      {d.label} {difficulty[d.key]}%
                    </label>
                    <input
                      type="range" min={0} max={100} step={10}
                      value={difficulty[d.key]}
                      onChange={e => {
                        const val = parseInt(e.target.value)
                        // Keep total = 100
                        const others = ['easy', 'medium', 'hard'].filter(k => k !== d.key)
                        const remaining = 100 - val
                        const split = Math.floor(remaining / 2)
                        setDifficulty({ ...difficulty, [d.key]: val, [others[0]]: split, [others[1]]: remaining - split })
                      }}
                      className="w-full accent-primary-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Timer</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setTimed(false)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    !timed ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-primary-200'
                  }`}
                >
                  No Timer
                </button>
                <button
                  onClick={() => setTimed(true)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    timed ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-primary-200'
                  }`}
                >
                  Timed ({timePerQ}s/Q)
                </button>
              </div>
              {timed && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm text-slate-500">Seconds per question:</span>
                  <select
                    value={timePerQ}
                    onChange={e => setTimePerQ(parseInt(e.target.value))}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {[45, 60, 90, 120, 180].map(v => <option key={v} value={v}>{v}s</option>)}
                  </select>
                  <span className="text-xs text-slate-400">Total: ~{Math.round(qCount * timePerQ / 60)} min</span>
                </div>
              )}
            </div>

            {/* Tone */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">8. Interview Tone</h2>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      tone === t.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-primary-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {genError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {genError}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !resumeData || selectedStacks.length === 0}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold rounded-2xl text-lg
                         hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI is crafting your questions… (~15 seconds)</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Generate My Interview Test
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
