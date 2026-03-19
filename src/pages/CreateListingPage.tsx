import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { createListing } from '@/lib/queries/listings'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const STEPS = ['Type', 'Details', 'Location', 'Photos', 'Review'] as const
type Step = typeof STEPS[number]

const TYPES = ['APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM'] as const
const AMENITIES_OPTIONS = ['In-unit Laundry', 'Parking', 'A/C', 'Dishwasher', 'Pet Friendly', 'Gym', 'Pool', 'Furnished', 'Utilities Included', 'Balcony', 'Hardwood Floors', 'Storage']

interface FormData {
  listing_type: string
  title: string
  description: string
  rent_per_month: string
  bedrooms: string
  bathrooms: string
  sqft: string
  neighborhood: string
  address: string
  available_from: string
  lease_duration_months: string
  is_sublease: boolean
  utilities_included: boolean
  pet_friendly: boolean
  furnished: boolean
  amenities: string[]
  images: string[]
}

const INIT: FormData = {
  listing_type: 'APARTMENT',
  title: '',
  description: '',
  rent_per_month: '',
  bedrooms: '1',
  bathrooms: '1',
  sqft: '',
  neighborhood: 'Freret',
  address: '',
  available_from: '',
  lease_duration_months: '12',
  is_sublease: false,
  utilities_included: false,
  pet_friendly: false,
  furnished: false,
  amenities: [],
  images: [],
}

