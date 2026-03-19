import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Home, Building2, ArrowRight, CheckCircle2, Mail, Hash } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendOTP, verifyOTP, isTulaneEmail, getProfile, createProfile } from '@/lib/auth'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types/app.types'

type Step = 'role' | 'email' | 'otp' | 'name'

const ROLES = [
  {
    key: 'student' as UserRole,
    icon: <GraduationCap size={22} />,
    label: 'Tulane Student',
    desc: 'Browse listings, save apartments, find roommates',
    badge: '@tulane.edu required',
    accent: 'bg-forest/8 text-forest',
  },
  {
    key: 'student' as UserRole, // subletter is still a student
    icon: <Home size={22} />,
    label: 'Student Subletter',
    desc: 'Sublet your current lease while going abroad',
    badge: '@tulane.edu required',
    accent: 'bg-purple-50 text-purple-700',
  },
  {
    key: 'landlord' as UserRole,
    icon: <Building2 size={22} />,
    label: 'Landlord',
    desc: 'List your property to verified Tulane students',
    badge: 'Any email',
    accent: 'bg-blue-50 text-blue-700',
  },
]

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession, setProfile } = useAuthStore()

  const [step, setStep] = useState<Step>('role')
  const [roleIdx, setRoleIdx] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedRole = ROLES[roleIdx]
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const isLandlord = selectedRole.key === 'landlord'
    if (!isLandlord && !isTulaneEmail(email)) {
      setError('Must use a @tulane.edu email address')
      return
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await sendOTP(email)
      toast.success('Code sent! Check your inbox.')
      setStep('otp')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      const { session } = await verifyOTP(email, otp)
      if (!session) throw new Error('Verification failed')
      setSession(session)
      // Check if profile exists
      const existing = await getProfile(session.user.id)
      if (existing) {
        setProfile(existing)
        navigate(from, { replace: true })
      } else {
        setStep('name') // first-time onboarding
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code — try again')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!displayName.trim()) { setError('Enter your name'); return }
    setLoading(true)
    try {
      const { session } = await verifyOTP(email, otp).catch(() => ({ session: null }))
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Session expired')
      const profile = await createProfile(userId, email, selectedRole.key, displayName.trim())
      setProfile(profile)
      toast.success('Welcome to WaveRow! 🎉')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(145deg, #2a5c40, #1A3A2A)' }}
          >
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <path d="M4 20 Q10 8 16 16 Q22 24 28 12" stroke="#C8F5A0" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-display text-[28px] font-bold text-charcoal">
            {step === 'name' ? 'Almost done' : 'Join WaveRow'}
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">
            {step === 'otp' ? `Code sent to ${email}` : 'Student housing for Tulane'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Role Selection ── */}
          {step === 'role' && (
            <motion.div key="role" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <p className="label mb-4">I am a...</p>
              <div className="space-y-3 mb-5">
                {ROLES.map((r, i) => (
                  <button key={i} onClick={() => setRoleIdx(i)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      roleIdx === i ? 'border-forest bg-forest/5' : 'border-border bg-white'
                    }`}>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                      roleIdx === i ? 'bg-forest text-white' : r.accent
                    }`}>
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[15px] text-charcoal">{r.label}</span>
                        <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.badge}</span>
                      </div>
                      <p className="text-gray-500 text-[13px]">{r.desc}</p>
                    </div>
                    {roleIdx === i && <CheckCircle2 size={18} className="text-forest flex-shrink-0" />}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('email')} className="btn-primary w-full">
                Continue as {selectedRole.label} <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ── Email Entry ── */}
          {step === 'email' && (
            <motion.div key="email" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <button onClick={() => setStep('role')} className="text-gray-400 text-[14px] mb-5 flex items-center gap-1 hover:text-forest transition-colors">
                ← Change role
              </button>

              <div className={`flex items-center gap-3 p-3.5 rounded-2xl mb-5 ${selectedRole.accent} bg-opacity-50`}>
                {selectedRole.icon}
                <div>
                  <p className="font-semibold text-[14px] text-charcoal">{selectedRole.label}</p>
                  <p className="text-[12px] text-gray-500">{selectedRole.desc}</p>
                </div>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="label">
                    {selectedRole.key === 'landlord' ? 'Business Email' : 'Tulane Email'}
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder={selectedRole.key === 'landlord' ? 'you@business.com' : 'you@tulane.edu'}
                      className={`input pl-10 ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-500 text-[13px] mt-1.5">⚠ {error}</p>}
                </div>
                <button type="submit" disabled={loading || !email} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── OTP Entry ── */}
          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="label">6-Digit Code</label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
                      placeholder="123456"
                      className={`input pl-10 text-2xl tracking-[0.5em] font-display ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-500 text-[13px] mt-1.5">⚠ {error}</p>}
                </div>
                <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full">
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                <button type="button" onClick={() => setStep('email')} className="w-full text-center text-gray-400 text-[14px]">
                  Wrong email? Go back
                </button>
                <button type="button" onClick={handleSendOTP} disabled={loading} className="w-full text-center text-forest text-[14px] font-medium">
                  Resend code
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Display Name ── */}
          {step === 'name' && (
            <motion.div key="name" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div>
                  <label className="label">Your Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => { setDisplayName(e.target.value); setError('') }}
                    placeholder="First Last"
                    className={`input ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                    autoFocus
                  />
                  {error && <p className="text-red-500 text-[13px] mt-1.5">⚠ {error}</p>}
                </div>
                <button type="submit" disabled={loading || !displayName.trim()} className="btn-primary w-full">
                  {loading ? 'Creating profile...' : 'Finish Setup →'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[12px] text-gray-400 mt-8">
          No passwords · Magic code login · Tulane-exclusive
        </p>
      </div>
    </div>
  )
}
