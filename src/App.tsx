import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  const { initialize, initialized } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      {!initialized && <SplashScreen />}
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pb-nav">
          <Routes>
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
        </main>
        <BottomNav />
      </div>
    </>
  )
}
