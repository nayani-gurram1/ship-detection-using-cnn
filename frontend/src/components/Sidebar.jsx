import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Radar, Ship, BarChart3, AlertTriangle,
  Navigation, Crosshair, FileText, Info, X, Bell, ChevronLeft, ChevronRight,
  Settings, User
} from 'lucide-react'

const sections = [
  {
    title: 'Main',
    links: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/detection', label: 'Detection', icon: Crosshair },
    ]
  },
  {
    title: 'Operations',
    links: [
      { to: '/traffic', label: 'Traffic', icon: Navigation },
      { to: '/collisions', label: 'Collisions', icon: AlertTriangle },
    ]
  },
  {
    title: 'Monitoring',
    links: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/alerts', label: 'Alerts', icon: Bell, badge: 12 },
      { to: '/radar', label: 'Radar View', icon: Radar },
    ]
  },
  {
    title: 'System',
    links: [
      { to: '/system', label: 'System', icon: Info },
      { to: '/reports', label: 'Reports', icon: FileText },
    ]
  }
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Slide-in Mobile Menu */}
          <motion.aside
            className="fixed top-0 left-0 h-screen w-80 bg-[var(--c-bg)] z-[101] border-r border-[var(--c-border)] shadow-2xl overflow-y-auto"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="p-8 border-b border-[var(--c-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                     style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-purple))' }}>
                  <Ship size={20} />
                </div>
                <h1 className="text-lg font-black text-white uppercase tracking-tighter">ShipDetect<span className="text-[var(--c-accent)]">AI</span></h1>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-[var(--c-text-dim)]">
                <X size={24} />
              </button>
            </div>

            <nav className="p-6 space-y-8">
              {sections.map((section) => (
                <div key={section.title}>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--c-text-dim)] px-4 mb-4 opacity-40">
                    {section.title}
                  </p>
                  <ul className="space-y-2">
                    {section.links.map(({ to, label, icon: Icon }) => {
                      const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
                      return (
                        <li key={to}>
                          <NavLink
                            to={to}
                            onClick={onClose}
                            className={`
                              flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300
                              ${isActive ? 'bg-[var(--c-accent)]/10 text-white border border-[var(--c-accent)]/20' : 'text-[var(--c-text-dim)] hover:bg-white/5'}
                            `}
                          >
                            <Icon size={20} className={isActive ? 'text-[var(--c-accent)]' : ''} />
                            <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
                          </NavLink>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="mt-auto p-8 border-t border-[var(--c-border)]">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--c-accent)] to-[var(--c-purple)] flex items-center justify-center text-white font-black text-xs">
                  NT
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-tighter">Nishath T.</p>
                  <p className="text-[9px] text-[var(--c-accent)] font-bold uppercase tracking-widest mt-1">Lead Analyst</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
