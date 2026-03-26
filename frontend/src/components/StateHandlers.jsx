/**
 * Loader — full-section loading spinner with optional message.
 * ErrorState — error display with retry button.
 * EmptyState — placeholder for no-data states.
 */
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react'

export function Loader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 w-full">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 border-4 border-[var(--c-accent)]/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.4em] opacity-60 animate-pulse">{message}</p>
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-8 w-full glass border-dashed border-white/10">
      <div className="w-16 h-16 rounded-[24px] bg-[var(--c-red)]/10 flex items-center justify-center shadow-xl border border-[var(--c-red)]/20">
        <AlertCircle size={32} className="text-[var(--c-red)]" />
      </div>
      <div className="text-center space-y-3">
        <p className="text-xs font-black text-white uppercase tracking-[0.3em]">{message}</p>
        <p className="text-[10px] text-[var(--c-text-dim)] font-bold uppercase tracking-widest opacity-50">System synchronization failure</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95"
        >
          <RefreshCw size={14} className="text-[var(--c-accent)]" /> Re-Initialize System
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, message = 'No data available', hint }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-8 w-full glass border-dashed border-white/10">
      <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center opacity-30">
        <Icon size={32} className="text-[var(--c-text-dim)]" />
      </div>
      <div className="text-center space-y-3">
        <p className="text-xs font-black text-white uppercase tracking-[0.3em]">{message}</p>
        {hint && <p className="text-[10px] text-[var(--c-text-dim)] font-bold uppercase tracking-widest opacity-40">{hint}</p>}
      </div>
    </div>
  )
}
