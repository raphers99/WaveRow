import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Grid2X2, List, Search } from 'lucide-react'
import FilterSidebar from '@/components/listings/FilterSidebar'
import ListingCard from '@/components/listings/ListingCard'
import { getListings } from '@/lib/queries/listings'
import type { Listing, ListingFilters } from '@/types/app.types'
import { DEFAULT_FILTERS } from '@/types/app.types'

export default function ListingsPage() {
  const [searchParams] = useSearchParams()
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ListingFilters>({
    ...DEFAULT_FILTERS,
    neighborhood: searchParams.get('neighborhood') ?? 'all',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setLoading(true)
    getListings(filters)
      .then(setAllListings)
      .finally(() => setLoading(false))
  }, [filters])

  const results = useMemo(() => {
    if (!query.trim()) return allListings
    const q = query.toLowerCase()
    return allListings.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.neighborhood?.toLowerCase().includes(q) ||
      l.address?.toLowerCase().includes(q)
    )
  }, [allListings, query])

  const activeCount = [
    filters.type !== 'all', filters.beds !== 'any',
    filters.subleaseOnly, filters.petFriendly, filters.furnished,
    filters.neighborhood !== 'all',
    filters.priceMin > 500 || filters.priceMax < 4000,
  ].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto">
      {/* Sticky search bar */}
      <div className="sticky top-14 z-40 px-4 py-3 border-b border-border/50"
        style={{ background: 'rgba(247,247,242,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3.5 py-2.5 border border-border">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search listings..."
              className="w-full text-[15px] outline-none placeholder-gray-400 bg-transparent"
            />
          </div>

          <button onClick={() => setFilterOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-medium text-[14px] transition-all flex-shrink-0 ${
              activeCount > 0 ? 'text-white border-transparent' : 'bg-white border-border text-gray-600'
            }`}
            style={activeCount > 0 ? { background: '#1A3A2A' } : {}}>
            <SlidersHorizontal size={15} />
            Filters
            {activeCount > 0 && (
              <span className="w-5 h-5 bg-white/25 rounded-full text-[11px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <div className="flex bg-white rounded-xl border border-border overflow-hidden flex-shrink-0">
            <button onClick={() => setCompact(false)} className={`p-2.5 transition-all ${!compact ? 'bg-gray-100' : 'text-gray-400'}`}>
              <Grid2X2 size={16} />
            </button>
            <button onClick={() => setCompact(true)} className={`p-2.5 transition-all ${compact ? 'bg-gray-100' : 'text-gray-400'}`}>
              <List size={16} />
            </button>
          </div>
        </div>
        <p className="text-[12px] text-gray-400 mt-2">{results.length} listing{results.length !== 1 ? 's' : ''} near campus</p>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card overflow-hidden">
                <div className="shimmer h-48 w-full" />
                <div className="p-4 space-y-2.5">
                  <div className="shimmer h-5 rounded-lg w-1/3" />
                  <div className="shimmer h-4 rounded-lg w-3/4" />
                  <div className="shimmer h-3 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#1A3A2A' }}>
              <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                <path d="M14 28 L32 10 L50 28 Z" fill="white" opacity="0.95"/>
                <rect x="18" y="26" width="28" height="22" rx="1.5" fill="white" opacity="0.95"/>
                <rect x="27" y="36" width="10" height="12" rx="2" fill="#1A3A2A" opacity="0.45"/>
                <path d="M8 54 Q16 48 24 54 Q32 60 40 54 Q48 48 56 54" stroke="#C8F5A0" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <p className="font-display text-xl font-bold mb-2">No listings found</p>
            <p className="text-[14px] text-gray-400 mb-4">Try adjusting your filters</p>
            <button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn-primary mx-auto text-[14px] px-5 py-2.5">
              Clear Filters
            </button>
          </div>
        ) : compact ? (
          <div className="space-y-3">
            {results.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ListingCard listing={l} compact />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>

      <FilterSidebar filters={filters} onChange={setFilters} isOpen={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  )
}
