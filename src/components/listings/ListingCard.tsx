import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, MapPin, Star, Bed, Bath, CheckCircle2 } from 'lucide-react'
import { differenceInHours, parseISO } from 'date-fns'
import clsx from 'clsx'
import type { Listing } from '@/types/app.types'
import { saveListing, unsaveListing } from '@/lib/queries/listings'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

interface Props {
  listing: Listing
  compact?: boolean
}

export default function ListingCard({ listing, compact = false }: Props) {
  const { user } = useAuthStore()
  const [saved, setSaved] = useState(listing.saved ?? false)
  const [imgIdx, setImgIdx] = useState(0)
  const isNew = differenceInHours(new Date(), parseISO(listing.created_at)) < 48
  const rent = Math.round(listing.rent_per_month / 100)
  const photo = listing.images?.[imgIdx] ?? listing.images?.[0] ?? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) { toast.error('Sign in to save listings'); return }
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

  if (compact) {
    return (
      <Link to={`/listings/${listing.id}`}>
        <motion.div whileTap={{ scale: 0.97 }} className="card flex gap-3 p-3">
          <div className="relative w-28 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img src={photo} alt={listing.title} className="w-full h-full object-cover" />
            {isNew && <span className="absolute top-1.5 left-1.5 badge-new">NEW</span>}
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <div className="flex items-start justify-between gap-1 mb-0.5">
              <span className="font-display font-bold text-[17px] text-forest leading-none">
                ${rent.toLocaleString()}<span className="text-gray-400 font-sans font-normal text-xs">/mo</span>
              </span>
              <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize flex-shrink-0">
                {listing.listing_type.replace('_', ' ').toLowerCase()}
              </span>
            </div>
            <p className="font-display font-semibold text-[14px] text-charcoal leading-tight mb-1 line-clamp-1">{listing.title}</p>
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-1.5">
              <MapPin size={10} /><span className="truncate">{listing.neighborhood}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="flex items-center gap-0.5"><Bed size={11} />{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms}BR`}</span>
              <span className="flex items-center gap-0.5"><Bath size={11} />{listing.bathrooms}BA</span>
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="card overflow-hidden">
      {/* Photo */}
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
        <img src={photo} alt={listing.title} className="w-full h-full object-cover" />

        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {isNew && <span className="badge-new">NEW</span>}
          {listing.is_sublease && <span className="badge-sublet">Sublet</span>}
          {listing.utilities_included && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-forest/80 text-white">Utilities Incl.</span>
          )}
          {listing.scam_flagged && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500 text-white">⚠ Review</span>
          )}
        </div>

        <motion.button whileTap={{ scale: 0.85 }} onClick={toggleSave}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
          <Heart size={15} className={saved ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </motion.button>

        {listing.images?.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {listing.images.map((_, i) => (
              <button key={i} onClick={e => { e.preventDefault(); setImgIdx(i) }}
                className={clsx('w-1.5 h-1.5 rounded-full transition-all', i === imgIdx ? 'bg-white scale-125' : 'bg-white/50')} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <Link to={`/listings/${listing.id}`} className="block p-4">
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <span className="font-display font-bold text-[22px] text-forest leading-none">${rent.toLocaleString()}</span>
            <span className="text-gray-400 font-sans font-normal text-sm">/mo</span>
          </div>
          <span className="text-[11px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full capitalize mt-0.5">
            {listing.listing_type.replace('_', ' ').toLowerCase()}
          </span>
        </div>

        <h3 className="font-display font-semibold text-[15px] text-charcoal leading-snug mb-1.5">{listing.title}</h3>

        <div className="flex items-center gap-1 text-gray-400 text-[13px] mb-3">
          <MapPin size={12} />
          <span className="truncate">{listing.neighborhood}</span>
        </div>

        <div className="flex items-center gap-3 text-gray-500 text-[13px] mb-3">
          <span className="flex items-center gap-1"><Bed size={13} />{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms}BR`}</span>
          <span className="flex items-center gap-1"><Bath size={13} />{listing.bathrooms}BA</span>
          {listing.sqft && <span>{listing.sqft} sqft</span>}
        </div>

        <div className="flex gap-1.5 flex-wrap mb-3">
          {listing.amenities?.slice(0, 3).map(a => (
            <span key={a} className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{a}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-forest/10 rounded-full flex items-center justify-center text-[11px] font-bold text-forest">
              {listing.profile?.display_name?.[0] ?? '?'}
            </div>
            <span className="text-[13px] font-medium text-gray-600">{listing.profile?.display_name ?? 'Owner'}</span>
            {listing.profile?.is_verified_student && <CheckCircle2 size={13} className="text-forest" />}
          </div>
          {listing.is_featured && (
            <div className="flex items-center gap-0.5">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-[12px] font-semibold text-gray-700">Featured</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
