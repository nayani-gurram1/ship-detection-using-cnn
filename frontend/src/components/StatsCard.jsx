import { useEffect, useRef, useState } from 'react'

export default function StatsCard({ icon: Icon, label, value, color = '#6366f1', delay = 0 }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      ref={ref}
      className="glass p-8 flex items-center gap-6 transition-all duration-500 relative overflow-hidden border-white/5 shadow-2xl group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      <div
        className="w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-xl group-hover:scale-110 transition-transform"
        style={{ background: `${color}15`, border: `1px solid ${color}25`, color }}
      >
        <Icon size={24} />
      </div>
      <div className="text-left">
        <p className="text-4xl font-black text-white tracking-tighter leading-none mb-2">{value ?? '—'}</p>
        <p className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.2em] opacity-50">{label}</p>
      </div>
      {/* Subtle glow ring */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03] blur-2xl pointer-events-none group-hover:opacity-[0.08] transition-opacity"
        style={{ background: color }}
      />
    </div>
  )
}
