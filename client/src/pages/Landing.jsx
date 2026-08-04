import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload, Brain, BarChart2, ArrowRight, CheckCircle,
  Zap, Star, Shield, Clock, Target, Code2, Layers
} from 'lucide-react'

const TECH_TAGS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django',
  'FastAPI', 'Spring Boot', 'MongoDB', 'MySQL', 'PostgreSQL', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'Linux', 'Python', 'Java', 'TypeScript',
  'Go', 'Rust', 'TensorFlow', 'PyTorch', 'GraphQL', 'REST APIs', 'Git',
  'CI/CD', 'Microservices', 'Kafka', 'Redis', 'Elasticsearch',
]

const STEPS = [
  { icon: Upload,   color: 'bg-blue-100 text-blue-600',   title: 'Upload Resume',          desc: 'PDF or DOCX — AI reads your skills in seconds' },
  { icon: Brain,    color: 'bg-violet-100 text-violet-600', title: 'AI Generates Test',    desc: '10–20 personalized questions in your tech stack' },
  { icon: BarChart2, color: 'bg-green-100 text-green-600', title: 'Get Detailed Results',  desc: 'Score, explanations & a tailored improvement plan' },
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
    <div className="min-h-screen bg-[#fcfcff] overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">MockAI</span>
          </div>
          <button onClick={() => navigate('/upload')} className="btn-primary text-sm py-2.5">
            Start Free Test
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-60 pointer-events-none animate-aurora" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-60 pointer-events-none animate-drift" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> Powered by Gemini AI · 100% Free
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-tight mb-6">
              Test Your Tech Skills.{' '}
              <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">
                Know Exactly
              </span>{' '}
              Where You Stand.
            </h1>

            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your resume → AI reads your skills → Generates a personalized interview test in <strong className="text-slate-700">30 seconds</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/upload')}
                className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
              >
                 Start My Mock Interview <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-ghost text-slate-500 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm">Trusted by 10,000+ devs</span>
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
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_32px_80px_-32px_rgba(79,70,229,.42)] border border-white p-6 max-w-xl mx-auto ring-1 ring-slate-200/50">
              {/* Mock score header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400">React + Node.js · Junior</p>
                  <p className="font-bold text-slate-900">Your Mock Results</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-primary-600">78%</div>
                  <div className="text-xs text-slate-400">14/18 correct</div>
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
                  <span className="text-xs text-slate-500 w-20 text-right">{item.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 w-8">{item.pct}%</span>
                </div>
              ))}
              <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
                🤖 <strong>AI Plan:</strong> Focus on MongoDB aggregation pipelines — asked in 90% of backend interviews
              </div>
              {/* Blur overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How It Works</h2>
            <p className="text-slate-500">From resume to results in under 5 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="card p-6 text-center">
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="absolute top-8 left-0 right-0 flex justify-center">
                    <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center -mt-1">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 mt-4">{step.title}</h3>
                  <p className="text-slate-500 text-sm">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 z-10 -translate-y-1/2">
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything You Need to Ace Your Interview</h2>
            <p className="text-slate-500">Built for developers who want to actually improve</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card p-5 hover:scale-[1.02] transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Scroll */}
      <section className="py-12 bg-slate-50 overflow-hidden">
        <div className="text-center mb-6">
          <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Supported Tech Stacks</p>
        </div>
        <div className="flex gap-3 overflow-hidden">
          <div className="flex gap-3 animate-[scroll_30s_linear_infinite] min-w-max">
            {[...TECH_TAGS, ...TECH_TAGS].map((tag, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Know Where You Stand?</h2>
          <p className="text-primary-200 mb-8">No signup. No credit card. Just upload your resume and start.</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-8 py-4 bg-white text-primary-700 font-bold rounded-xl text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto"
          >
            🚀 Take My Mock Interview Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-100 text-center text-sm text-slate-400">
        <p>MockAI · Built with Gemini AI · © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
