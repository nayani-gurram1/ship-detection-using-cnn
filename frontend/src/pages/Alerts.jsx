import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle, ShieldAlert, AlertTriangle, Navigation, Crosshair } from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import { Loader, ErrorState } from '../components/StateHandlers'
import { getAlerts, acknowledgeAlert } from '../api'

const sevColors = { critical: '#ef4444', warning: '#f59e0b', info: '#6366f1' }
const typeIcons = {
  illegal_ship: ShieldAlert,
  high_risk: AlertTriangle,
  collision_risk: Crosshair,
  high_traffic: Navigation,
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' },
  }),
}

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.5, ease: 'easeOut' },
})

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = () => {
    setLoading(true); setError(false)
    getAlerts()
      .then(r => setAlerts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <PageWrapper><Loader message="Synchronizing alert database..." /></PageWrapper>
  if (error) return <PageWrapper><ErrorState message="Failed to synchronize with alert engine" onRetry={fetchData} /></PageWrapper>

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter)
  const types = [...new Set(alerts.map(a => a.type))]

  const handleAck = async (id) => {
    try {
      await acknowledgeAlert(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
    } catch (err) { console.error(err) }
  }

  return (
    <PageWrapper>
      <div className="flex flex-col space-y-[var(--section-gap)] pb-[var(--s-3xl)]">
        {/* Header */}
        <motion.div className="mt-10 flex flex-col items-start px-2 text-left" {...fadeUp()}>
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--c-red)]/10 border border-[var(--c-red)]/20 mb-6">
            <Bell size={14} className="text-[var(--c-red)] animate-bounce" />
            <span className="text-[10px] font-black text-[var(--c-red)] tracking-[0.3em] uppercase">Real-Time Threat Intelligence</span>
          </div>
          <h1 className="page-title mb-4">
            Security <span className="text-gradient">Alert Center</span>
          </h1>
          <p className="text-[var(--c-text-dim)] text-lg max-w-2xl leading-relaxed font-medium opacity-70">
            Monitor and acknowledge high-priority maritime threats and system anomalies.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full text-left" {...fadeUp(0.1)}>
          <MiniStat label="Total Incident Log" value={alerts.length} color="var(--c-accent)" icon={Bell} />
          <MiniStat label="Active Threats" value={alerts.filter(a => !a.acknowledged).length} color="var(--c-red)" icon={ShieldAlert} />
          <MiniStat label="Mitigated Alerts" value={alerts.filter(a => a.acknowledged).length} color="var(--c-green)" icon={CheckCircle} />
        </motion.div>

        {/* Filters */}
        <motion.div className="flex items-center gap-4 flex-wrap" {...fadeUp(0.15)}>
          <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>Global Feed</FilterBtn>
          {types.map(t => (
            <FilterBtn key={t} active={filter === t} onClick={() => setFilter(t)}>
              {t.replace(/_/g, ' ')}
            </FilterBtn>
          ))}
        </motion.div>

        {/* Alert List */}
        <motion.div className="space-y-6" {...fadeUp(0.2)}>
          {filtered.length === 0 ? (
            <div className="glass p-24 text-center border-dashed border-white/10 opacity-40">
              <Bell size={64} className="mx-auto text-[var(--c-text-dim)] mb-6" />
              <p className="text-xs font-black uppercase tracking-[0.4em]">Operational environment secure</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((a, i) => {
                  const Icon = typeIcons[a.type] || Bell
                  const color = sevColors[a.severity] || 'var(--c-accent)'
                  return (
                    <motion.div
                      key={a.id}
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      layout
                      className={`glass p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden transition-all duration-500 border-white/5 group shadow-2xl ${
                        a.acknowledged ? 'opacity-40 grayscale' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Severity stripe */}
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 transition-all group-hover:w-2" style={{ background: color }} />

                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
                        <Icon size={24} style={{ color }} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full" style={{ background: `${color}15`, color, border: `1px solid ${color}20` }}>
                            {a.severity}
                          </span>
                          <span className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.25em] opacity-50">
                            {a.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-base font-bold text-white tracking-tight group-hover:text-[var(--c-accent)] transition-colors">{a.message}</p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <p className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-widest">
                              {new Date(a.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          {a.ship_id && (
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                              <p className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-widest font-mono">
                                ID: {a.ship_id}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {!a.acknowledged && (
                        <button
                          onClick={() => handleAck(a.id)}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-[var(--c-green)] uppercase tracking-[0.2em] hover:bg-[var(--c-green)] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                        >
                          <CheckCircle size={16} />
                          <span>Resolve</span>
                        </button>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
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

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-xl border ${
        active
          ? 'bg-[var(--c-accent)] text-white border-[var(--c-accent)]/20 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)]'
          : 'bg-white/5 text-[var(--c-text-dim)] border-white/5 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

