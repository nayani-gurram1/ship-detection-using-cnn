import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, FileJson, FileSpreadsheet, CheckCircle } from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import { downloadJSON, downloadCSV } from '../api'

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.4, ease: 'easeOut' },
  }),
}

export default function Reports() {
  const [downloading, setDownloading] = useState(null)
  const [done, setDone] = useState(null)

  const handleDownload = async (type) => {
    setDownloading(type)
    setDone(null)
    try {
      const res = type === 'json' ? await downloadJSON() : await downloadCSV()
      const blob = new Blob([res.data], { type: res.headers['content-type'] })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ship_detection_report.${type}`
      a.click()
      URL.revokeObjectURL(url)
      setDone(type)
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <PageWrapper>
      <div className="flex flex-col space-y-[var(--section-gap)] pb-[var(--s-3xl)]">
        <motion.div className="mt-10 flex flex-col items-start px-2 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--c-accent)]/10 border border-[var(--c-accent)]/20 mb-6">
            <FileText size={14} className="text-[var(--c-accent)]" />
            <span className="text-[10px] font-black text-[var(--c-accent)] tracking-[0.3em] uppercase">Data Export Center</span>
          </div>
          <h1 className="page-title mb-4">System <span className="text-gradient">Intelligence Reports</span></h1>
          <p className="text-[var(--c-text-dim)] text-lg max-w-2xl leading-relaxed font-medium opacity-70">
            Generate and export comprehensive detection results and analytical datasets in multiple formats.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full text-left">
          {/* JSON Export */}
          <motion.div
            className="glass p-5 sm:p-6 flex flex-col items-center text-center group"
            custom={0}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--c-accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--c-accent)]/15 transition-colors duration-300">
              <FileJson size={28} className="text-[var(--c-accent)] sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--c-text-bright)]">JSON Report</h3>
            <p className="text-xs text-[var(--c-text-dim)] mt-2 mb-5 sm:mb-6 max-w-xs">
              Complete structured data including all detections, classifications, risk scores, and collision analysis
            </p>
            <button
              onClick={() => handleDownload('json')}
              disabled={downloading === 'json'}
              className="btn-primary px-6 py-3"
            >
              {done === 'json' ? <CheckCircle size={18} /> : <Download size={18} />}
              {downloading === 'json' ? 'Downloading...' : done === 'json' ? 'Downloaded!' : 'Download JSON'}
            </button>
          </motion.div>

          {/* CSV Export */}
          <motion.div
            className="glass p-5 sm:p-6 flex flex-col items-center text-center group"
            custom={1}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--c-green)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--c-green)]/15 transition-colors duration-300">
              <FileSpreadsheet size={28} className="text-[var(--c-green)] sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--c-text-bright)]">CSV Report</h3>
            <p className="text-xs text-[var(--c-text-dim)] mt-2 mb-5 sm:mb-6 max-w-xs">
              Tabular format with ship ID, confidence, classification, risk score, zone, and bounding boxes
            </p>
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloading === 'csv'}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50 cursor-pointer hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {done === 'csv' ? <CheckCircle size={18} /> : <Download size={18} />}
              {downloading === 'csv' ? 'Downloading...' : done === 'csv' ? 'Downloaded!' : 'Download CSV'}
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <motion.div
          className="glass-sm p-3 sm:p-4 flex items-start gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FileText size={16} className="text-[var(--c-text-dim)] mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--c-text-dim)] leading-relaxed">
            Reports include all detection history from the current session. Run detections first to populate data.
            JSON exports include full nested data; CSV exports provide a flat tabular view per ship.
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
