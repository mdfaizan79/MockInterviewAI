import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud, FileText, CheckCircle, Loader2, X, Plus, ChevronRight,
  Brain, User, Briefcase, GraduationCap, Wrench, Folder, Building2, AlertCircle, ArrowLeft
} from 'lucide-react'
import { resumeAPI, testAPI } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'


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
          <motion.div
            whileHover={{ scale: 1.01 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              dragOver 
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-900/50'
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
                      steps.includes(i) ? 'text-primary-700 dark:text-primary-300' : 'text-slate-300 dark:text-slate-700'
                    }`}>
                      {steps.includes(i)
                        ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-800 flex-shrink-0" />
                      }
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
                   <UploadCloud className="w-8 h-8 text-primary-500" />
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">Drag & Drop Your Resume Here</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Supports: PDF, DOCX (Max: 5MB)</p>
                <div className="flex items-center gap-3 justify-center max-w-xs mx-auto">
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">or</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>
                <button className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:shadow-lg transition-all">
                   Browse Files
                </button>
              </>
            )}
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </motion.div>
          )}
        </>
      ) : (
        /* Parsed Resume Card */
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <CheckCircle className="w-24 h-24 text-emerald-600" />
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-5">
              <CheckCircle className="w-5 h-5" /> Resume Analyzed Successfully
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {parsed.name && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{parsed.name}</span>
                </div>
              )}
              {parsed.experience && (
                <div className="flex items-center gap-3 text-sm">
                   <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{parsed.experience}</span>
                </div>
              )}
              {parsed.education && (
                <div className="sm:col-span-2 flex items-start gap-3 text-sm">
                   <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{parsed.education}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5" /> Skills Detected ({parsed.skills?.length || 0})
                </p>
                <button
                  onClick={() => setEditSkills(e => !e)}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {editSkills ? 'Save Changes' : '✏️ Edit Skills'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsed.skills?.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl shadow-sm">
                    {skill}
                    {editSkills && (
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
                {editSkills && (
                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <input
                      autoFocus
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSkill()}
                      placeholder="Add skill…"
                      className="w-24 text-xs bg-transparent focus:outline-none"
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
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              <X className="w-3.5 h-3.5" /> Change Resume
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

//Main Page
export default function Upload() {
  const navigate = useNavigate()

  // Resume data
  const [resumeData, setResumeData] = useState(null)


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
    <div className="min-h-screen bg-[#fcfcff] dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
       {/* Nav */}
       <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
               <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-primary-600 transition-colors" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">Setup Interview</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Header */}
      <div className="pt-24 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary-500/5 blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative">
           <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
             Ready to Start?
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
             Upload your resume and customize your test parameters. AI will handle the rest.
           </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT — Step Indicators (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 space-y-8">
             {[
               { id: 1, label: 'Resume Analysis', active: !resumeData },
               { id: 2, label: 'Tech Stack', active: resumeData && selectedStacks.length === 0 },
               { id: 3, label: 'Configuration', active: selectedStacks.length > 0 },
             ].map((s, i) => (
               <div key={s.id} className="flex items-center gap-4 group">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                   s.active ? 'bg-primary-600 text-white shadow-primary-500/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                 }`}>
                   {s.id}
                 </div>
                 <div className="flex flex-col">
                   <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${s.active ? 'text-primary-600' : 'text-slate-400'}`}>Step {s.id}</span>
                   <span className={`font-bold text-sm transition-colors ${s.active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{s.label}</span>
                 </div>
               </div>
             ))}
          </div>

          {/* MAIN CONTENT — 2 Column Grid */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Resume & Level */}
            <div className="space-y-8">
              <section className="card p-6 border-transparent hover:border-primary-100 dark:hover:border-primary-900/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                   </div>
                   Resume Details
                </h2>
                <UploadSection onParsed={setResumeData} />
              </section>

              <section className="card p-6 border-transparent">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Experience Level</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LEVELS.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setLevel(l.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        level === l.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/5'
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary-200 dark:hover:border-primary-800'
                      }`}
                    >
                      <p className={`font-bold text-sm mb-1 ${level === l.id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>{l.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{l.sub} · {l.desc}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Test Configuration */}
            <div className="space-y-8">
              <section className="card p-6 border-transparent">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary-600" /> Tech Stack to Test
                </h2>
                <div className="space-y-5">
                  {Object.entries(STACKS).map(([category, techs]) => (
                    <div key={category}>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {techs.map(tech => (
                          <button
                            key={tech}
                            onClick={() => toggleStack(tech)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                              selectedStacks.includes(tech)
                                ? 'border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-primary-200 dark:hover:border-primary-800'
                            }`}
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedStacks.length > 0 && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800/50">
                     <p className="text-xs font-bold text-primary-700 dark:text-primary-400">{selectedStacks.length} stack{selectedStacks.length > 1 ? 's' : ''} selected</p>
                   </motion.div>
                )}
              </section>

              {/* Advanced Config */}
              <section className="card p-6 border-transparent space-y-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Test Settings</h2>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Advanced</div>
                 </div>

                 {/* Question Count */}
                 <div>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Total Questions</p>
                    <div className="flex gap-2">
                      {COUNTS.map(c => (
                        <button key={c} onClick={() => setQCount(c)}
                          className={`flex-1 py-3 rounded-xl border-2 font-black transition-all ${
                            qCount === c ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'border-slate-100 dark:border-slate-800 dark:bg-slate-900/50 text-slate-400'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                 </div>

                 {/* Timer Toggle */}
                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                          <Clock className={`w-5 h-5 ${timed ? 'text-primary-600' : 'text-slate-400'}`} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Enable Timer</p>
                          <p className="text-xs text-slate-500">{timePerQ}s per question</p>
                       </div>
                    </div>
                    <button onClick={() => setTimed(!timed)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${timed ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                       <motion.div animate={{ x: timed ? 26 : 2 }} className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md" />
                    </button>
                 </div>

                 {genError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-start gap-3">
                       <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                       <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-relaxed">{genError}</p>
                    </div>
                 )}

                 <button
                    onClick={handleGenerate}
                    disabled={generating || !resumeData || selectedStacks.length === 0}
                    className="w-full py-5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-black rounded-2xl text-lg
                               hover:shadow-2xl hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all
                               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-xl shadow-primary-500/10"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Crafting Test…</span>
                      </>
                    ) : (
                      <>
                        <span>Start Interview</span>
                        <ChevronRight className="w-6 h-6" />
                      </>
                    )}
                 </button>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
