import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized) return null
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}
