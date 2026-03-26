/**
 * PageWrapper — wraps every page with Framer Motion fade/slide transitions
 * and a consistent scrollable container.
 */
import { motion } from 'framer-motion'

export default function PageWrapper({ children, fullHeight = false, noScroll = false }) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
