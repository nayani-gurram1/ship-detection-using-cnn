import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Ship, ShieldAlert, AlertTriangle, CheckCircle, Crosshair,
  Activity, TrendingUp, Clock, Zap, Eye, ArrowRight, Upload, Info
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import PageWrapper from '../components/PageWrapper'
import PipelineAnimation from '../components/PipelineAnimation'
import { Loader, ErrorState, EmptyState } from '../components/StateHandlers'
import { getDashboardStats, getDetections } from '../api'

const mockTrends = [
  { name: 'Mon', detections: 12 },
  { name: 'Tue', detections: 19 },
  { name: 'Wed', detections: 15 },
  { name: 'Thu', detections: 22 },
  { name: 'Fri', detections: 30 },
  { name: 'Sat', detections: 25 },
  { name: 'Sun', detections: 32 },
]

const mockRisk = [
  { name: 'Legal', value: 65, color: '#10b981' },
  { name: 'Illegal', value: 15, color: '#ef4444' },
  { name: 'Suspicious', value: 20, color: '#f59e0b' },
]

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.5, ease: 'easeOut' },
})

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const fetchData = () => {
    setLoading(true); setError(false)
    Promise.all([
      getDashboardStats().then(r => setStats(r.data)),
      getDetections(5).then(r => setRecent(r.data)),
    ])
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <PageWrapper><Loader message="Initializing maritime intelligence..." /></PageWrapper>
  if (error) return <PageWrapper><ErrorState message="Failed to synchronize with detection engine" onRetry={fetchData} /></PageWrapper>

  return (
    <PageWrapper>
      <div className="flex flex-col space-y-[var(--section-gap)] pb-[var(--s-3xl)]">
        {/* ─── 1. HERO SECTION ─── */}
        <section className="relative w-full min-h-[560px] flex items-center justify-center overflow-hidden rounded-[48px] shadow-2xl mt-10 border border-white/5 text-center">
          <div 
            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=2000")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 backdrop-blur-[2px]" />
          
          <div className="relative z-10 max-w-5xl mx-auto px-8 py-20">
            <motion.div {...fadeUp()}>
              <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 shadow-xl">
                <div className="w-2 h-2 rounded-full bg-[var(--c-accent)] animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                <span className="text-[11px] font-black text-white tracking-[0.35em] uppercase opacity-90">Neural Radar Intelligence v2.4</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                Ship Detection with <span className="text-gradient">Faster R-CNN</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-12 font-medium leading-relaxed opacity-90">
                Enterprise-grade maritime surveillance powered by advanced deep learning and high-resolution airborne radar analysis.
              </p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <button 
                  className="px-10 py-4.5 rounded-2xl bg-[var(--c-accent)] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-[var(--c-accent-hover)] transition-all shadow-[0_8px_25px_-5px_rgba(59,130,246,0.5)] active:scale-95" 
                  onClick={() => navigate('/detection')}
                >
                  Initiate Detection
                </button>
                <button 
                  className="px-10 py-4.5 rounded-2xl bg-white/5 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/10 backdrop-blur-xl active:scale-95 shadow-2xl" 
                  onClick={() => navigate('/analytics')}
                >
                  System Analytics
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── 2. CORE METRICS ─── */}
        <motion.section {...fadeUp(0.1)} className="w-full">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="text-left">
              <h3 className="text-3xl font-black text-white tracking-tight mb-2">Fleet Intelligence</h3>
              <p className="text-sm font-bold text-[var(--c-text-dim)] uppercase tracking-widest opacity-60">Real-time maritime telemetry</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--c-green)] animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)]" /> 
              <span className="text-[11px] font-black text-[var(--c-text-bright)] uppercase tracking-[0.2em]">Synchronized</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <MetricCard label="Total Identified" value={stats?.total_ships ?? 0} color="var(--c-accent)" icon={Ship} trend="+12.4%" />
            <MetricCard label="Authorized" value={stats?.legal ?? 0} color="var(--c-green)" icon={CheckCircle} trend="+5.2%" />
            <MetricCard label="Unauthorized" value={stats?.illegal ?? 0} color="var(--c-red)" icon={ShieldAlert} trend="-2.1%" />
            <MetricCard label="Suspicious" value={stats?.suspicious ?? 0} color="var(--c-amber)" icon={AlertTriangle} trend="+8.7%" />
          </div>
        </motion.section>

        {/* ─── 3. CHARTS SECTION ─── */}
        <motion.section {...fadeUp(0.2)} className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full">
          <div className="lg:col-span-3 glass p-10 shadow-2xl border-white/5 text-left">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.25em] mb-2">Detection Trajectory</h4>
                <p className="text-xs font-bold text-[var(--c-text-dim)]">+12% surge in positive identifications</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--c-accent)]/10 text-[var(--c-accent)]">
                <TrendingUp size={22} />
              </div>
            </div>
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrends}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={11} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false} 
                    dy={15}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={11} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--c-bg2)', 
                      border: '1px solid var(--c-border)', 
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                      padding: '12px 16px'
                    }}
                    itemStyle={{ color: 'var(--c-accent)', fontWeight: '800', fontSize: '12px' }}
                    labelStyle={{ color: 'var(--c-text-dim)', marginBottom: '8px', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="detections" 
                    stroke="var(--c-accent)" 
                    strokeWidth={4} 
                    dot={{ fill: 'var(--c-bg)', stroke: 'var(--c-accent)', strokeWidth: 2, r: 6 }} 
                    activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--c-accent)' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 glass p-10 shadow-2xl border-white/5 text-left">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.25em] mb-2">Risk Classification</h4>
                <p className="text-xs font-bold text-[var(--c-text-dim)]">Fleet security distribution</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--c-pink)]/10 text-[var(--c-pink)]">
                <Activity size={22} />
              </div>
            </div>
            <div className="h-[340px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockRisk}
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {mockRisk.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--c-bg2)', 
                      border: '1px solid var(--c-border)', 
                      borderRadius: '16px',
                      padding: '12px 16px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={40}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-[11px] font-bold text-[var(--c-text-dim)] uppercase tracking-widest ml-2">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* ─── 4. ALERTS SECTION ─── */}
        <motion.section {...fadeUp(0.3)} className="w-full text-left">
          <div className="flex items-center justify-between mb-10 px-2">
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-2">Critical Alerts</h3>
              <p className="text-sm font-bold text-[var(--c-text-dim)] uppercase tracking-widest opacity-60">Immediate intervention required</p>
            </div>
            <button 
              className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black text-[var(--c-accent)] uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-xl" 
              onClick={() => navigate('/alerts')}
            >
              Historical Archive
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats?.active_alerts > 0 ? (
              <>
                <AlertCard severity="critical" message="Restricted zone violation detected: Alpha Sector 4 (Zone-B)" time="2 mins ago" />
                <AlertCard severity="warning" message="Anomalous vessel trajectory detected near maritime corridor" time="15 mins ago" />
                <AlertCard severity="info" message="AI engine recalibration: Processing efficiency at 98.4%" time="1 hour ago" />
              </>
            ) : (
              <div className="col-span-full h-40 flex items-center justify-center glass border-dashed opacity-40">
                <p className="text-xs font-black uppercase tracking-[0.4em]">No operational threats identified</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* ─── 5. AI PIPELINE ─── */}
        <motion.section {...fadeUp(0.4)} className="w-full text-left">
          <div className="mb-14 px-2">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.4em] mb-3">AI Processing Pipeline</h4>
            <p className="text-xs font-bold text-[var(--c-text-dim)] opacity-60 uppercase tracking-widest">ResNet50-FPN + Faster R-CNN Architecture</p>
          </div>
          <div className="glass p-12 shadow-2xl border-white/5">
            <PipelineAnimation />
          </div>
        </motion.section>

        {/* ─── 6. FOOTER / SYSTEM INFO ─── */}
        <motion.footer {...fadeUp(0.5)} className="pt-32 pb-24 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-24 text-left w-full">
            <div className="space-y-10">
              <div className="flex flex-col items-start gap-8">
                <div className="w-14 h-14 rounded-[20px] bg-gradient-to-tr from-[var(--c-accent)] to-[var(--c-purple)] flex items-center justify-center text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
                  <Ship size={28} />
                </div>
                <span className="text-3xl font-black text-white tracking-tighter uppercase">ShipDetect<span className="text-[var(--c-accent)]">AI</span></span>
              </div>
              <p className="text-sm text-[var(--c-text-dim)] leading-relaxed font-semibold opacity-70 max-w-sm">
                Next-generation autonomous maritime intelligence utilizing high-fidelity airborne radar telemetry for global vessel identification.
              </p>
            </div>
            <div className="space-y-10">
              <h5 className="text-[12px] font-black text-white uppercase tracking-[0.4em] opacity-40 mb-8">Operational Status</h5>
              <div className="space-y-5">
                <StatusRow label="Detection Engine" status="Optimal" color="var(--c-green)" />
                <StatusRow label="Architecture" status="Faster R-CNN" color="var(--c-accent)" />
                <StatusRow label="Backbone Net" status="ResNet50-FPN" color="var(--c-cyan)" />
              </div>
            </div>
            <div className="space-y-10">
              <h5 className="text-[12px] font-black text-white uppercase tracking-[0.4em] opacity-40 mb-8">System Protocols</h5>
              <p className="text-[11px] text-[var(--c-text-dim)] font-bold leading-[2.2] tracking-[0.25em] opacity-70">
                ISO 27001 ENCRYPTED PIPELINE<br />
                GDPR COMPLIANT ARCHITECTURE<br />
                MARITIME PROTOCOL v2.4.8<br />
                SECURE END-TO-END TLS
              </p>
            </div>
          </motion.footer>
        </div>
    </PageWrapper>
  )
}

