import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Users, User, Plus, MapPin, CheckCircle2 } from 'lucide-react'
import { getRoommateProfiles, getMyRoommateProfile, upsertRoommateProfile, calcCompatibility } from '@/lib/queries/roommates'
import { useAuthStore } from '@/stores/authStore'
import type { RoommateProfile } from '@/types/app.types'
import toast from 'react-hot-toast'

const TABS = ['Find Roommates', 'My Profile'] as const

export default function RoommatesPage() {
  const { user, profile } = useAuthStore()
  const [tab, setTab] = useState<typeof TABS[number]>('Find Roommates')
  const [profiles, setProfiles] = useState<RoommateProfile[]>([])
  const [myProfile, setMyProfile] = useState<RoommateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    bio: '',
    budget_min: 800,
    budget_max: 1500,
    move_in_date: '',
    neighborhoods: [] as string[],
    sleep_schedule: 'flexible',
    cleanliness: 3,
    social_level: 3,
    has_pets: false,
    smoking: false,
    major: '',
    year: '',
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [all, mine] = await Promise.all([
        getRoommateProfiles(),
        user ? getMyRoommateProfile(user.id) : Promise.resolve(null),
      ])
      setProfiles(all)
      if (mine) {
        setMyProfile(mine)
        setForm(f => ({
          ...f,
          bio: mine.bio ?? '',
          budget_min: mine.budget_min ?? 800,
          budget_max: mine.budget_max ?? 1500,
          move_in_date: mine.move_in_date ?? '',
          neighborhoods: mine.preferred_neighborhoods ?? [],
          sleep_schedule: mine.sleep_schedule ?? 'flexible',
          cleanliness: mine.cleanliness_level ?? 3,
          social_level: mine.social_level ?? 3,
          has_pets: mine.has_pets ?? false,
          smoking: mine.smoking ?? false,
          major: mine.major ?? '',
          year: mine.year ?? '',
        }))
      }
      setLoading(false)
    }
    load()
  }, [user])

  const handleSave = async () => {
    if (!user || !profile) return
    setSaving(true)
    try {
      const saved = await upsertRoommateProfile(user.id, {
        display_name: profile.display_name,
        bio: form.bio,
        budget_min: form.budget_min,
        budget_max: form.budget_max,
        move_in_date: form.move_in_date,
        preferred_neighborhoods: form.neighborhoods,
        sleep_schedule: form.sleep_schedule as never,
        cleanliness_level: form.cleanliness,
        social_level: form.social_level,
        has_pets: form.has_pets,
        smoking: form.smoking,
        major: form.major,
        year: form.year,
      })
      setMyProfile(saved)
      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const filtered = profiles.filter(p =>
    !query || p.display_name?.toLowerCase().includes(query.toLowerCase()) ||
    p.major?.toLowerCase().includes(query.toLowerCase()) ||
    p.preferred_neighborhoods?.some(n => n.toLowerCase().includes(query.toLowerCase()))
  )

  const NEIGHBORHOODS = ['Freret', 'Carrollton', 'Riverbend', 'Garden District', 'Uptown']

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-14 z-40 px-4 py-3 border-b border-border/50"
        style={{ background: 'rgba(247,247,242,0.92)', backdropFilter: 'blur(16px)' }}>
        <h1 className="font-display font-bold text-[22px] mb-3">Roommates</h1>
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all ${tab === t ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400'}`}>
              {t === 'Find Roommates' ? <span className="flex items-center justify-center gap-1.5"><Users size={13} />{t}</span>
                : <span className="flex items-center justify-center gap-1.5"><User size={13} />{t}</span>}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {tab === 'Find Roommates' && (
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center gap-2 bg-white rounded-xl px-3.5 py-2.5 border border-border">
                <Search size={15} className="text-gray-400 flex-shrink-0" />
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name, major, neighborhood..."
                  className="w-full text-[15px] outline-none placeholder-gray-400 bg-transparent" />
              </div>

              {loading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-border" />
                ))}</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Users size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="font-display font-bold text-[17px] mb-1">No roommates found</p>
                  <p className="text-gray-400 text-[13px]">Be the first to create a profile</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((p, i) => {
                    const score = myProfile ? calcCompatibility(myProfile, p) : null
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <div className="card p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-forest/10 rounded-2xl flex items-center justify-center text-[18px] font-bold text-forest flex-shrink-0">
                              {p.display_name?.[0] ?? '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-display font-bold text-[16px]">{p.display_name}</span>
                                <CheckCircle2 size={13} className="text-forest" />
                              </div>
                              <p className="text-[12px] text-gray-400">
                                {p.major ? `${p.major}${p.year ? ` · ${p.year}` : ''}` : 'Tulane Student'}
                              </p>
                            </div>
                            {score !== null && (
                              <div className="text-right">
                                <div className="font-display font-bold text-[18px]" style={{ color: score >= 70 ? '#1A3A2A' : score >= 50 ? '#F59E0B' : '#EF4444' }}>
                                  {score}%
                                </div>
                                <div className="text-[10px] text-gray-400">match</div>
                              </div>
                            )}
                          </div>

                          {p.bio && <p className="text-[13px] text-gray-500 mb-3 line-clamp-2">{p.bio}</p>}

                          <div className="flex flex-wrap gap-1.5">
                            {p.budget_min && p.budget_max && (
                              <span className="text-[11px] bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                                ${p.budget_min}–${p.budget_max}/mo
                              </span>
                            )}
                            {p.sleep_schedule && (
                              <span className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full capitalize">
                                {p.sleep_schedule}
                              </span>
                            )}
                            {p.preferred_neighborhoods?.slice(0, 2).map(n => (
                              <span key={n} className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <MapPin size={9} />{n}
                              </span>
                            ))}
                            {p.has_pets && <span className="text-[11px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">🐾 Has pets</span>}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'My Profile' && (
            <div className="px-4 py-4 space-y-5">
              {!user ? (
                <div className="text-center py-16">
                  <User size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="font-display font-bold text-[17px] mb-1">Sign in to create a profile</p>
                  <p className="text-gray-400 text-[13px]">Find your perfect roommate match</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="label">Bio</label>
                    <textarea className="input resize-none" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      placeholder="Tell potential roommates about yourself..." />
                  </div>

                  <div>
                    <label className="label">Major & Year</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input className="input" value={form.major} onChange={e => setForm(f => ({ ...f, major: e.target.value }))} placeholder="e.g. Finance" />
                      <select className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                        <option value="">Year</option>
                        {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad'].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Budget Range: <strong>${form.budget_min}–${form.budget_max}/mo</strong></label>
                    <div className="space-y-2">
                      <input type="range" min={500} max={4000} step={50} value={form.budget_min}
                        onChange={e => setForm(f => ({ ...f, budget_min: +e.target.value }))}
                        className="w-full" style={{ accentColor: '#1A3A2A' }} />
                      <input type="range" min={500} max={4000} step={50} value={form.budget_max}
                        onChange={e => setForm(f => ({ ...f, budget_max: +e.target.value }))}
                        className="w-full" style={{ accentColor: '#1A3A2A' }} />
                    </div>
                  </div>

                  <div>
                    <label className="label">Preferred Neighborhoods</label>
                    <div className="flex flex-wrap gap-2">
                      {NEIGHBORHOODS.map(n => (
                        <button key={n} onClick={() => setForm(f => ({
                          ...f,
                          neighborhoods: f.neighborhoods.includes(n) ? f.neighborhoods.filter(x => x !== n) : [...f.neighborhoods, n]
                        }))}
                          className={`text-[13px] px-3 py-2 rounded-xl font-medium transition-all ${form.neighborhoods.includes(n) ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                          style={form.neighborhoods.includes(n) ? { background: '#1A3A2A' } : {}}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Sleep Schedule</label>
                    <div className="flex gap-2">
                      {['early_bird', 'night_owl', 'flexible'].map(s => (
                        <button key={s} onClick={() => setForm(f => ({ ...f, sleep_schedule: s }))}
                          className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${form.sleep_schedule === s ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                          style={form.sleep_schedule === s ? { background: '#1A3A2A' } : {}}>
                          {s === 'early_bird' ? '🌅 Early' : s === 'night_owl' ? '🌙 Night' : '😴 Flex'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Cleanliness: {['😬', '😐', '🙂', '😊', '✨'][form.cleanliness - 1]}</label>
                    <input type="range" min={1} max={5} step={1} value={form.cleanliness}
                      onChange={e => setForm(f => ({ ...f, cleanliness: +e.target.value }))}
                      className="w-full" style={{ accentColor: '#1A3A2A' }} />
                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Relaxed</span><span>Very tidy</span></div>
                  </div>

                  <div>
                    <label className="label">Social Level: {['🧘', '😊', '🙂', '🎉', '🎊'][form.social_level - 1]}</label>
                    <input type="range" min={1} max={5} step={1} value={form.social_level}
                      onChange={e => setForm(f => ({ ...f, social_level: +e.target.value }))}
                      className="w-full" style={{ accentColor: '#1A3A2A' }} />
                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Introverted</span><span>Very social</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'has_pets', label: '🐾 Has Pets' },
                      { key: 'smoking', label: '🚬 Smoker' },
                    ].map(item => (
                      <button key={item.key} onClick={() => setForm(f => ({ ...f, [item.key]: !f[item.key as keyof typeof f] }))}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${form[item.key as keyof typeof form] ? 'border-forest bg-forest/5' : 'border-border bg-white'}`}>
                        <p className="font-semibold text-[14px]">{item.label}</p>
                      </button>
                    ))}
                  </div>

                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                    className="btn-primary w-full py-4 text-[15px]">
                    {saving ? 'Saving…' : 'Save Profile'}
                  </motion.button>
                </>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
