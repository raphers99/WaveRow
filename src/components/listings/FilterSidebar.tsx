import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { ListingFilters } from '@/types/app.types'
import { DEFAULT_FILTERS } from '@/types/app.types'

interface Props {
  filters: ListingFilters
  onChange: (f: ListingFilters) => void
  isOpen: boolean
  onClose: () => void
}

export default function FilterSidebar({ filters, onChange, isOpen, onClose }: Props) {
  const set = (key: keyof ListingFilters, value: unknown) => onChange({ ...filters, [key]: value })

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/40" style={{ backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[28px] shadow-2xl overflow-y-auto"
            style={{ maxHeight: '88vh', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-5 pt-3 pb-4 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl">Filters</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => onChange(DEFAULT_FILTERS)} className="text-[15px] font-medium" style={{ color: '#1A3A2A' }}>Reset</button>
                  <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="label">Sort By</label>
                <select value={filters.sortBy} onChange={e => set('sortBy', e.target.value)} className="input">
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="label">
                  Monthly Rent: <span className="font-bold normal-case" style={{ color: '#1A3A2A' }}>${filters.priceMin.toLocaleString()} – ${filters.priceMax.toLocaleString()}</span>
                </label>
                <div className="space-y-2">
                  <input type="range" min={500} max={4000} step={50} value={filters.priceMin}
                    onChange={e => set('priceMin', Number(e.target.value))} className="w-full h-2" style={{ accentColor: '#1A3A2A' }} />
                  <input type="range" min={500} max={4000} step={50} value={filters.priceMax}
                    onChange={e => set('priceMax', Number(e.target.value))} className="w-full h-2" style={{ accentColor: '#1A3A2A' }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>$500</span><span>$4,000</span></div>
              </div>

              {/* Type */}
              <div>
                <label className="label">Property Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM'].map(t => (
                    <button key={t} onClick={() => set('type', t)}
                      className={`text-[13px] px-3 py-2.5 rounded-xl font-medium transition-all ${filters.type === t ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}
                      style={filters.type === t ? { background: '#1A3A2A' } : {}}>
                      {t === 'all' ? 'All' : t === 'SHARED_ROOM' ? 'Shared' : t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Beds */}
              <div>
                <label className="label">Bedrooms</label>
                <div className="flex gap-2">
                  {['any', '0', '1', '2', '3+'].map(b => (
                    <button key={b} onClick={() => set('beds', b)}
                      className={`flex-1 text-[13px] py-2.5 rounded-xl font-medium transition-all ${filters.beds === b ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}
                      style={filters.beds === b ? { background: '#1A3A2A' } : {}}>
                      {b === '0' ? 'Studio' : b === 'any' ? 'Any' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neighborhood */}
              <div>
                <label className="label">Neighborhood</label>
                <select value={filters.neighborhood} onChange={e => set('neighborhood', e.target.value)} className="input">
                  <option value="all">All Areas</option>
                  <option value="Freret">Freret</option>
                  <option value="Carrollton">Carrollton</option>
                  <option value="Riverbend">Riverbend</option>
                  <option value="Garden District">Garden District</option>
                  <option value="Uptown">Uptown</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <label className="label">Preferences</label>
                <Toggle label="Student Sublets Only" checked={filters.subleaseOnly} onChange={v => set('subleaseOnly', v)} />
                <Toggle label="Pet Friendly" checked={filters.petFriendly} onChange={v => set('petFriendly', v)} />
                <Toggle label="Furnished" checked={filters.furnished} onChange={v => set('furnished', v)} />
              </div>

              <button onClick={onClose} className="btn-primary w-full py-4 text-[16px]">Show Results</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[15px] text-charcoal">{label}</span>
      <button onClick={() => onChange(!checked)}
        className="w-12 h-7 rounded-full transition-all duration-200 relative flex-shrink-0"
        style={{ background: checked ? '#1A3A2A' : '#D1D5DB' }}>
        <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-200 ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