export default function CreateListingPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stepIdx, setStepIdx] = useState(0)
  const [form, setForm] = useState<FormData>(INIT)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const step = STEPS[stepIdx]
  const set = (key: keyof FormData, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  const toggleAmenity = (a: string) => {
    set('amenities', form.amenities.includes(a)
      ? form.amenities.filter(x => x !== a)
      : [...form.amenities, a])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(e.target.files)) {
      const path = `listings/${user.id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('listing-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    set('images', [...form.images, ...urls])
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!user) return
    setSubmitting(true)
    try {
      await createListing({
        user_id: user.id,
        listing_type: form.listing_type as never,
        title: form.title,
        description: form.description,
        rent_per_month: Math.round(parseFloat(form.rent_per_month) * 100),
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseFloat(form.bathrooms),
        sqft: form.sqft ? parseInt(form.sqft) : null,
        neighborhood: form.neighborhood,
        address: form.address,
        available_from: form.available_from || null,
        lease_duration_months: parseInt(form.lease_duration_months),
        is_sublease: form.is_sublease,
        utilities_included: form.utilities_included,
        pet_friendly: form.pet_friendly,
        furnished: form.furnished,
        amenities: form.amenities,
        images: form.images,
        status: 'ACTIVE' as const,
        lat: null,
        lng: null,
        is_featured: false,
        scam_flagged: false,
      })
      toast.success('Listing posted!')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Failed to post listing')
    } finally {
      setSubmitting(false)
    }
  }

  const canNext = () => {
    if (step === 'Type') return !!form.listing_type
    if (step === 'Details') return !!form.title && !!form.rent_per_month
    if (step === 'Location') return !!form.neighborhood
    return true
  }

  return (
    <div className="min-h-screen" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <div className="sticky top-14 z-40 px-4 py-3 border-b border-border/50"
        style={{ background: 'rgba(247,247,242,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => stepIdx > 0 ? setStepIdx(i => i - 1) : navigate(-1)}
            className="w-9 h-9 bg-white rounded-xl border border-border flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-[17px]">Post a Listing</h1>
            <p className="text-[12px] text-gray-400">Step {stepIdx + 1} of {STEPS.length}: {step}</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all"
              style={{ background: i <= stepIdx ? '#1A3A2A' : '#E8E8E0' }} />
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {/* STEP 1: Type */}
            {step === 'Type' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display font-bold text-[22px] mb-1">What type of place?</h2>
                  <p className="text-gray-400 text-[14px]">Select the property type you're listing</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {TYPES.map(t => (
                    <button key={t} onClick={() => set('listing_type', t)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${form.listing_type === t ? 'border-forest bg-forest/5' : 'border-border bg-white'}`}>
                      <div className="w-9 h-9 rounded-xl mb-2.5 flex items-center justify-center"
                        style={{ background: form.listing_type === t ? '#1A3A2A' : '#F3F4F6' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={form.listing_type === t ? '#C8F5A0' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {t === 'APARTMENT' || t === 'STUDIO' ? <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></> : t === 'HOUSE' ? <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> : <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></>}
                        </svg>
                      </div>
                      <p className="font-display font-bold text-[15px]">{t === 'SHARED_ROOM' ? 'Shared Room' : t.charAt(0) + t.slice(1).toLowerCase()}</p>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 card">
                  <div>
                    <p className="font-semibold text-[15px]">Student Sublet</p>
                    <p className="text-[12px] text-gray-400">Are you a student subletting your lease?</p>
                  </div>
                  <button onClick={() => set('is_sublease', !form.is_sublease)}
                    className="w-12 h-7 rounded-full transition-all relative"
                    style={{ background: form.is_sublease ? '#1A3A2A' : '#D1D5DB' }}>
                    <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${form.is_sublease ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Details */}
            {step === 'Details' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display font-bold text-[22px] mb-1">Listing details</h2>
                  <p className="text-gray-400 text-[14px]">Tell students about your place</p>
                </div>

                <div>
                  <label className="label">Listing Title *</label>
                  <input className="input" value={form.title} onChange={e => set('title', e.target.value)}
                    placeholder="e.g. Sunny 2BR near Tulane campus" />
                </div>

                <div>
                  <label className="label">Monthly Rent ($) *</label>
                  <input className="input" type="number" value={form.rent_per_month} onChange={e => set('rent_per_month', e.target.value)}
                    placeholder="1200" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label">Beds</label>
                    <select className="input" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
                      {['0','1','2','3','4','5'].map(n => <option key={n} value={n}>{n === '0' ? 'Studio' : n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Baths</label>
                    <select className="input" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                      {['1','1.5','2','2.5','3'].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Sqft</label>
                    <input className="input" type="number" value={form.sqft} onChange={e => set('sqft', e.target.value)} placeholder="850" />
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea className="input resize-none" rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Describe your place — layout, vibe, proximity to campus..." />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'utilities_included', label: 'Utilities Included' },
                    { key: 'furnished', label: 'Furnished' },
                  ].map(item => (
                    <button key={item.key} onClick={() => set(item.key as keyof FormData, !form[item.key as keyof FormData])}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${form[item.key as keyof FormData] ? 'border-forest bg-forest/5' : 'border-border bg-white'}`}>
                      <p className="font-semibold text-[13px]">{item.label}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="label">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_OPTIONS.map(a => (
                      <button key={a} onClick={() => toggleAmenity(a)}
                        className={`text-[12px] px-3 py-1.5 rounded-xl font-medium transition-all ${form.amenities.includes(a) ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                        style={form.amenities.includes(a) ? { background: '#1A3A2A' } : {}}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Location */}
            {step === 'Location' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display font-bold text-[22px] mb-1">Where is it?</h2>
                  <p className="text-gray-400 text-[14px]">Help students find your place</p>
                </div>

                <div>
                  <label className="label">Neighborhood *</label>
                  <select className="input" value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)}>
                    {['Freret', 'Carrollton', 'Riverbend', 'Garden District', 'Uptown', 'Mid-City', 'Marigny'].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Street Address</label>
                  <input className="input" value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="123 Freret St, New Orleans, LA" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Available From</label>
                    <input className="input" type="date" value={form.available_from} onChange={e => set('available_from', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Lease (months)</label>
                    <select className="input" value={form.lease_duration_months} onChange={e => set('lease_duration_months', e.target.value)}>
                      {['1','2','3','6','9','12','18','24'].map(n => <option key={n} value={n}>{n} mo</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Photos */}
            {step === 'Photos' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display font-bold text-[22px] mb-1">Add photos</h2>
                  <p className="text-gray-400 text-[14px]">Listings with photos get 3x more views</p>
                </div>

                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <Upload size={24} className="text-gray-300 mb-2" />
                  <p className="text-[14px] font-medium text-gray-400">{uploading ? 'Uploading…' : 'Tap to upload photos'}</p>
                  <p className="text-[11px] text-gray-300 mt-1">JPG, PNG up to 10MB each</p>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Review */}
            {step === 'Review' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display font-bold text-[22px] mb-1">Review your listing</h2>
                  <p className="text-gray-400 text-[14px]">Make sure everything looks right</p>
                </div>

                <div className="card p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[13px]">Type</span>
                    <span className="font-semibold text-[13px] capitalize">{form.listing_type.toLowerCase()}{form.is_sublease ? ' (Sublet)' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[13px]">Title</span>
                    <span className="font-semibold text-[13px] text-right max-w-[60%]">{form.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[13px]">Rent</span>
                    <span className="font-display font-bold text-[15px] text-forest">${parseFloat(form.rent_per_month || '0').toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[13px]">Beds / Baths</span>
                    <span className="font-semibold text-[13px]">{form.bedrooms === '0' ? 'Studio' : `${form.bedrooms}BR`} / {form.bathrooms}BA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[13px]">Neighborhood</span>
                    <span className="font-semibold text-[13px]">{form.neighborhood}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[13px]">Photos</span>
                    <span className="font-semibold text-[13px]">{form.images.length} uploaded</span>
                  </div>
                  {form.amenities.length > 0 && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400 text-[13px]">Amenities</span>
                      <span className="font-semibold text-[13px] text-right max-w-[60%]">{form.amenities.join(', ')}</span>
                    </div>
                  )}
                </div>

                <p className="text-[12px] text-gray-400 text-center">
                  By posting, you agree to WaveRow's Terms of Service. All listings are reviewed within 24 hours.
                </p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-border"
        style={{ background: 'rgba(247,247,242,0.95)', backdropFilter: 'blur(16px)', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-lg mx-auto">
          {step === 'Review' ? (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting}
              className="btn-primary w-full py-4 text-[16px] flex items-center justify-center gap-2">
              {submitting ? 'Posting…' : <><Check size={18} /> Post Listing</>}
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStepIdx(i => i + 1)}
              disabled={!canNext()}
              className="btn-primary w-full py-4 text-[16px] flex items-center justify-center gap-2 disabled:opacity-40">
              Continue <ArrowRight size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
