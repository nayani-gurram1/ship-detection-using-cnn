import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, PieChart, Activity, Target } from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import { Loader, ErrorState } from '../components/StateHandlers'
import { getAnalytics } from '../api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RPie, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#ec4899']

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}
const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.5, ease: 'easeOut' },
})

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = () => {
    setLoading(true); setError(false)
    getAnalytics()
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <PageWrapper><Loader message="Aggregating performance telemetry..." /></PageWrapper>
  if (error) return <PageWrapper><ErrorState message="Failed to synchronize with analytics engine" onRetry={fetchData} /></PageWrapper>

  const riskPie = data?.risk_distribution
    ? Object.entries(data.risk_distribution).map(([name, value]) => ({ name, value }))
    : []

  return (
    <PageWrapper>
      <div className="flex flex-col space-y-[var(--section-gap)] pb-[var(--s-3xl)]">
        {/* Header */}
        <motion.div className="mt-10 flex flex-col items-start px-2 text-left" {...fadeUp()}>
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--c-cyan)]/10 border border-[var(--c-cyan)]/20 mb-6">
            <Activity size={14} className="text-[var(--c-cyan)]" />
            <span className="text-[10px] font-black text-[var(--c-cyan)] tracking-[0.3em] uppercase">Model Performance Metrics</span>
          </div>
          <h1 className="page-title mb-4">
            System <span className="text-gradient-cyan">Intelligence Analytics</span>
          </h1>
          <p className="text-[var(--c-text-dim)] text-lg max-w-2xl leading-relaxed font-medium opacity-70">
            In-depth analysis of neural network performance and maritime traffic distribution.
          </p>
        </motion.div>

        {/* Summary Metrics */}
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full" {...fadeUp(0.1)}>
          <AnalyticMetric label="Global Scans" value={data.total_scans} color="var(--c-accent)" icon={BarChart3} />
          <AnalyticMetric label="Mean Density" value={data.average_ships_per_scan} color="var(--c-green)" icon={TrendingUp} />
          <AnalyticMetric label="Inference Latency" value="0.15s" color="var(--c-amber)" icon={Activity} />
          <AnalyticMetric label="Model Accuracy" value="92.4%" color="var(--c-cyan)" icon={Target} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full text-left">
          {/* Trend Chart */}
          <motion.div className="glass p-10 border-white/5 shadow-2xl flex flex-col" {...fadeUp(0.15)}>
            <div className="flex items-center justify-between mb-10 shrink-0">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em] opacity-50">Identification Trajectory</h3>
              <div className="p-2.5 rounded-xl bg-[var(--c-accent)]/10 text-[var(--c-accent)]">
                <TrendingUp size={18} />
              </div>
            </div>
            {data?.trend?.length > 0 ? (
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="scan_id" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--c-bg2)', border: '1px solid var(--c-border)', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                      itemStyle={{ fontWeight: 800, fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="total" stroke="var(--c-accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--c-bg)', strokeWidth: 2 }} name="Total Detections" />
                    <Line type="monotone" dataKey="legal" stroke="var(--c-green)" strokeWidth={2} dot={{ r: 3, fill: 'var(--c-bg)', strokeWidth: 2 }} name="Authorized" />
                    <Line type="monotone" dataKey="illegal" stroke="var(--c-red)" strokeWidth={2} dot={{ r: 3, fill: 'var(--c-bg)', strokeWidth: 2 }} name="Unauthorized" />
                    <Legend wrapperStyle={{ paddingTop: 30, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[360px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting performance data</p>
              </div>
            )}
          </motion.div>

          {/* Risk Distribution */}
          <motion.div className="glass p-10 border-white/5 shadow-2xl flex flex-col" {...fadeUp(0.2)}>
            <div className="flex items-center justify-between mb-10 shrink-0">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em] opacity-50">Fleet Risk Classification</h3>
              <div className="p-2.5 rounded-xl bg-[var(--c-pink)]/10 text-[var(--c-pink)]">
                <PieChart size={18} />
              </div>
            </div>
            {riskPie.some(d => d.value > 0) ? (
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RPie>
                    <Pie
                      data={riskPie}
                      cx="50%" cy="50%"
                      innerRadius={90} outerRadius={130}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {riskPie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--c-bg2)', border: '1px solid var(--c-border)', borderRadius: 16 }}
                      itemStyle={{ fontWeight: 800, fontSize: 12 }}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }} />
                  </RPie>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[360px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting risk metrics</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Density Bar Chart */}
        <motion.div className="glass p-10 border-white/5 shadow-2xl" {...fadeUp(0.25)}>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em] opacity-50">Spatial Scan Density</h3>
            <div className="p-2.5 rounded-xl bg-[var(--c-amber)]/10 text-[var(--c-amber)]">
              <BarChart3 size={18} />
            </div>
          </div>
          {data?.trend?.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="scan_id" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: 'var(--c-bg2)', border: '1px solid var(--c-border)', borderRadius: 16 }}
                  />
                  <Bar dataKey="legal" stackId="a" fill="var(--c-green)" radius={[0, 0, 0, 0]} name="Authorized" />
                  <Bar dataKey="suspicious" stackId="a" fill="var(--c-amber)" name="Suspicious" />
                  <Bar dataKey="illegal" stackId="a" fill="var(--c-red)" radius={[6, 6, 0, 0]} name="Unauthorized" />
                  <Legend wrapperStyle={{ paddingTop: 30, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl opacity-30">
              <p className="text-[10px] font-black uppercase tracking-widest">Awaiting spatial data</p>
            </div>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  )
}

function AnalyticMetric({ label, value, color, icon: Icon }) {
  return (
    <div className="glass p-8 flex flex-col items-start text-left border-white/5 group shadow-2xl hover:glow-accent transition-all duration-500 min-h-[180px] justify-between">
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
