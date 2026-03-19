import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { getProfile, createProfile } from '@/lib/auth'
import { useAuthStore } from '@/stores/authStore'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setSession, setProfile } = useAuthStore()
  const [status, setStatus] = useState('Signing you in…')

  useEffect(() => {
    const handle = async () => {
      // Handle hash fragment tokens (#access_token=...) from magic link emails
      if (window.location.hash.includes('access_token')) {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session && !error) {
          setSession(session)
          const existing = await getProfile(session.user.id)
          if (existing) {
            setProfile(existing)
          } else {
            const role = (localStorage.getItem('wr_pending_role') ?? 'student') as 'student' | 'landlord'
            const profile = await createProfile(session.user.id, session.user.email!, role)
            setProfile(profile)
            localStorage.removeItem('wr_pending_role')
          }
          navigate('/dashboard', { replace: true })
          return
        }
      }

      // Handle token_hash from OTP code flow
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type') as 'email' | 'recovery' | null

      if (tokenHash && type) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (error) {
          setStatus('Sign-in failed. Please try again.')
          setTimeout(() => navigate('/login'), 2000)
          return
        }
        if (data.session) {
          setSession(data.session)
          const existing = await getProfile(data.session.user.id)
          if (existing) {
            setProfile(existing)
            navigate('/dashboard', { replace: true })
          } else {
            const role = (localStorage.getItem('wr_pending_role') ?? 'student') as 'student' | 'landlord'
            const profile = await createProfile(data.session.user.id, data.session.user.email!, role)
            setProfile(profile)
            localStorage.removeItem('wr_pending_role')
            navigate('/dashboard', { replace: true })
          }
          return
        }
      }

      // Fallback: check current session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }

    handle()
  }, [navigate, searchParams, setSession, setProfile])

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-forest/20 border-t-forest animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-sans">{status}</p>
      </div>
    </div>
  )
}
