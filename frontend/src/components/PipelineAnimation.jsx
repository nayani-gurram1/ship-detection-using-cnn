import { useEffect, useState } from 'react'
import {
  Upload, ScanSearch, Tag, Route, BarChart3, Bell
} from 'lucide-react'

const steps = [
  { icon: Upload,      label: 'Upload',         color: '#6366f1' },
  { icon: ScanSearch,  label: 'Detection',      color: '#06b6d4' },
  { icon: Tag,         label: 'Classification', color: '#f59e0b' },
  { icon: Route,       label: 'Tracking',       color: '#10b981' },
  { icon: BarChart3,   label: 'Analytics',      color: '#a855f7' },
  { icon: Bell,        label: 'Alerts',         color: '#ef4444' },
]

export default function PipelineAnimation() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % steps.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
        {steps.map((step, i) => {
          const Icon = step.icon
          const isActive = i === active
          const isPast = i < active
          return (
            <div key={step.label} className="flex items-center flex-1 w-full md:w-auto">
              <div className="flex flex-col items-center gap-4 flex-1">
                <div
                  className="w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-700 relative group shadow-xl"
                  style={{
                    background: isActive ? `${step.color}20` : isPast ? `${step.color}10` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isActive ? step.color : isPast ? `${step.color}40` : 'rgba(255,255,255,0.05)'}`,
                    transform: isActive ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                    boxShadow: isActive ? `0 10px 30px ${step.color}30` : 'none',
                  }}
                >
                  <Icon size={22} style={{ color: isActive || isPast ? step.color : 'rgba(255,255,255,0.2)' }} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-[20px] animate-pulse-slow" style={{ boxShadow: `inset 0 0 15px ${step.color}40` }} />
                  )}
                </div>
                <div className="text-center">
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 block mb-1"
                    style={{ color: isActive ? step.color : 'rgba(255,255,255,0.3)', opacity: isActive ? 1 : 0.6 }}
                  >
                    {step.label}
                  </span>
                  <div className={`w-1 h-1 rounded-full mx-auto transition-all duration-500 ${isActive ? 'scale-150' : 'scale-0'}`} style={{ background: step.color }} />
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block flex-shrink-0 w-12 lg:w-16 h-[1px] bg-white/[0.05] relative -mt-8">
                  <div
                    className="absolute inset-0 transition-all duration-1000 ease-in-out"
                    style={{
                      width: isPast || isActive ? '100%' : '0%',
                      background: `linear-gradient(90deg, ${steps[i].color}, ${steps[i + 1].color})`,
                      boxShadow: isPast || isActive ? `0 0 10px ${steps[i].color}40` : 'none'
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
