import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Shield, MessageSquare, TrendingDown, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { toast.error('Enter a valid email'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('waitlist').insert({ email })
      if (error && error.code !== '23505') throw error // ignore duplicate
      setSubmitted(true)
    } catch {
      toast.error('Failed to join waitlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="px-4 pt-10 pb-10 text-center overflow-hidden relative"
        style={{ background: 'linear-gradient(160deg, #1A3A2A 0%, #0E2218 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: '#C8F5A0' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5 blur-3xl" style={{ background: '#C8F5A0' }} />

        <div className="relative z-10 max-w-sm mx-auto">
          <div className="inline-flex items-center gap-1.5 text-white/75 text-xs px-3.5 py-1.5 rounded-full mb-6 border border-white/20"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Shield size={11} style={{ color: '#C8F5A0' }} /> Coming to more schools
          </div>

          <h1 className="font-display font-bold text-[36px] text-white leading-[1.1] mb-4">
            Housing Made for<br /><span style={{ color: '#C8F5A0' }}>Students</span>
          </h1>
          <p className="text-white/60 text-[15px] mb-8 leading-relaxed">
            Join thousands of students who've already found their perfect place near campus.
          </p>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl p-2 flex gap-2 shadow-2xl mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@tulane.edu"
                    className="flex-1 px-3 py-2.5 text-[15px] outline-none"
                    style={{ fontSize: '16px' }}
                  />
                  <button type="submit" disabled={loading}
                    className="btn-primary px-5 py-2.5 text-[14px] disabled:opacity-60">
                    {loading ? '…' : 'Join'}
                  </button>
                </div>
                <p className="text-white/40 text-[12px]">No spam. Unsubscribe anytime.</p>
              </motion.form>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <CheckCircle2 size={32} style={{ color: '#C8F5A0' }} className="mx-auto mb-3" />
                  <h2 className="font-display font-bold text-[20px] text-white mb-2">You're on the list!</h2>
                  <p className="text-white/60 text-[14px]">We'll let you know when new features launch.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-1">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-2 bg-white rounded-2xl shadow-md p-4 border border-border">
          {[
            { value: '1,200+', label: 'Waitlist' },
            { value: '200+', label: 'Listings' },
            { value: '4.9★', label: 'Rating' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-[17px]" style={{ color: '#1A3A2A' }}>{s.value}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-lg mx-auto">
          <h2 className="section-title mb-5">Everything you need</h2>
          <div className="space-y-3">
            {[
              { icon: <Shield size={20} style={{ color: '#1A3A2A' }} />, title: 'Verified Listings', desc: 'Every listing reviewed and verified. Tulane .edu email required to post.' },
              { icon: <MessageSquare size={20} className="text-blue-500" />, title: 'In-App Messaging', desc: 'Contact landlords and students directly with real-time chat.' },
              { icon: <TrendingDown size={20} style={{ color: '#1A3A2A' }} />, title: 'Price Alerts', desc: 'Save listings and get notified when rent drops.' },
              { icon: <Zap size={20} className="text-amber-500" />, title: 'AI Lease Analyzer', desc: 'Upload your lease and get an instant breakdown of red flags.' },
            ].map(f => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="card p-4 flex items-start gap-4">
                <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-border">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[16px] mb-0.5">{f.title}</h3>
                  <p className="text-gray-500 text-[13px] leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
