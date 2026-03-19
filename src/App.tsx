import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import SplashScreen from '@/components/layout/SplashScreen'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import ListingsPage from '@/pages/ListingsPage'
import ListingDetailPage from '@/pages/ListingDetailPage'
import SubletsPage from '@/pages/SubletsPage'
import RoommatesPage from '@/pages/RoommatesPage'
import NeighborhoodsPage from '@/pages/NeighborhoodsPage'
import CreateListingPage from '@/pages/CreateListingPage'
import DashboardPage from '@/pages/DashboardPage'
import AuthPage from '@/pages/AuthPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import ChatPage from '@/pages/ChatPage'
import WaitlistPage from '@/pages/WaitlistPage'
import LeaseAnalyzerPage from '@/pages/LeaseAnalyzerPage'

// Pages that manage their own layout (no shared nav chrome)
const FULLSCREEN_ROUTES = ['/chat/', '/auth/callback']
const NO_BOTTOM_NAV = ['/create', '/login', '/auth/callback']

export default function App() {
  const { initialize, initialized } = useAuthStore()
  const location = useLocation()
  const [minTimePassed, setMinTimePassed] = useState(false)

  useEffect(() => {
    initialize()
    const t = setTimeout(() => setMinTimePassed(true), 2800)
    return () => clearTimeout(t)
  }, [initialize])

  const showSplash = !initialized || !minTimePassed
  const isFullscreen = FULLSCREEN_ROUTES.some(r => location.pathname.startsWith(r))
  const hideBottomNav = NO_BOTTOM_NAV.some(r => location.pathname.startsWith(r)) || isFullscreen

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen">
        {!isFullscreen && <Navbar />}

        <main className={!isFullscreen && !hideBottomNav ? 'flex-1 pb-nav' : 'flex-1'}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/listings" element={<ListingsPage />} />
                <Route path="/listings/:id" element={<ListingDetailPage />} />
                <Route path="/sublets" element={<SubletsPage />} />
                <Route path="/roommates" element={<RoommatesPage />} />
                <Route path="/neighborhoods" element={<NeighborhoodsPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/waitlist" element={<WaitlistPage />} />
                <Route path="/create" element={
                  <ProtectedRoute><CreateListingPage /></ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="/chat/:conversationId" element={
                  <ProtectedRoute><ChatPage /></ProtectedRoute>
                } />
                <Route path="/lease-analyzer" element={
                  <ProtectedRoute><LeaseAnalyzerPage /></ProtectedRoute>
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>

        {!hideBottomNav && <BottomNav />}
      </div>
    </>
  )
}
