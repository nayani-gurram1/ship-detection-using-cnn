import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, Search, Menu, Ship, LayoutDashboard, Crosshair, 
  Navigation, AlertTriangle, BarChart3, Info 
} from 'lucide-react'
import { getDashboardStats } from '../api'

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/detection', label: 'Detection', icon: Crosshair },
  { to: '/traffic', label: 'Traffic', icon: Navigation },
  { to: '/collisions', label: 'Collisions', icon: AlertTriangle },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/alerts', label: 'Alerts', icon: Bell },
]

export default function Topbar({ onMenuClick }) {
  const [stats, setStats] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const fetch = () => getDashboardStats().then(r => setStats(r.data)).catch(() => {})
    fetch()
    const t = setInterval(fetch, 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      style={{
        height: 'var(--topbar-h)',
        background: 'rgba(3, 7, 18, 0.8)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
        borderBottom: '1px solid var(--c-border)',
      }}
    >
      <div className="w-full h-full max-w-[var(--container-max)] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20"
                 style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-purple))' }}>
              <Ship size={20} />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-black text-white leading-none tracking-tighter uppercase">ShipDetect<span className="text-[var(--c-accent)]">AI</span></h1>
              <p className="text-[9px] text-[var(--c-text-dim)] font-bold tracking-[0.2em] uppercase mt-1 opacity-60">Intelligence</p>
            </div>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-2">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={`
                  relative px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 group
                  ${isActive ? 'text-white' : 'text-[var(--c-text-dim)] hover:text-white hover:bg-white/5'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="topNavActive"
                    className="absolute inset-0 bg-white/5 rounded-xl ring-1 ring-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={18} className={`${isActive ? 'text-[var(--c-accent)]' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="text-[11px] font-black uppercase tracking-[0.15em]">{label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="hidden md:flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 group focus-within:border-[var(--c-accent)]/40 transition-all">
            <Search size={16} className="text-[var(--c-text-dim)] group-focus-within:text-[var(--c-accent)]" />
            <input 
              type="text" 
              placeholder="Search Intelligence..." 
              className="bg-transparent outline-none text-[11px] font-bold uppercase tracking-widest text-white placeholder-[var(--c-text-dim)] w-40"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[var(--c-text-dim)] hover:text-white hover:bg-white/[0.08] transition-all group">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--c-red)] animate-pulse shadow-[0_0_8px_var(--c-red)]" />
            </button>
            <button 
              className="xl:hidden p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[var(--c-text-dim)] hover:text-white"
              onClick={onMenuClick}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
