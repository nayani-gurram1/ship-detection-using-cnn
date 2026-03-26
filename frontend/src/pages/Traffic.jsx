import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation, MapPin, Ship } from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import { Loader, ErrorState, EmptyState } from '../components/StateHandlers'
import { getTraffic } from '../api'

const levelColors = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' }

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.5, ease: 'easeOut' },
})

export default function Traffic() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = () => {
    setLoading(true); setError(false)
    getTraffic().then(r => setData(r.data)).catch(() => setError(true)).finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  if (loading) return <PageWrapper><Loader message="Loading spatial traffic telemetry..." /></PageWrapper>
  if (error) return <PageWrapper><ErrorState message="Failed to synchronize with traffic engine" onRetry={fetchData} /></PageWrapper>

  const zones = data?.zones || []
  if (zones.length === 0) return (
    <PageWrapper>
      <div className="flex flex-col space-y-[var(--section-gap)] pb-[var(--s-3xl)]">
        <motion.div className="mt-10 flex flex-col items-start px-2 text-left" {...fadeUp()}>
          <h1 className="page-title mb-4">Traffic <span className="text-gradient">Intelligence</span></h1>
        </motion.div>
        <div className="glass p-24 text-center border-dashed border-white/10 opacity-40 w-full">
          <Navigation size={64} className="mx-auto text-[var(--c-text-dim)] mb-6" />
          <p className="text-xs font-black uppercase tracking-[0.4em]">No spatial traffic data identified</p>
        </div>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <div className="flex flex-col space-y-[var(--section-gap)] pb-[var(--s-3xl)]">
        {/* Header */}
        <motion.div className="mt-10 flex flex-col items-start px-2 text-left" {...fadeUp()}>
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--c-green)]/10 border border-[var(--c-green)]/20 mb-6">
            <Navigation size={14} className="text-[var(--c-green)] animate-pulse" />
            <span className="text-[10px] font-black text-[var(--c-green)] tracking-[0.3em] uppercase">Spatial Density Intelligence</span>
          </div>
          <h1 className="page-title mb-4">
            Maritime <span className="text-gradient">Traffic Analysis</span>
          </h1>
          <p className="text-[var(--c-text-dim)] text-lg max-w-2xl leading-relaxed font-medium opacity-70">
            Real-time zone-based monitoring of vessel density and restricted area violations.
          </p>
        </motion.div>

        {/* Zone Stats Grid */}
        <motion.div className="grid grid-cols-2 xl:grid-cols-4 gap-8 w-full text-left" {...fadeUp(0.1)}>
          {zones.map((z, i) => (
            <motion.div
              key={i}
              className="glass p-8 relative overflow-hidden group border-white/5 hover:bg-white/[0.04] transition-all duration-500 shadow-2xl min-h-[220px] flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <div className="flex items-center gap-5 mb-8">
                <div className="w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 shadow-xl transition-transform group-hover:scale-110" style={{ background: `${levelColors[z.traffic_level]}15`, border: `1px solid ${levelColors[z.traffic_level]}25` }}>
                  <Navigation size={22} style={{ color: levelColors[z.traffic_level] }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] text-clamp-1 mb-2 opacity-50 group-hover:opacity-100 transition-opacity leading-none">{z.zone}</p>
                  <span className="badge text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md" style={{ background: `${levelColors[z.traffic_level]}15`, color: levelColors[z.traffic_level], border: `1px solid ${levelColors[z.traffic_level]}20` }}>
                    {z.traffic_level} Density
                  </span>
                </div>
              </div>
              <div>
                <p className="text-5xl font-black text-white tracking-tighter leading-none mb-3">{z.ship_count}</p>
                <p className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.2em] opacity-50">Identified Vessels</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1.5 transition-all group-hover:h-2" style={{ background: levelColors[z.traffic_level], opacity: 0.5 }} />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Visual zone map */}
          <motion.div className="glass p-10 border-white/5 shadow-2xl flex flex-col" {...fadeUp(0.15)}>
            <div className="flex items-center justify-between mb-10 shrink-0">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em] opacity-50">Spatial Topology Map</h3>
              <div className="p-2.5 rounded-xl bg-[var(--c-accent)]/10 text-[var(--c-accent)]">
                <MapPin size={18} />
              </div>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden border border-white/5 bg-[#030712] shadow-inner radar-grid">
              {data?.traffic_zones?.map((tz) => {
                const zd = zones.find(z => z.zone === tz.name)
                const c = zd ? levelColors[zd.traffic_level] : 'var(--c-text-dim)'
                return (
                  <div key={tz.id} className="absolute flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 transition-all duration-700 hover:scale-105 group/zone" style={{
                    left: `${(tz.bounds[0]/700)*100}%`, top: `${(tz.bounds[1]/500)*100}%`,
                    width: `${((tz.bounds[2]-tz.bounds[0])/700)*100}%`, height: `${((tz.bounds[3]-tz.bounds[1])/500)*100}%`,
                    borderColor: `${c}40`, background: `${c}08`,
                  }}>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-center leading-tight mb-2 group-hover/zone:scale-110 transition-transform" style={{ color: c }}>{tz.name}</span>
                    {zd && <span className="text-lg font-black font-mono tracking-tighter" style={{ color: c }}>{zd.ship_count}</span>}
                  </div>
                )
              })}
              {data?.restricted_zones?.map(rz => (
                <div key={rz.id} className="absolute flex items-center justify-center border-2 border-red-500/40 rounded-2xl bg-red-500/10 backdrop-blur-[2px] shadow-[inset_0_0_40px_rgba(239,68,68,0.1)] animate-pulse" style={{
                  left: `${(rz.bounds[0]/700)*100}%`, top: `${(rz.bounds[1]/500)*100}%`,
                  width: `${((rz.bounds[2]-rz.bounds[0])/700)*100}%`, height: `${((rz.bounds[3]-rz.bounds[1])/500)*100}%`,
                }}>
                  <span className="text-[10px] text-red-400 font-black uppercase tracking-[0.3em] text-center leading-tight px-3 py-1 bg-black/40 rounded-lg border border-red-500/20">RESTRICTED: {rz.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Density bars */}
          <motion.div className="glass p-10 border-white/5 shadow-2xl" {...fadeUp(0.2)}>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em] opacity-50">Fleet Density Heatmap</h3>
              <div className="p-2.5 rounded-xl bg-[var(--c-cyan)]/10 text-[var(--c-cyan)]">
                <Ship size={18} />
              </div>
            </div>
            <div className="space-y-8">
              {zones.map((z, i) => {
                const max = Math.max(...zones.map(x => x.ship_count), 1)
                const pct = (z.ship_count / max) * 100
                return (
                  <motion.div key={i} className="group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full shadow-lg group-hover:scale-150 transition-transform" style={{ background: levelColors[z.traffic_level] }} />
                        <span className="text-sm font-black text-white uppercase tracking-widest opacity-80">{z.zone}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black font-mono tracking-tighter" style={{ color: levelColors[z.traffic_level] }}>{z.ship_count}</span>
                        <span className="text-[9px] font-black text-[var(--c-text-dim)] uppercase tracking-widest opacity-40">Vessels</span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.03] border border-white/5 overflow-hidden shadow-inner p-0.5">
                      <motion.div
                        className="h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.3)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ background: `linear-gradient(90deg, ${levelColors[z.traffic_level]}44, ${levelColors[z.traffic_level]})` }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
