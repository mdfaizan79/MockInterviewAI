import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload, Brain, BarChart2, ArrowRight, CheckCircle,
  Zap, Star, Shield, Clock, Target, Code2, Layers
} from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

const TECH_TAGS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django',
  'FastAPI', 'Spring Boot', 'MongoDB', 'MySQL', 'PostgreSQL', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'Linux', 'Python', 'Java', 'TypeScript',
  'Go', 'Rust', 'TensorFlow', 'PyTorch', 'GraphQL', 'REST APIs', 'Git',
  'CI/CD', 'Microservices', 'Kafka', 'Redis', 'Elasticsearch',
]

const STEPS = [
  { icon: Upload,   color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',   title: 'Upload Resume',          desc: 'PDF or DOCX — AI reads your skills in seconds' },
  { icon: Brain,    color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'AI Generates Test',    desc: '10–20 personalized questions in your tech stack' },
  { icon: BarChart2, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', title: 'Get Detailed Results',  desc: 'Score, explanations & a tailored improvement plan' },
]

const FEATURES = [
  { icon: Brain,    title: 'Personalized Questions',    desc: 'AI tailors every question to YOUR resume skills, not generic content' },
  { icon: Target,   title: '5 Question Types',          desc: 'MCQ, True/False, Fill-in-blank, Code output, Short answer' },
  { icon: Clock,    title: 'Timed Practice',            desc: 'Real interview pressure with per-question timer and auto-submit' },
  { icon: BarChart2, title: 'Detailed Score Report',   desc: 'Category breakdown, per-question explanations, why others are wrong' },
  { icon: Zap,      title: 'AI Improvement Plan',      desc: '5-day personalized study schedule targeting your exact weak spots' },
  { icon: Shield,   title: 'No Signup Needed',         desc: 'Guest mode — just upload and test. No account required.' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#fcfcff] dark:bg-slate-950 overflow-x-hidden transition-colors duration-300">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">MockAI</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => navigate('/upload')} className="btn-primary text-sm py-2.5">
              Start Free Test
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-200 dark:bg-primary-900/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-aurora" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-drift" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> Powered by Gemini AI · 100% Free
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-6">
              Test Your Tech Skills.{' '}
              <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">
                Know Exactly
              </span>{' '}
              Where You Stand.
            </h1>

            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your resume → AI reads your skills → Generates a personalized interview test in <strong className="text-slate-700 dark:text-slate-200">30 seconds</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/upload')}
                className="btn-primary text-lg px-8 py-4 flex items-center gap-2 shadow-2xl shadow-primary-500/20"
              >
                 Start My Mock Interview <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-ghost text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm font-medium">Trusted by 10,000+ devs</span>
              </button>
            </div>
          </motion.div>


          {/* Floating demo card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-[0_32px_80px_-32px_rgba(79,70,229,.42)] dark:shadow-[0_32px_80px_-32px_rgba(0,0,0,.6)] border border-white dark:border-slate-800 p-6 max-w-xl mx-auto ring-1 ring-slate-200/50 dark:ring-slate-700/50 transition-all">
              {/* Mock score header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">React + Node.js · Junior</p>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">Your Mock Results</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-primary-600 dark:text-primary-400">78%</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">14/18 correct</div>
                </div>
              </div>

              {/* Fake bars */}
              {[
                { label: 'React',      pct: 88, color: 'bg-blue-500' },
                { label: 'Node.js',    pct: 65, color: 'bg-green-500' },
                { label: 'JavaScript', pct: 90, color: 'bg-yellow-500' },
                { label: 'MongoDB',    pct: 50, color: 'bg-red-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 w-20 text-right">{item.label}</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-8">{item.pct}%</span>
                </div>
              ))}
              <div className="mt-3 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                🤖 <strong>AI Plan:</strong> Focus on MongoDB aggregation pipelines — asked in 90% of backend interviews
              </div>
              {/* Blur overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/60 dark:from-slate-900/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400">From resume to results in under 5 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="card p-8 text-center h-full group hover:border-primary-300 dark:hover:border-primary-800 transition-all">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div className="absolute top-10 left-0 right-0 flex justify-center">
                    <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center -mt-2 shadow-lg shadow-primary-500/30">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-3 mt-4">{step.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 z-10 -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Everything You Need to Ace Your Interview</h2>
            <p className="text-slate-500 dark:text-slate-400">Built for developers who want to actually improve</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card p-6 hover:scale-[1.02] transition-all border-transparent hover:border-primary-100 dark:hover:border-primary-900/50"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900/30 overflow-hidden transition-colors">
        <div className="text-center mb-8">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">Supported Tech Stacks</p>
        </div>
        <div className="flex gap-4 overflow-hidden py-4">
          <div className="flex gap-4 animate-[scroll_40s_linear_infinite] min-w-max">
            {[...TECH_TAGS, ...TECH_TAGS].map((tag, i) => (
              <span
                key={i}
                className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap shadow-sm hover:shadow-md transition-shadow cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-700 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-mesh-gradient" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-6">Ready to Know Where You Stand?</h2>
          <p className="text-primary-100 text-lg mb-10 opacity-90">No signup. No credit card. Just upload your resume and start.</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-10 py-5 bg-white text-primary-700 font-bold rounded-2xl text-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-xl"
          >
            🚀 Take My Mock Interview Now <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-slate-100 dark:border-slate-900 text-center text-sm text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-60">
            <Brain className="w-4 h-4" />
            <span className="font-bold">MockAI</span>
          </div>
          <p>© {new Date().getFullYear()} MockAI · Built with Gemini AI · All Rights Reserved</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-primary-500 transition-colors">Feedback</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