function MetricCard({ label, value, color, icon: Icon, trend }) {
  return (
    <div className="glass p-10 group hover:glow-accent transition-all duration-500 relative overflow-hidden border-white/5 flex flex-col justify-between min-h-[240px]">
      <div className="absolute -right-8 -top-8 opacity-[0.02] group-hover:opacity-[0.1] transition-all duration-1000 scale-150">
        <Icon size={140} />
      </div>
      <div className="flex items-center justify-between mb-10">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.08] transition-all shadow-xl group-hover:scale-110">
          <Icon size={28} style={{ color }} />
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-green)]/10 text-[var(--c-green)] border border-[var(--c-green)]/20 shadow-sm">
          <TrendingUp size={16} />
          <span className="text-[12px] font-black tracking-tight">{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-[12px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.35em] mb-3 opacity-60">{label}</p>
        <p className="text-5xl font-black text-white tracking-tighter leading-none">{value.toLocaleString()}</p>
      </div>
    </div>
  )
}

function AlertCard({ severity, message, time }) {
  const color = severity === 'critical' ? 'var(--c-red)' : severity === 'warning' ? 'var(--c-amber)' : 'var(--c-cyan)'
  const Icon = severity === 'critical' ? ShieldAlert : severity === 'warning' ? AlertTriangle : Info
  
  return (
    <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all relative overflow-hidden group shadow-2xl flex flex-col justify-between min-h-[320px]">
      <div className="absolute left-0 top-0 bottom-0 w-2 group-hover:w-2.5 transition-all" style={{ background: color }} />
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg" style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
              <Icon size={22} style={{ color }} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full shadow-inner" style={{ background: `${color}15`, color, border: `1px solid ${color}20` }}>
              {severity}
            </span>
          </div>
          <span className="text-[11px] text-[var(--c-text-dim)] font-black uppercase tracking-widest opacity-40">{time}</span>
        </div>
        <p className="text-lg text-slate-200 font-bold leading-relaxed mb-10 opacity-90">{message}</p>
      </div>
      <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-black text-[var(--c-text-dim)] hover:text-white transition-all flex items-center justify-center gap-4 group/btn uppercase tracking-[0.3em] active:scale-95 shadow-xl">
        Acknowledge System <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
      </button>
    </div>
  )
}

function StatusRow({ label, status, color }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-white/[0.03] transition-all group border border-transparent hover:border-white/5">
      <span className="text-[11px] font-black text-[var(--c-text-dim)] uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-black text-white uppercase tracking-widest opacity-80">{status}</span>
        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-125 transition-transform" style={{ background: color }} />
      </div>
    </div>
  )
}
