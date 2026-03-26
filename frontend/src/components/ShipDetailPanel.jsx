import { X, Shield, AlertTriangle, MapPin, Gauge, Crosshair, Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const classColors = {
  Legal: 'var(--c-green)',
  Illegal: 'var(--c-red)',
  Suspicious: 'var(--c-amber)',
}

const panelVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
  exit: { x: '100%', transition: { duration: 0.25, ease: 'easeIn' } },
}
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export default function ShipDetailPanel({ ship, onClose }) {
  const color = ship ? (classColors[ship.classification] || 'var(--c-accent)') : 'var(--c-accent)'

  return (
    <AnimatePresence>
      {ship && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 h-screen w-full sm:w-[480px] z-[60] border-l border-[var(--c-border)] overflow-y-auto shadow-[-20px_0_50px_rgba(0,0,0,0.5)] scrollbar-hide"
            style={{
              background: 'var(--c-bg)',
            }}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 border-b border-[var(--c-border)] bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[var(--c-accent)]/10 flex items-center justify-center border border-[var(--c-accent)]/20">
                  <Ship size={20} className="text-[var(--c-accent)]" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">Intelligence Report</h2>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[var(--c-text-dim)] hover:text-white transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Identity & Status */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.3em] mb-2 opacity-50">Identity Hash</p>
                    <p className="text-2xl font-black text-white tracking-tighter font-mono">{ship.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[9px] font-black text-[var(--c-text-dim)] uppercase tracking-widest opacity-40">Status</span>
                    <span
                      className="badge text-[10px] font-black px-4 py-2 rounded-xl shadow-lg"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}20` }}
                    >
                      {ship.classification}
                    </span>
                  </div>
                </div>
              </div>

              {/* Neural Metrics */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em] opacity-50">Neural Telemetry</h3>
                <div className="grid grid-cols-2 gap-6">
                  <MetricCard icon={Crosshair} label="Confidence" value={`${(ship.confidence * 100).toFixed(1)}%`} color="var(--c-cyan)" />
                  <MetricCard icon={Gauge} label="Risk Rating" value={`${ship.risk_score}/100`} color={ship.risk_score > 60 ? 'var(--c-red)' : 'var(--c-green)'} />
                  <MetricCard icon={MapPin} label="Deployment" value={ship.zone} color="var(--c-purple)" />
                  <MetricCard icon={Shield} label="Neural Model" value="FRCNN-v2" color="var(--c-accent)" />
                </div>
              </div>

              {/* Spatial Coordinates */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em] opacity-50">Spatial Coordinates</h3>
                <div className="glass p-6 border-white/5 bg-black/40 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-widest">Bounding Box [X1, Y1, X2, Y2]</span>
                    <Activity size={14} className="text-[var(--c-cyan)] opacity-40" />
                  </div>
                  <code className="text-lg text-[var(--c-cyan)] font-mono font-black tracking-tighter">
                    [{ship.bbox.map(v => Math.round(v)).join(', ')}]
                  </code>
                </div>
              </div>

              {/* AI Explainability */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em] opacity-50">AI Explainability</h3>
                <div className="glass p-6 space-y-6 border-white/5 shadow-2xl">
                  <ExplainRow
                    icon={Crosshair}
                    text={`Detection synchronized using ${ship.model_used} architecture with a precision-weighted confidence score of ${(ship.confidence * 100).toFixed(2)}%.`}
                    color="var(--c-cyan)"
                  />
                  <ExplainRow
                    icon={ship.classification === 'Illegal' ? ShieldAlert : Shield}
                    text={ship.classification_reason}
                    color={color}
                  />
                </div>
              </div>

              {/* System Protocol Footer */}
              <div className="pt-10 border-t border-white/5 opacity-30 text-center">
                <p className="text-[9px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.4em]">Encrypted Intelligence Stream v2.4.8</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-sm p-3 flex items-center gap-3">
      <Icon size={16} style={{ color }} className="shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--c-text-dim)]">{label}</p>
        <p className="text-sm font-semibold text-[var(--c-text-bright)] text-clamp-1">{value}</p>
      </div>
    </div>
  )
}

function ExplainRow({ icon: Icon, text, color }) {
  return (
    <div className="flex items-start gap-2 bg-white/[0.03] rounded-lg p-2.5">
      <Icon size={14} className="mt-0.5 shrink-0" style={{ color }} />
      <p className="text-xs text-[var(--c-text)] leading-relaxed">{text}</p>
    </div>
  )
}
