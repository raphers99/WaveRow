import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Home, MessageSquare, Settings, ChevronRight, Plus, LogOut, CheckCircle2, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getSavedListings, getUserListings } from '@/lib/queries/listings'
import { getConversations } from '@/lib/queries/messages'
import { signOut } from '@/lib/auth'
import ListingCard from '@/components/listings/ListingCard'
import type { Listing, Conversation } from '@/types/app.types'
import toast from 'react-hot-toast'
import { formatDistanceToNow, parseISO } from 'date-fns'

const TABS = ['Overview', 'Saved', 'My Listings', 'Messages'] as const
type Tab = typeof TABS[number]

export default function DashboardPage() {
  const { profile, user, setSession, setProfile } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('Overview')
  const [saved, setSaved] = useState<Listing[]>([])
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      getSavedListings(user.id),
      getUserListings(user.id),
      getConversations(user.id),
    ]).then(([s, m, c]) => {
      setSaved(s)
      setMyListings(m)
      setConversations(c)
    }).finally(() => setLoading(false))
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    setSession(null)
    setProfile(null)
    navigate('/')
    toast.success('Signed out')
  }

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'Student'
  const initial = displayName[0].toUpperCase()

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="px-4 pt-6 pb-5"
        style={{ background: 'linear-gradient(160deg, #1A3A2A 0%, #0E2218 100%)' }}>
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display font-bold text-[22px] text-white">My Account</h1>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 text-white/60 text-[13px]">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-[24px] font-bold text-forest"
            style={{ background: '#C8F5A0' }}>
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-[20px] text-white">{displayName}</h2>
              {profile?.is_verified_student && <CheckCircle2 size={16} style={{ color: '#C8F5A0' }} />}
            </div>
            <p className="text-white/50 text-[13px] capitalize">{profile?.role ?? 'student'} · Tulane University</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { label: 'Saved', value: saved.length },
            { label: 'Listings', value: myListings.length },
            { label: 'Messages', value: conversations.length },
          ].map(s => (
            <div key={s.label} className="text-center py-2.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <p className="font-display font-bold text-[20px] text-white">{s.value}</p>
              <p className="text-white/50 text-[11px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-[12px] font-semibold rounded-xl transition-all ${tab === t ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400'}`}>
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

            {tab === 'Overview' && (
              <div className="space-y-3">
                <div className="card divide-y divide-border">
                  {[
                    { icon: <Heart size={16} className="text-red-400" />, label: 'Saved Listings', count: saved.length, action: () => setTab('Saved') },
                    { icon: <Home size={16} style={{ color: '#1A3A2A' }} />, label: 'My Listings', count: myListings.length, action: () => setTab('My Listings') },
                    { icon: <MessageSquare size={16} className="text-blue-400" />, label: 'Messages', count: conversations.length, action: () => setTab('Messages') },
                    { icon: <Bell size={16} className="text-amber-400" />, label: 'Price Alerts', count: 0, action: () => {} },
                  ].map(item => (
                    <button key={item.label} onClick={item.action} className="flex items-center gap-3 w-full p-4 text-left">
                      <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center border border-border">
                        {item.icon}
                      </div>
                      <span className="font-medium text-[15px] flex-1">{item.label}</span>
                      {item.count > 0 && (
                        <span className="text-[12px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-full">{item.count}</span>
                      )}
                      <ChevronRight size={16} className="text-gray-300" />
                    </button>
                  ))}
                </div>

                <div className="card divide-y divide-border">
                  <button className="flex items-center gap-3 w-full p-4 text-left">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center border border-border">
                      <Settings size={16} className="text-gray-400" />
                    </div>
                    <span className="font-medium text-[15px] flex-1">Settings</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                </div>

                <Link to="/create" className="btn-primary w-full py-4 text-[15px] flex items-center justify-center gap-2">
                  <Plus size={18} /> Post a Listing
                </Link>
              </div>
            )}

            {tab === 'Saved' && (
              <div>
                {loading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-border" />)}</div>
                ) : saved.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="font-display font-bold text-[17px] mb-1">No saved listings</p>
                    <p className="text-gray-400 text-[13px] mb-4">Tap the heart on any listing to save it</p>
                    <Link to="/listings" className="btn-primary px-6 py-2.5 text-[14px]">Browse Listings</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {saved.map(l => <ListingCard key={l.id} listing={l} compact />)}
                  </div>
                )}
              </div>
            )}

            {tab === 'My Listings' && (
              <div>
                <Link to="/create" className="btn-primary w-full py-3.5 text-[14px] flex items-center justify-center gap-2 mb-4">
                  <Plus size={16} /> Post New Listing
                </Link>
                {loading ? (
                  <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-border" />)}</div>
                ) : myListings.length === 0 ? (
                  <div className="text-center py-16">
                    <Home size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="font-display font-bold text-[17px] mb-1">No listings yet</p>
                    <p className="text-gray-400 text-[13px]">Post your first listing to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myListings.map(l => <ListingCard key={l.id} listing={l} compact />)}
                  </div>
                )}
              </div>
            )}

            {tab === 'Messages' && (
              <div>
                {loading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-border" />)}</div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="font-display font-bold text-[17px] mb-1">No messages yet</p>
                    <p className="text-gray-400 text-[13px]">Contact a landlord or student to start chatting</p>
                  </div>
                ) : (
                  <div className="card divide-y divide-border">
                    {conversations.map(c => (
                      <Link key={c.id} to={`/chat/${c.id}`} className="flex items-center gap-3 p-4">
                        <div className="w-11 h-11 bg-forest/10 rounded-full flex items-center justify-center text-[15px] font-bold text-forest flex-shrink-0">
                          {c.other_user?.display_name?.[0] ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-[14px]">{c.other_user?.display_name ?? 'User'}</span>
                            {c.last_message_at && (
                              <span className="text-[11px] text-gray-400">{formatDistanceToNow(parseISO(c.last_message_at), { addSuffix: true })}</span>
                            )}
                          </div>
                          <p className="text-[13px] text-gray-400 truncate">{c.last_message ?? 'No messages yet'}</p>
                        </div>
                        {c.unread_count > 0 && (
                          <span className="w-5 h-5 bg-forest rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                            {c.unread_count}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
