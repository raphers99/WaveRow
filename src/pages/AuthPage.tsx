import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Home, Building2, ArrowRight, CheckCircle2, Mail } from 'lucide-react'
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
  },
  {
    key: 'student' as UserRole,
    icon: <Home size={22} />,
    label: 'Student Subletter',
    desc: 'Sublet your current lease while going abroad',
    badge: '@tulane.edu required',
  },
  {
    key: 'landlord' as UserRole,
    icon: <Building2 size={22} />,
    label: 'Landlord',
    desc: 'List your property to verified Tulane students',
    badge: 'Any email',
  },
]

// Apple-style 6-box OTP input
function OTPBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus()
      const arr = value.split('')
      arr[i - 1] = ''
      onChange(arr.join(''))
    }
  }

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    const arr = value.padEnd(6, ' ').split('')
    arr[i] = char
    const next = arr.join('').replace(/ /g, '')
    onChange(next)
    if (char && i < 5) refs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    refs.current[Math.min(pasted.length, 5)]?.focus()
    e.preventDefault()
  }

  return (
    <div className="flex gap-3 justify-center my-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-[22px] font-bold font-display border-2 rounded-2xl outline-none transition-all bg-white"
          style={{
            borderColor: value[i] ? '#1A3A2A' : '#E8E8E0',
            boxShadow: value[i] ? '0 0 0 3px rgba(26,58,42,0.1)' : 'none',
            fontSize: '22px',
          }}
          autoFocus={i === 0}
        />
      ))}
    </div>
  )
}

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

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')
    if (!selectedRole || selectedRole.key !== 'landlord') {
      if (!isTulaneEmail(email)) {
        setError('Must use a @tulane.edu email address')
        return
      }
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await sendOTP(email)
      toast.success('6-digit code sent — check your inbox')
      setStep('otp')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Enter all 6 digits'); return }
    setLoading(true)
    try {
      const { session } = await verifyOTP(email, otp)
      if (!session) throw new Error('Verification failed')
      setSession(session)
      const existing = await getProfile(session.user.id)
      if (existing) {
        setProfile(existing)
        navigate(from, { replace: true })
      } else {
        setStep('name')
      }
    } catch {
      setError('Invalid code — please try again')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  // Auto-submit when all 6 digits entered
  const handleOTPChange = (v: string) => {
    setOtp(v)
    setError('')
    if (v.length === 6) {
      setTimeout(() => handleVerifyOTP(), 100)
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!displayName.trim()) { setError('Enter your name'); return }
    setLoading(true)
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Session expired')
      const profile = await createProfile(userId, email, selectedRole.key, displayName.trim())
      setProfile(profile)
      localStorage.removeItem('wr_pending_role')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <div className="flex-1 flex items-start justify-center px-5 py-10 overflow-hidden">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: 'linear-gradient(145deg, #2a5c40, #1A3A2A)' }}
            >
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <path d="M4 20 Q10 8 16 16 Q22 24 28 12" stroke="#C8F5A0" strokeWidth="3.5" strokeLinecap="round" />
                <rect x="11" y="16" width="10" height="9" rx="1.5" fill="white" opacity="0.85" />
                <path d="M9 17 L16 11 L23 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
              </svg>
            </div>
            <h1 className="font-display text-[28px] font-bold text-charcoal">
              {step === 'name' ? 'One last thing' : 'WaveRow'}
            </h1>
            <p className="text-[14px] text-gray-400 mt-1">
              {step === 'otp'
                ? `Code sent to ${email}`
                : step === 'name'
                ? 'Set up your profile'
                : 'Student housing, simplified'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Role */}
            {step === 'role' && (
              <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-3">I am a...</p>
                <div className="space-y-2.5 mb-6">
                  {ROLES.map((r, i) => (
                    <button key={i} onClick={() => setRoleIdx(i)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${roleIdx === i ? 'border-forest bg-forest/5' : 'border-border bg-white'}`}>
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${roleIdx === i ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
                        style={roleIdx === i ? { background: '#1A3A2A' } : {}}>
                        {r.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-[15px] text-charcoal">{r.label}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.badge}</span>
                        </div>
                        <p className="text-gray-400 text-[13px]">{r.desc}</p>
                      </div>
                      {roleIdx === i && <CheckCircle2 size={18} className="text-forest flex-shrink-0" />}
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep('email')} className="btn-primary w-full py-4 text-[16px] flex items-center justify-center gap-2">
                  Continue <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {/* Email */}
            {step === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <button onClick={() => setStep('role')} className="text-gray-400 text-[14px] mb-5 flex items-center gap-1">
                  ← Back
                </button>
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="label">{selectedRole.key === 'landlord' ? 'Email Address' : 'Tulane Email'}</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError('') }}
                        placeholder={selectedRole.key === 'landlord' ? 'you@company.com' : 'you@tulane.edu'}
                        className={`input pl-10 ${error ? 'border-red-400' : ''}`}
                        style={{ fontSize: '16px' }}
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    </div>
                    {error && <p className="text-red-500 text-[13px] mt-1.5">{error}</p>}
                  </div>
                  <button type="submit" disabled={loading || !email} className="btn-primary w-full py-4 text-[16px] disabled:opacity-40">
                    {loading ? 'Sending...' : 'Send 6-Digit Code'}
                  </button>
                </form>
                <p className="text-center text-[12px] text-gray-400 mt-5">
                  We'll send a 6-digit code to your email. No password needed.
                </p>
              </motion.div>
            )}

            {/* OTP — Apple-style 6 boxes */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p className="text-center text-[14px] text-gray-500 mb-1">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-center text-[14px] font-semibold text-charcoal mb-2">{email}</p>

                <OTPBoxes value={otp} onChange={handleOTPChange} />

                {error && <p className="text-red-500 text-[13px] text-center mb-3">{error}</p>}

                {loading && (
                  <div className="flex justify-center mb-4">
                    <div className="w-5 h-5 border-2 border-forest/20 border-t-forest rounded-full animate-spin" />
                  </div>
                )}

                <div className="space-y-3 mt-2">
                  <button onClick={() => handleVerifyOTP()} disabled={loading || otp.length !== 6}
                    className="btn-primary w-full py-4 text-[16px] disabled:opacity-40">
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                  <button onClick={() => handleSendOTP()} disabled={loading}
                    className="w-full text-center text-forest text-[14px] font-semibold py-2">
                    Resend code
                  </button>
                  <button onClick={() => { setStep('email'); setOtp(''); setError('') }}
                    className="w-full text-center text-gray-400 text-[13px] py-1">
                    Wrong email? Go back
                  </button>
                </div>
              </motion.div>
            )}

            {/* Name */}
            {step === 'name' && (
              <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <form onSubmit={handleCreateProfile} className="space-y-4">
                  <div>
                    <label className="label">Your Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => { setDisplayName(e.target.value); setError('') }}
                      placeholder="First Last"
                      className={`input ${error ? 'border-red-400' : ''}`}
                      style={{ fontSize: '16px' }}
                      autoFocus
                      autoCapitalize="words"
                    />
                    {error && <p className="text-red-500 text-[13px] mt-1.5">{error}</p>}
                  </div>
                  <button type="submit" disabled={loading || !displayName.trim()}
                    className="btn-primary w-full py-4 text-[16px] disabled:opacity-40">
                    {loading ? 'Setting up...' : 'Get Started'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
