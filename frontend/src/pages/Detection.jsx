import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Loader2, Crosshair, Eye, Ship, ShieldAlert, AlertTriangle,
  CheckCircle, Gauge, MapPin, ArrowRight, CloudUpload, Sparkles,
  Target, Activity
} from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import ShipDetailPanel from '../components/ShipDetailPanel'
import { detectShips } from '../api'

const classConfig = {
  Legal:      { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  icon: CheckCircle },
  Illegal:    { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   icon: ShieldAlert },
  Suspicious: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: AlertTriangle },
}

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
})

export default function Detection() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [confidence, setConfidence] = useState(0.5)
  const [selectedShip, setSelectedShip] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [model, setModel] = useState('frcnn')
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setSelectedShip(null)
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0])
  }

  const runDetection = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const res = await detectShips(file, confidence)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Detection failed. Check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  const totalShips = result?.total_ships ?? 0
  const legalPct = totalShips > 0 ? ((result.summary.legal / totalShips) * 100).toFixed(1) : 0
  const illegalPct = totalShips > 0 ? ((result.summary.illegal / totalShips) * 100).toFixed(1) : 0
  const suspPct = totalShips > 0 ? ((result.summary.suspicious / totalShips) * 100).toFixed(1) : 0

  return (
    <PageWrapper>
      <div className="flex flex-col items-center space-y-[var(--section-gap)] pb-[var(--s-3xl)]">
        <ShipDetailPanel ship={selectedShip} onClose={() => setSelectedShip(null)} />

        {/* Hidden File Input */}
        <input 
          ref={inputRef} 
          type="file" 
          accept="image/*" 
          className="hidden"
          onChange={(e) => {
            if (e.target.files[0]) {
              handleFile(e.target.files[0])
              e.target.value = ''
            }
          }} 
        />

        {/* Header */}
        <motion.div className="text-left mt-10 px-2 w-full" {...fadeUp()}>
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--c-accent)]/10 border border-[var(--c-accent)]/20 mb-6">
            <Sparkles size={14} className="text-[var(--c-accent)]" />
            <span className="text-[10px] font-black text-[var(--c-accent)] tracking-[0.3em] uppercase">Enterprise Detection Engine</span>
          </div>
          <h1 className="page-title mb-4">
            Vessel <span className="text-gradient">Identification</span>
          </h1>
          <p className="text-[var(--c-text-dim)] text-lg max-w-2xl leading-relaxed font-medium opacity-70">
            Analyze high-resolution maritime imagery using our neural radar intelligence pipeline.
          </p>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2 — HERO UPLOAD
            ═══════════════════════════════════════════════════════ */}
        <motion.div {...fadeUp(0.1)} className="w-full">
          <div
            className={`
              relative w-full aspect-video md:aspect-[21/9] rounded-[40px] border-2 border-dashed transition-all duration-700 group cursor-pointer overflow-hidden
              ${dragOver ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 scale-[0.99]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'}
              ${preview ? 'border-solid border-white/5 bg-transparent' : ''}
            `}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(e) }}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <div className="p-8 w-full h-full flex flex-col items-center justify-center">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500">
                  <img src={preview} alt="Preview" className="max-h-[500px] object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                        <Upload size={32} />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-white">Replace Imagery</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 rounded-[32px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-[var(--c-text-dim)] mb-8 group-hover:scale-110 group-hover:text-[var(--c-accent)] group-hover:border-[var(--c-accent)]/20 transition-all duration-500 shadow-2xl">
                  <Upload size={40} className="group-hover:translate-y-[-4px] transition-transform" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-4">
                  Deploy Satellite Imagery
                </h3>
                <p className="text-[var(--c-text-dim)] text-xs font-bold uppercase tracking-[0.3em] opacity-40 group-hover:opacity-80 transition-opacity">
                  Drag and drop file or click to browse telemetry
                </p>
                <div className="mt-10 flex items-center gap-6">
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-[var(--c-text-dim)]">PNG / JPEG / TIFF</div>
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-[var(--c-text-dim)]">MAX 10MB</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 3 — CONTROLS BAR
            ═══════════════════════════════════════════════════════ */}
        <motion.div className="w-full" {...fadeUp(0.15)}>
          <div className="glass p-8 md:p-10 shadow-2xl border-white/5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-10">
              {/* Confidence */}
              <div className="flex-1 min-w-0 space-y-5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] opacity-50">
                    Analysis Sensitivity
                  </label>
                  <span className="text-sm font-black text-[var(--c-accent)] font-mono bg-[var(--c-accent)]/10 px-3 py-1 rounded-lg border border-[var(--c-accent)]/20">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
                <div className="relative flex items-center group">
                  <input type="range" min="0.1" max="0.95" step="0.05" value={confidence}
                    onChange={(e) => setConfidence(parseFloat(e.target.value))} className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer focus:outline-none" />
                </div>
              </div>

              {/* Model */}
              <div className="lg:w-72 space-y-5 text-left">
                <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] opacity-50">
                  Detection Architecture
                </label>
                <div className="flex gap-3 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl">
                  {[
                    { id: 'frcnn', label: 'Faster R-CNN' },
                    { id: 'yolo',  label: 'YOLOv8' },
                  ].map(m => (
                    <button key={m.id} onClick={() => setModel(m.id)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                        model === m.id
                          ? 'bg-[var(--c-accent)] text-white shadow-lg'
                          : 'text-[var(--c-text-dim)] hover:text-white hover:bg-white/5'
                      }`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Run */}
              <button 
                onClick={runDetection} 
                disabled={!file || loading}
                className="btn-primary min-w-[220px] h-16 rounded-[20px] shadow-[0_8px_25px_-5px_rgba(59,130,246,0.4)]"
              >
                {loading ? (
                  <><Loader2 size={22} className="animate-spin" /> <span className="uppercase tracking-[0.2em] font-black text-xs">Processing...</span></>
                ) : (
                  <><Sparkles size={22} /> <span className="uppercase tracking-[0.2em] font-black text-xs">Execute Scan</span></>
                )}
              </button>
            </div>

            {error && (
              <motion.div 
                className="flex items-center gap-3 mt-10 p-5 rounded-2xl bg-red-500/10 border border-red-500/20"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              >
                <AlertTriangle size={20} className="text-[var(--c-red)] shrink-0" />
                <p className="text-xs text-[var(--c-red)] font-bold tracking-tight">{error}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            RESULTS — only visible after detection
            ═══════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {result && (
            <motion.div 
              className="flex flex-col space-y-[var(--section-gap)] w-full"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >

              {/* ── IMAGE COMPARISON ── */}
              <motion.div {...fadeUp(0.05)} className="text-left">
                <SectionHeader icon={Eye} title="Analysis Results" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
                  <ImageCard label="Original Telemetry" src={preview} />
                  <ImageCard label="Detection Overlay" src={result.result_image} highlight />
                </div>
              </motion.div>

              {/* ── DETECTION SUMMARY ── */}
              <motion.div {...fadeUp(0.1)} className="text-left">
                <SectionHeader icon={Activity} title="Fleet Intelligence Summary" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mt-10">
                  <SummaryCard icon={Ship}          label="Vessels Found"  value={result.total_ships}           color="var(--c-accent)" />
                  <SummaryCard icon={CheckCircle}   label="Authorized"     value={result.summary.legal}         color="var(--c-green)" />
                  <SummaryCard icon={ShieldAlert}   label="Unauthorized"   value={result.summary.illegal}       color="var(--c-red)" />
                  <SummaryCard icon={AlertTriangle}  label="Suspicious"    value={result.summary.suspicious}    color="var(--c-amber)" />
                  <SummaryCard icon={Target}        label="Collisions"     value={result.collisions?.length ?? 0} color="var(--c-pink)" />
                  <SummaryCard icon={Gauge}         label="Mean Risk"      value={result.ships?.length > 0 ? Math.round(result.ships.reduce((a, s) => a + s.risk_score, 0) / result.ships.length) : 0} color="var(--c-cyan)" />
                </div>
              </motion.div>

              {/* ── CLASSIFICATION BREAKDOWN ── */}
              <motion.div {...fadeUp(0.15)} className="text-left">
                <SectionHeader icon={Crosshair} title="Classification Distribution" />
                <div className="glass p-10 mt-10 space-y-12 border-white/5">
                  <ProgressRow label="Authorized Fleet"      count={result.summary.legal}      total={totalShips} pct={legalPct}   color="#10b981" />
                  <ProgressRow label="Unauthorized Entities"  count={result.summary.illegal}    total={totalShips} pct={illegalPct}  color="#ef4444" />
                  <ProgressRow label="Suspicious Objects"    count={result.summary.suspicious} total={totalShips} pct={suspPct}    color="#f59e0b" />
                </div>
              </motion.div>

              {/* ── VESSELS TABLE ── */}
              {result?.ships?.length > 0 && (
                <motion.div {...fadeUp(0.2)}>
                  <SectionHeader icon={Ship} title={`Identified Vessels (${result.ships.length})`} />
                  <div className="glass mt-10 overflow-hidden border-white/5 shadow-2xl w-full">
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto w-full">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="bg-white/[0.02] text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.25em] border-b border-white/5">
                            <th className="py-6 px-8 w-20">Index</th>
                            <th className="py-6 px-8 w-40">Identity Hash</th>
                            <th className="py-6 px-8 w-60">Neural Confidence</th>
                            <th className="py-6 px-8 w-40">Status</th>
                            <th className="py-6 px-8 w-32">Risk Rating</th>
                            <th className="py-6 px-8 w-48">Deployment Zone</th>
                            <th className="py-6 px-8 text-right w-40">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {result.ships.map((s, i) => (
                            <motion.tr key={s.id}
                              className="group hover:bg-white/[0.02] transition-colors"
                              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.02 * i }}>
                              <td className="py-6 px-8 text-xs font-black text-[var(--c-text-dim)]">{i + 1}</td>
                              <td className="py-6 px-8 font-mono text-xs font-bold text-white tracking-tighter truncate">{s.id}</td>
                              <td className="py-6 px-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.3)]" style={{ width: `${s.confidence * 100}%`, background: s.confidence > 0.8 ? 'var(--c-green)' : 'var(--c-amber)' }} />
                                  </div>
                                  <span className="font-mono text-[11px] font-black shrink-0" style={{ color: s.confidence > 0.8 ? 'var(--c-green)' : 'var(--c-amber)' }}>
                                    {(s.confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-6 px-8">
                                <span className="badge" style={{ background: classConfig[s.classification]?.bg, color: classConfig[s.classification]?.color, border: `1px solid ${classConfig[s.classification]?.color}20` }}>
                                  {s.classification}
                                </span>
                              </td>
                              <td className="py-6 px-8">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-black font-mono tracking-tighter" style={{ color: s.risk_score > 60 ? 'var(--c-red)' : s.risk_score > 30 ? 'var(--c-amber)' : 'var(--c-green)' }}>
                                    {s.risk_score}
                                  </span>
                                  <span className="text-[9px] font-black text-[var(--c-text-dim)] uppercase tracking-widest opacity-40">Risk</span>
                                </div>
                              </td>
                              <td className="py-6 px-8 text-[11px] font-bold text-[var(--c-text-dim)] uppercase tracking-widest truncate">{s.zone}</td>
                              <td className="py-6 px-8 text-right">
                                <button onClick={() => setSelectedShip(s)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-[var(--c-accent)] uppercase tracking-widest hover:bg-[var(--c-accent)] hover:text-white transition-all active:scale-95 shadow-lg">
                                  Intelligence →
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden p-6 space-y-6">
                      {result.ships.map(s => (
                        <div key={s.id} className="glass p-6 border-white/5 cursor-pointer active:scale-95 transition-transform" onClick={() => setSelectedShip(s)}>
                          <div className="flex items-center justify-between mb-5">
                            <span className="font-mono text-xs font-bold text-white">{s.id}</span>
                            <span className="badge" style={{ background: classConfig[s.classification]?.bg, color: classConfig[s.classification]?.color }}>
                              {s.classification}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div><p className="text-[9px] font-black uppercase tracking-widest text-[var(--c-text-dim)] mb-1">Conf</p><p className="font-mono font-black text-white">{(s.confidence * 100).toFixed(0)}%</p></div>
                            <div><p className="text-[9px] font-black uppercase tracking-widest text-[var(--c-text-dim)] mb-1">Risk</p><p className="font-mono font-black" style={{ color: s.risk_score > 60 ? 'var(--c-red)' : 'var(--c-green)' }}>{s.risk_score}</p></div>
                            <div><p className="text-[9px] font-black uppercase tracking-widest text-[var(--c-text-dim)] mb-1">Zone</p><p className="text-white text-xs font-bold text-clamp-1">{s.zone}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── COLLISIONS ── */}
              {result?.collisions?.length > 0 && (
                <motion.div {...fadeUp(0.25)}>
                  <SectionHeader icon={AlertTriangle} title={`Proximity Anomalies (${result.collisions.length})`} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
                    {result.collisions.map((c, i) => (
                      <div key={i} className="glass p-8 relative overflow-hidden group border-white/5 hover:bg-white/[0.04] transition-all shadow-2xl">
                        <div className="absolute top-0 left-0 w-2 h-full rounded-r-full shadow-lg"
                          style={{ background: c.risk_level === 'Critical' ? 'var(--c-red)' : 'var(--c-amber)' }} />
                        <div className="pl-6">
                          <div className="flex items-center justify-between mb-8">
                            <span className="badge" style={{
                              background: c.risk_level === 'Critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                              color: c.risk_level === 'Critical' ? '#f87171' : '#fbbf24',
                              border: `1px solid ${c.risk_level === 'Critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`
                            }}>{c.risk_level} Risk</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black font-mono tracking-tighter" style={{ color: c.risk_level === 'Critical' ? 'var(--c-red)' : 'var(--c-amber)' }}>
                                {c.distance}
                              </span>
                              <span className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-widest opacity-40">Pixels</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-5">
                            <div className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/5 font-mono text-xs font-black text-white text-center shadow-inner">{c.ship_a}</div>
                            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:rotate-180 transition-transform duration-500">
                              <ArrowRight size={16} className="text-[var(--c-text-dim)]" />
                            </div>
                            <div className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/5 font-mono text-xs font-black text-white text-center shadow-inner">{c.ship_b}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── TRAFFIC ── */}
              {result?.traffic?.length > 0 && (
                <motion.div {...fadeUp(0.3)}>
                  <SectionHeader icon={MapPin} title="Operational Zone Intelligence" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-10">
                    {result.traffic.map((t, i) => {
                      const lc = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' }
                      return (
                        <div key={i} className="glass p-8 border-white/5 hover:bg-white/[0.03] transition-all shadow-xl text-center group">
                          <p className="text-[10px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.3em] mb-3 group-hover:text-white transition-colors">{t.zone}</p>
                          <p className="text-5xl font-black tracking-tighter leading-none mb-6" style={{ color: lc[t.traffic_level] }}>{t.ship_count}</p>
                          <span className="badge text-[9px] font-black tracking-widest" style={{ background: `${lc[t.traffic_level]}15`, color: lc[t.traffic_level], border: `1px solid ${lc[t.traffic_level]}20` }}>
                            {t.traffic_level} Density
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        <ShipDetailPanel ship={selectedShip} onClose={() => setSelectedShip(null)} />
      </div>
    </PageWrapper>
  )
}


/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTS — Spacious & Clean
   ═══════════════════════════════════════════════════════ */

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-6 mb-12">
      <div className="w-14 h-14 rounded-[20px] bg-[var(--c-accent)]/10 flex items-center justify-center border border-[var(--c-accent)]/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all group-hover:scale-110">
        <Icon size={26} className="text-[var(--c-accent)]" />
      </div>
      <h2 className="text-3xl font-black text-white tracking-tight leading-none">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent ml-8" />
    </div>
  )
}

function ImageCard({ label, src, highlight }) {
  return (
    <div className={`glass p-10 overflow-hidden group border-white/5 shadow-2xl transition-all duration-500 hover:bg-white/[0.03] ${highlight ? 'ring-2 ring-[var(--c-accent)]/20' : ''}`}>
      <div className="flex items-center justify-between mb-8">
        <p className="text-[12px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.35em] opacity-60">{label}</p>
        <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest shadow-inner">
          High Fidelity Stream
        </div>
      </div>
      <div className="rounded-[24px] overflow-hidden border border-white/10 bg-black/40 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] group-hover:shadow-2xl transition-all duration-700">
        <img src={src} alt={label}
          className="w-full object-contain group-hover:scale-[1.04] transition-transform duration-1000"
          style={{ minHeight: '440px', maxHeight: '600px' }} />
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div className="glass p-10 flex flex-col items-center text-center border-white/5 shadow-2xl group min-h-[220px] justify-center"
      whileHover={{ y: -8, transition: { duration: 0.4, ease: 'easeOut' } }}>
      <div className="w-18 h-18 rounded-[24px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={32} style={{ color }} />
      </div>
      <p className="text-5xl font-black tracking-tighter leading-none mb-4" style={{ color }}>{value}</p>
      <p className="text-[11px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.25em] opacity-50 group-hover:opacity-100 transition-opacity">{label}</p>
    </motion.div>
  )
}

function ProgressRow({ label, count, total, pct, color }) {
  return (
    <div className="group space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-3 h-3 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-150 transition-transform" style={{ background: color }} />
          <span className="text-lg font-black text-white uppercase tracking-widest opacity-80">{label}</span>
        </div>
        <div className="flex items-center gap-10">
          <span className="text-[12px] font-black text-[var(--c-text-dim)] uppercase tracking-[0.3em] opacity-40">{count.toLocaleString()} / {total.toLocaleString()} Identifications</span>
          <span className="text-3xl font-black font-mono tracking-tighter min-w-[80px] text-right" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div className="h-3.5 rounded-full bg-white/[0.03] border border-white/5 overflow-hidden shadow-inner p-1">
        <motion.div className="h-full rounded-full shadow-[0_0_20px_rgba(0,0,0,0.4)]"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

