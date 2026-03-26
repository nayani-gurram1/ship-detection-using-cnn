import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Radar, Ship } from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import { Loader, ErrorState } from '../components/StateHandlers'
import { getTraffic, getDetections } from '../api'

export default function RadarView() {
  const canvasRef = useRef(null)
  const [data, setData] = useState(null)
  const [ships, setShips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const angleRef = useRef(0)
  const animRef = useRef(null)

  const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.5, ease: 'easeOut' },
  })

  const fetchData = () => {
    setLoading(true); setError(false)
    Promise.all([
      getTraffic().then(r => setData(r.data)),
      getDetections(5).then(r => {
        const all = []
        r.data.forEach(d => d.ships.forEach(s => all.push(s)))
        setShips(all)
      }),
    ])
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || loading) return
    const ctx = canvas.getContext('2d')

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }
    resizeCanvas()

    const colors = { Legal: '#10b981', Illegal: '#ef4444', Suspicious: '#f59e0b' }

    const draw = () => {
      const W = canvas.width / (window.devicePixelRatio || 1)
      const H = canvas.height / (window.devicePixelRatio || 1)
      ctx.clearRect(0, 0, W, H)

      // Grid lines
      ctx.strokeStyle = 'rgba(99,102,241,0.06)'; ctx.lineWidth = 1
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

      // Traffic zones
      data?.traffic_zones?.forEach(tz => {
        const [x1,y1,x2,y2] = tz.bounds.map((v,i) => i%2===0 ? v*W/700 : v*H/500)
        ctx.strokeStyle='rgba(99,102,241,0.2)'; ctx.setLineDash([4,4]); ctx.strokeRect(x1,y1,x2-x1,y2-y1); ctx.setLineDash([])
        ctx.fillStyle='rgba(99,102,241,0.4)'; ctx.font='10px Inter'; ctx.fillText(tz.name,x1+4,y1+14)
      })

      // Restricted zones
      data?.restricted_zones?.forEach(rz => {
        const [x1,y1,x2,y2] = rz.bounds.map((v,i) => i%2===0 ? v*W/700 : v*H/500)
        ctx.fillStyle='rgba(239,68,68,0.06)'; ctx.fillRect(x1,y1,x2-x1,y2-y1)
        ctx.strokeStyle='rgba(239,68,68,0.3)'; ctx.lineWidth=2; ctx.setLineDash([6,3]); ctx.strokeRect(x1,y1,x2-x1,y2-y1); ctx.setLineDash([])
        ctx.fillStyle='rgba(239,68,68,0.6)'; ctx.font='bold 9px Inter'; ctx.fillText(rz.name,x1+4,y1+14)
      })

      // Ships
      ships.forEach(s => {
        const cx=((s.bbox[0]+s.bbox[2])/2)*W/700, cy=((s.bbox[1]+s.bbox[3])/2)*H/500
        const c = colors[s.classification]||'#6366f1'
        ctx.beginPath(); ctx.arc(cx,cy,12,0,Math.PI*2); ctx.fillStyle=c+'26'; ctx.fill()
        ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2); ctx.fillStyle=c; ctx.fill()
        ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='9px Inter'; ctx.fillText(s.id.slice(-5),cx+8,cy+3)
      })

      // Sweep line
      angleRef.current += 0.008
      const cX=W/2, cY=H/2, radius=Math.min(W, H)/2
      const eX=cX+Math.cos(angleRef.current)*radius, eY=cY+Math.sin(angleRef.current)*radius
      const g=ctx.createLinearGradient(cX,cY,eX,eY); g.addColorStop(0,'rgba(99,102,241,0.3)'); g.addColorStop(1,'rgba(99,102,241,0)')
      ctx.beginPath(); ctx.moveTo(cX,cY); ctx.lineTo(eX,eY); ctx.strokeStyle=g; ctx.lineWidth=3; ctx.stroke()

      // Radar circles
      ctx.strokeStyle='rgba(99,102,241,0.1)'; ctx.lineWidth=1
      for(let r=radius/4; r<=radius; r+=radius/4) { ctx.beginPath(); ctx.arc(cX,cY,r,0,Math.PI*2); ctx.stroke() }

      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    const handleResize = () => { resizeCanvas() }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [data, ships, loading])

  if (loading) return <PageWrapper><Loader message="Initializing radar..." /></PageWrapper>
  if (error) return <PageWrapper><ErrorState message="Failed to load radar data" onRetry={fetchData} /></PageWrapper>

  return (
    <PageWrapper>
      <div className="flex flex-col space-y-[var(--section-gap)] pb-[var(--s-3xl)]">
        {/* Header */}
        <motion.div className="mt-10 flex flex-col items-start px-2 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--c-accent)]/10 border border-[var(--c-accent)]/20 mb-6">
            <Radar size={14} className="text-[var(--c-accent)] animate-spin-slow" />
            <span className="text-[10px] font-black text-[var(--c-accent)] tracking-[0.3em] uppercase">Tactical Radar Visualization</span>
          </div>
          <h1 className="page-title mb-4">
            Neural <span className="text-gradient">Radar Sweep</span>
          </h1>
          <p className="text-[var(--c-text-dim)] text-lg max-w-2xl leading-relaxed font-medium opacity-70">
            Real-time canvas-based visualization of vessel trajectories and restricted maritime zones.
          </p>
        </motion.div>

        <div className="glass p-1 rounded-[40px] border-white/5 shadow-2xl overflow-hidden radar-grid relative w-full text-left">
            <canvas ref={canvasRef} className="w-full relative z-10" style={{ maxHeight: '500px' }} />
        </div>
        <motion.div
          className="glass-sm p-3 sm:p-4 flex items-center gap-4 sm:gap-6 flex-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <LegendItem color="#10b981" label="Legal" />
          <LegendItem color="#ef4444" label="Illegal" />
          <LegendItem color="#f59e0b" label="Suspicious" />
          <LegendItem color="rgba(99,102,241,0.3)" label="Traffic Zone" dashed />
          <LegendItem color="rgba(239,68,68,0.5)" label="Restricted" dashed />
        </motion.div>
      </div>
    </PageWrapper>
  )
}

function LegendItem({ color, label, dashed }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 transition-colors hover:bg-white/[0.08]">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dashed ? 'transparent' : color, border: dashed ? `2px dashed ${color}` : 'none' }} />
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--c-text-dim)]">{label}</span>
    </div>
  )
}
