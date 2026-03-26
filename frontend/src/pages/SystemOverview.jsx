import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Info, Cpu, Layers, Zap, BookOpen, AlertTriangle, Target, ArrowRight } from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import { Loader, ErrorState } from '../components/StateHandlers'
import { getSystemInfo, getModelPerformance } from '../api'

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.5, ease: 'easeOut' },
})

export default function SystemOverview() {
  const [sys, setSys] = useState(null)
  const [perf, setPerf] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = () => {
    setLoading(true); setError(false)
    Promise.all([
      getSystemInfo().then(r => setSys(r.data)),
      getModelPerformance().then(r => setPerf(r.data)),
    ])
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <PageWrapper><Loader message="Loading system info..." /></PageWrapper>
  if (error) return <PageWrapper><ErrorState message="Failed to load system info" onRetry={fetchData} /></PageWrapper>

  return (
    <PageWrapper>
      <div className="flex flex-col space-y-[var(--section-gap)] pb-[var(--s-3xl)]">
        {/* Header */}
        <motion.div className="mt-10 flex flex-col items-start px-2 text-left" {...fadeUp()}>
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--c-cyan)]/10 border border-[var(--c-cyan)]/20 mb-6">
            <Cpu size={14} className="text-[var(--c-cyan)]" />
            <span className="text-[10px] font-black text-[var(--c-cyan)] tracking-[0.3em] uppercase">Architecture & Core Logic</span>
          </div>
          <h1 className="page-title mb-4">
            System <span className="text-gradient-cyan">Intelligence Overview</span>
          </h1>
          <p className="text-[var(--c-text-dim)] text-lg max-w-2xl leading-relaxed font-medium opacity-70">
            Deep dive into the neural radar pipeline, model performance metrics, and system architecture.
          </p>
        </motion.div>

        <div className="flex flex-col space-y-[var(--section-gap)] w-full text-left">
          {/* Pipeline */}
          <Section icon={Layers} title="AI Processing Pipeline" color="var(--c-accent)" delay={0}>
          <div className="flex flex-wrap gap-2">
            {sys?.pipeline?.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="glass-sm px-3 py-2 text-center">
                  <p className="text-xs font-bold text-[var(--c-text-bright)]">{s.name}</p>
                  <p className="text-[10px] text-[var(--c-text-dim)] mt-0.5">{s.description}</p>
                </div>
                {i < sys.pipeline.length - 1 && <ArrowRight size={14} className="text-[var(--c-accent)] shrink-0" />}
              </div>
            ))}
          </div>
        </Section>

        {/* Architecture */}
        <Section icon={Cpu} title="System Architecture" color="var(--c-cyan)" delay={0.08}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sys?.architecture && Object.entries(sys.architecture).map(([k, v]) => (
              <div key={k} className="glass-sm p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-dim)]">{k}</p>
                <p className="text-xs font-semibold text-[var(--c-text-bright)] mt-1">{v}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Modules */}
        <Section icon={Zap} title="Core Modules" color="var(--c-amber)" delay={0.16}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {modules.map(m => (
              <div key={m.name} className="glass-sm p-3 sm:p-4 hover:bg-white/[0.03] transition-colors duration-200">
                <p className="text-sm font-semibold text-[var(--c-text-bright)]">{m.name}</p>
                <p className="text-[11px] text-[var(--c-text-dim)] mt-1">{m.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Model Performance */}
        {perf && (
          <Section icon={Target} title="Model Performance" color="var(--c-green)" delay={0.24}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {perf.metrics && Object.entries(perf.metrics).map(([k, v]) => (
                <div key={k} className="glass-sm p-3 text-center">
                  <p className="text-lg font-bold text-[var(--c-text-bright)]">
                    {typeof v === 'number' && v < 1 ? `${(v * 100).toFixed(1)}%` : v}
                  </p>
                  <p className="text-[10px] text-[var(--c-text-dim)] mt-1">{k.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {perf.training && Object.entries(perf.training).map(([k, v]) => (
                <div key={k} className="glass-sm p-3 text-center">
                  <p className="text-sm font-bold text-[var(--c-accent)]">{v}</p>
                  <p className="text-[10px] text-[var(--c-text-dim)] mt-1">{k.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
            {perf.confusion_matrix && (
              <div className="mt-4 glass-sm p-4">
                <p className="text-xs font-semibold text-[var(--c-text-dim)] mb-2">Confusion Matrix</p>
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  <CM label="TP" value={perf.confusion_matrix.true_positive} color="var(--c-green)" />
                  <CM label="FP" value={perf.confusion_matrix.false_positive} color="var(--c-red)" />
                  <CM label="FN" value={perf.confusion_matrix.false_negative} color="var(--c-amber)" />
                  <CM label="TN" value={perf.confusion_matrix.true_negative} color="var(--c-cyan)" />
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Risks */}
        <Section icon={AlertTriangle} title="Known Risks & Limitations" color="var(--c-red)" delay={0.32}>
          <div className="space-y-2">
            {risks.map((r, i) => (
              <div key={i} className="flex items-start gap-3 glass-sm p-3">
                <AlertTriangle size={14} className="text-[var(--c-amber)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--c-text)]">{r}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* References */}
        <Section icon={BookOpen} title="References" color="var(--c-purple)" delay={0.4}>
          <div className="space-y-2">
            {refs.map((r, i) => (
              <div key={i} className="glass-sm p-3 hover:bg-white/[0.03] transition-colors duration-200">
                <p className="text-xs text-[var(--c-text-bright)] font-medium">{r.title}</p>
                <p className="text-[10px] text-[var(--c-text-dim)] mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  </PageWrapper>
)
}

function Section({ icon: Icon, title, color, delay = 0, children }) {
  return (
    <motion.div
      className="glass p-10 border-white/5 shadow-2xl relative overflow-hidden group w-full"
      {...fadeUp(delay)}
    >
      <div className="flex items-center gap-6 mb-10">
        <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 shadow-xl transition-transform group-hover:scale-110" 
             style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] opacity-50 group-hover:opacity-100 transition-opacity">
          {title}
        </h3>
      </div>
      <div className="relative z-10 w-full text-left">
        {children}
      </div>
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
        <Icon size={120} />
      </div>
    </motion.div>
  )
}

function CM({ label, value, color }) {
  return (
    <div className="bg-white/5 rounded-lg p-2 text-center">
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-[var(--c-text-dim)]">{label}</p>
    </div>
  )
}

const modules = [
  { name: 'Detection', desc: 'Faster R-CNN with ResNet50-FPN backbone for multi-object ship detection' },
  { name: 'Classification', desc: 'Rule-based engine: Legal, Illegal (restricted zone), Suspicious (high density)' },
  { name: 'Tracking', desc: 'OpenCV + DeepSORT for persistent ship ID tracking across frames' },
  { name: 'Analytics', desc: 'Risk, density, traffic, and trend analysis with real-time computation' },
  { name: 'Traffic Analysis', desc: 'Zone-based ship counting with Low/Medium/High traffic levels' },
  { name: 'Collision Detection', desc: 'Pairwise distance computation with configurable threshold' },
]

const risks = [
  'Detection accuracy degrades with heavily occluded or very small ships',
  'False positives may occur on non-ship structures (buoys, platforms)',
  'Performance depends on image resolution and radar quality',
  'Real-time tracking requires GPU for optimal frame rates',
  'Classification rules are static; ML-based classification recommended for production',
]

const refs = [
  { title: 'Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks', desc: 'Ren et al., NeurIPS 2015 — Foundation architecture for this system' },
  { title: 'Feature Pyramid Networks for Object Detection', desc: 'Lin et al., CVPR 2017 — ResNet50-FPN backbone used in this model' },
  { title: 'Ship Detection in SAR Images Using Deep Learning', desc: 'Various authors — Survey of ship detection methods on radar imagery' },
  { title: 'DeepSORT: Simple Online and Realtime Tracking with a Deep Association Metric', desc: 'Wojke et al. — Multi-object tracking algorithm' },
]
