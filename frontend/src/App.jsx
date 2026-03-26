import { useState, Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import { Loader } from './components/StateHandlers'

/* Lazy-load all pages for performance */
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Detection     = lazy(() => import('./pages/Detection'))
const Traffic       = lazy(() => import('./pages/Traffic'))
const Collisions    = lazy(() => import('./pages/Collisions'))
const Analytics     = lazy(() => import('./pages/Analytics'))
const Alerts        = lazy(() => import('./pages/Alerts'))
const RadarView     = lazy(() => import('./pages/RadarView'))
const SystemOverview = lazy(() => import('./pages/SystemOverview'))
const Reports       = lazy(() => import('./pages/Reports'))

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] overflow-y-auto overflow-x-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      <main className="main-content">
        <div className="w-full max-w-[var(--container-max)] mx-auto px-6 sm:px-10 lg:px-16">
          <Suspense fallback={<Loader message="Synchronizing System..." />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/detection" element={<Detection />} />
                <Route path="/traffic" element={<Traffic />} />
                <Route path="/collisions" element={<Collisions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/radar" element={<RadarView />} />
                <Route path="/system" element={<SystemOverview />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
