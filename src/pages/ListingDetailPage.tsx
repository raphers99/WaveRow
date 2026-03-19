import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, CheckCircle2, MessageSquare, Star, Zap, ChevronLeft, ChevronRight, Shield, Calendar, AlertTriangle, Info } from 'lucide-react'
import { getListingById, saveListing, unsaveListing } from '@/lib/queries/listings'
import { getOrCreateConversation } from '@/lib/queries/messages'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types/app.types'
import toast from 'react-hot-toast'
import { differenceInHours, parseISO, format } from 'date-fns'

interface CheckerResult {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  flags: { type: 'warning' | 'danger' | 'info'; title: string; detail: string }[]
  summary: string
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [saved, setSaved] = useState(false)
  const [checker, setChecker] = useState<CheckerResult | null>(null)
  const [checkerLoading, setCheckerLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    getListingById(id)
      .then(l => {
        setListing(l)
        setSaved(l?.saved ?? false)
        if (l) {
          setCheckerLoading(true)
          supabase.functions.invoke('ai', { body: { action: 'check_listing', listing: l } })
            .then(({ data }) => { if (data && !data.error) setChecker(data) })
            .finally(() => setCheckerLoading(false))
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const toggleSave = async () => {
    if (!user) { toast.error('Sign in to save listings'); return }
    if (!listing) return
    const next = !saved
    setSaved(next)
    try {
      if (next) await saveListing(listing.id, user.id)
      else await unsaveListing(listing.id, user.id)
    } catch {
      setSaved(!next)
      toast.error('Failed to update saved listing')
    }
  }

  const handleContact = async () => {
    if (!user) { navigate('/login'); return }
    if (!listing) return
    try {
      const conv = await getOrCreateConversation(user.id, listing.user_id, listing.id)
      navigate(`/chat/${conv.id}`)
    } catch {
      toast.error('Failed to open chat')
    }
  }

  if (loading) return (
    <div className="min-h-screen">
      <div className="shimmer" style={{ aspectRatio: '4/3' }} />
      <div className="p-4 space-y-3 mt-1">
        <div className="shimmer h-9 rounded-xl w-1/3" />
        <div className="shimmer h-6 rounded-xl w-2/3" />
        <div className="shimmer h-4 rounded-xl w-1/2" />
        <div className="shimmer h-4 rounded-xl w-3/4" />
      </div>
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#1A3A2A' }}>
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <path d="M8 38 Q18 16 32 28 Q46 40 56 20" stroke="#C8F5A0" strokeWidth="4.5" strokeLinecap="round"/>
            <rect x="22" y="38" width="20" height="16" rx="2" fill="white" opacity="0.9"/>
            <path d="M18 40 L32 28 L46 40" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9"/>
          </svg>
        </div>
        <h2 className="font-display font-bold text-xl mb-2">Listing not found</h2>
        <Link to="/listings" className="btn-primary px-6 py-3 text-[14px]">Browse Listings</Link>
      </div>
    </div>
  )

  const rent = Math.round(listing.rent_per_month / 100)
  const photos = listing.images?.length ? listing.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80']
  const isNew = differenceInHours(new Date(), parseISO(listing.created_at)) < 48
  const isOwner = user?.id === listing.user_id

  return (
    <div className="min-h-screen pb-32">
      {/* Photo Gallery */}
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIdx}
            src={photos[imgIdx]}
            alt={listing.title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
          <ArrowLeft size={18} />
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <motion.button whileTap={{ scale: 0.85 }} onClick={toggleSave}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
            <Heart size={16} className={saved ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
          </motion.button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
            <Share2 size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {isNew && <span className="badge-new">NEW</span>}
          {listing.is_sublease && <span className="badge-sublet">Sublet</span>}
          {listing.is_featured && (
            <span className="flex items-center gap-0.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-400 text-white">
              <Star size={10} className="fill-white" /> Featured
            </span>
          )}
        </div>

        {/* Photo navigation */}
        {photos.length > 1 && (
          <>
            <button onClick={() => setImgIdx(i => Math.max(0, i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button onClick={() => setImgIdx(i => Math.min(photos.length - 1, i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
              <ChevronRight size={16} className="text-white" />
            </button>
            <div className="absolute bottom-4 right-4 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
              {imgIdx + 1}/{photos.length}
            </div>
          </>
        )}
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Price + Type */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-[32px] text-forest">${rent.toLocaleString()}</span>
              <span className="text-gray-400 text-[16px]">/mo</span>
            </div>
            {listing.utilities_included && (
              <span className="text-[12px] font-semibold text-forest flex items-center gap-1">
                <Zap size={11} /> Utilities included
              </span>
            )}
          </div>
          <span className="text-[12px] font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full capitalize mt-1">
            {listing.listing_type.replace('_', ' ').toLowerCase()}
          </span>
        </div>

        {/* Title + Location */}
        <div>
          <h1 className="font-display font-bold text-[22px] text-charcoal leading-snug mb-2">{listing.title}</h1>
          <div className="flex items-center gap-1.5 text-gray-500 text-[14px]">
            <MapPin size={14} style={{ color: '#1A3A2A' }} />
            <span>{listing.address ?? listing.neighborhood}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Beds', value: listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} BR`, icon: <Bed size={16} /> },
            { label: 'Baths', value: `${listing.bathrooms} BA`, icon: <Bath size={16} /> },
            { label: 'Size', value: listing.sqft ? `${listing.sqft} sqft` : '—', icon: null },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <div className="text-gray-400 flex justify-center mb-1">{s.icon}</div>
              <div className="font-display font-bold text-[15px]">{s.value}</div>
              <div className="text-[11px] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Availability */}
        {listing.available_from && (
          <div className="card p-4 flex items-center gap-3">
            <Calendar size={18} style={{ color: '#1A3A2A' }} />
            <div>
              <p className="text-[12px] text-gray-400">Available From</p>
              <p className="font-semibold text-[14px]">{format(parseISO(listing.available_from), 'MMMM d, yyyy')}</p>
            </div>
            {listing.lease_duration_months && (
              <div className="ml-auto text-right">
                <p className="text-[12px] text-gray-400">Lease</p>
                <p className="font-semibold text-[14px]">{listing.lease_duration_months} mo</p>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <div>
            <h2 className="font-display font-bold text-[17px] mb-2">About this place</h2>
            <p className="text-gray-600 text-[14px] leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-[17px] mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map(a => (
                <span key={a} className="flex items-center gap-1.5 text-[13px] bg-gray-50 border border-border px-3 py-1.5 rounded-xl text-gray-700">
                  <CheckCircle2 size={12} className="text-forest" /> {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Poster */}
        <div className="card p-4">
          <h2 className="font-display font-bold text-[15px] mb-3">Posted by</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center text-[18px] font-bold text-forest">
              {listing.profile?.display_name?.[0] ?? '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[15px]">{listing.profile?.display_name ?? 'Owner'}</span>
                {listing.profile?.is_verified_student && (
                  <CheckCircle2 size={14} className="text-forest" />
                )}
              </div>
              <p className="text-[12px] text-gray-400 capitalize">{listing.profile?.role ?? 'landlord'}</p>
            </div>
          </div>
        </div>

        {/* AI Listing Checker */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 p-4 pb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#C8F5A0' }}>
              <Zap size={14} style={{ color: '#1A3A2A' }} />
            </div>
            <div>
              <h2 className="font-display font-bold text-[15px]">AI Safety Check</h2>
              <p className="text-[11px] text-gray-400">Powered by Claude</p>
            </div>
            {checker && (
              <div className={`ml-auto px-3 py-1 rounded-full text-[12px] font-bold ${
                checker.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                checker.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {checker.riskLevel === 'low' ? 'Looks Safe' : checker.riskLevel === 'medium' ? 'Proceed Carefully' : 'High Risk'}
              </div>
            )}
          </div>

          {checkerLoading && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 text-[13px] text-gray-400">
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-forest rounded-full animate-spin flex-shrink-0" />
                Analyzing listing for red flags…
              </div>
            </div>
          )}

          {!checkerLoading && checker && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 space-y-3">
                {/* Risk bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Risk Score</span>
                    <span className="font-bold">{checker.riskScore}/100</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${checker.riskScore}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: checker.riskScore < 34 ? '#22c55e' : checker.riskScore < 67 ? '#f59e0b' : '#ef4444' }}
                    />
                  </div>
                </div>

                <p className="text-[13px] text-gray-600 leading-relaxed">{checker.summary}</p>

                {checker.flags.length > 0 && (
                  <div className="space-y-2">
                    {checker.flags.map((flag, i) => (
                      <div key={i} className={`flex gap-2.5 p-3 rounded-xl ${
                        flag.type === 'danger' ? 'bg-red-50 border border-red-100' :
                        flag.type === 'warning' ? 'bg-amber-50 border border-amber-100' :
                        'bg-blue-50 border border-blue-100'
                      }`}>
                        {flag.type === 'danger' ? <Shield size={14} className="text-red-500 flex-shrink-0 mt-0.5" /> :
                         flag.type === 'warning' ? <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" /> :
                         <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />}
                        <div>
                          <p className={`text-[12px] font-semibold ${flag.type === 'danger' ? 'text-red-700' : flag.type === 'warning' ? 'text-amber-700' : 'text-blue-700'}`}>{flag.title}</p>
                          <p className={`text-[11px] mt-0.5 ${flag.type === 'danger' ? 'text-red-600' : flag.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`}>{flag.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {!checkerLoading && !checker && (
            <div className="px-4 pb-4 text-[13px] text-gray-400">
              Unable to analyze listing right now. Check back later.
            </div>
          )}
        </div>

        {/* Scam warning */}
        {listing.scam_flagged && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
            <Shield size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[14px] text-red-700">Under Review</p>
              <p className="text-[12px] text-red-600 mt-0.5">This listing has been flagged for review. Proceed with caution.</p>
            </div>
          </div>
        )}

        <p className="text-[11px] text-gray-300 text-center">
          Listed {format(parseISO(listing.created_at), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* CTA */}
      {!isOwner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-border"
          style={{ background: 'rgba(247,247,242,0.95)', backdropFilter: 'blur(16px)', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          <div className="max-w-lg mx-auto flex gap-3">
            <button onClick={toggleSave}
              className="w-12 h-12 rounded-2xl border border-border bg-white flex items-center justify-center flex-shrink-0">
              <Heart size={18} className={saved ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
            </button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleContact}
              className="btn-primary flex-1 py-3.5 text-[16px] flex items-center justify-center gap-2">
              <MessageSquare size={17} /> Contact {listing.is_sublease ? 'Student' : 'Landlord'}
            </motion.button>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-border"
          style={{ background: 'rgba(247,247,242,0.95)', backdropFilter: 'blur(16px)', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          <div className="max-w-lg mx-auto">
            <Link to="/dashboard" className="btn-primary w-full py-3.5 text-[16px] text-center block">
              Manage Listing
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
