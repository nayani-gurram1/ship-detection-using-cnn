import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Crosshair, Target, ShieldAlert } from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import { Loader, ErrorState, EmptyState } from '../components/StateHandlers'
import { getCollisions } from '../api'

const riskColors = { Critical: '#ef4444', High: '#f59e0b', Low: '#10b981' }

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.5, ease: 'easeOut' },
})

export default function Collisions() {
  const [collisions, setCollisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = () => {
    setLoading(true); setError(false)
    getCollisions()
      .then(r => setCollisions(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  if (loading) return <PageWrapper><Loader message="Running collision trajectory analysis..." /></PageWrapper>
  if (error) return <PageWrapper><ErrorState message="Failed to synchronize with collision engine" onRetry={fetchData} /></PageWrapper>

  return (
    <PageWrapper>
      <div className="flex flex-col space-y-[var(--section-gap)] pb-[var(--s-3xl)]">
        {/* Header */}
        <motion.div className="mt-10 flex flex-col items-start px-2 text-left" {...fadeUp()}>
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--c-amber)]/10 border border-[var(--c-amber)]/20 mb-6">
            <Crosshair size={14} className="text-[var(--c-amber)] animate-pulse" />
            <span className="text-[10px] font-black text-[var(--c-amber)] tracking-[0.3em] uppercase">Pairwise Distance Analysis</span>
          </div>
          <h1 className="page-title mb-4">
            Collision <span className="text-gradient">Risk Matrix</span>
          </h1>
          <p className="text-[var(--c-text-dim)] text-lg max-w-2xl leading-relaxed font-medium opacity-70">
            Real-time analysis of vessel proximity and potential maritime collision vectors.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full text-left" {...fadeUp(0.1)}>
          <MiniStat label="Identified Risks" value={collisions.length} color="var(--c-accent)" icon={Target} />
          <MiniStat label="Critical Vectors" value={collisions.filter(c => c.risk_level === 'Critical').length} color="var(--c-red)" icon={ShieldAlert} />
          <MiniStat label="High Proximity" value={collisions.filter(c => c.risk_level === 'High').length} color="var(--c-amber)" icon={AlertTriangle} />
        </motion.div>

        {collisions.length === 0 ? (
          <motion.div className="glass p-24 text-center border-dashed border-white/10 opacity-40" {...fadeUp(0.15)}>
            <AlertTriangle size={64} className="mx-auto text-[var(--c-text-dim)] mb-6" />
            <p className="text-xs font-black uppercase tracking-[0.4em]">Safe maritime environment</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {collisions.map((c, i) => (
              <motion.div
                key={i}
                className="glass p-8 relative overflow-hidden group border-white/5 hover:bg-white/[0.04] transition-all duration-500 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 left-0 bottom-0 w-1.5 transition-all group-hover:w-2" style={{ background: riskColors[c.risk_level] }} />
                <div className="pl-6 space-y-8">
                  <div className="flex items-center justify-between">
                    <span className="badge" style={{ background: `${riskColors[c.risk_level]}15`, color: riskColors[c.risk_level], border: `1px solid ${riskColors[c.risk_level]}20` }}>
                      {c.risk_level} Severity
                    </span>
                    <span className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.25em] opacity-50">
                      {c.timestamp ? new Date(c.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Real-time'}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex-1 py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/5 font-mono text-xs font-black text-white text-center shadow-inner tracking-tighter group-hover:border-[var(--c-accent)]/40 transition-colors">
                      {c.ship_a}
                    </div>
                    <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:rotate-180 transition-transform duration-700">
                      <ArrowRight size={20} className="text-[var(--c-text-dim)]" />
                    </div>
                    <div className="flex-1 py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/5 font-mono text-xs font-black text-white text-center shadow-inner tracking-tighter group-hover:border-[var(--c-accent)]/40 transition-colors">
                      {c.ship_b}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black font-mono tracking-tighter" style={{ color: riskColors[c.risk_level] }}>
                          {c.distance}
                        </span>
                        <span className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-widest opacity-40">Pixels Distance</span>
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{Math.max(5, 100 - c.distance)}% Threat</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.03] border border-white/5 overflow-hidden p-0.5 shadow-inner">
                      <motion.div
                        className="h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.3)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5, 100 - c.distance)}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ background: `linear-gradient(90deg, ${riskColors[c.risk_level]}, ${riskColors[c.risk_level]}aa)` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

function MiniStat({ label, value, color, icon: Icon }) {
  return (
    <div className="glass p-8 flex flex-col items-start text-left border-white/5 group shadow-2xl min-h-[180px] justify-between">
      <div className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.2em] opacity-50 mb-2">{label}</p>
        <p className="text-4xl font-black tracking-tighter leading-none" style={{ color }}>{value}</p>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="glass-sm p-3 sm:p-4 text-center">
      <p className="text-xl sm:text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] sm:text-[11px] text-[var(--c-text-dim)] mt-1">{label}</p>
    </div>
  )
}

function ShipBadge({ id }) {
  return <div className="glass-sm px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono text-[var(--c-text-bright)] text-clamp-1 max-w-[120px]">{id}</div>
}
