import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Calendar, CheckCircle2 } from 'lucide-react'
import { getListings } from '@/lib/queries/listings'
import ListingCard from '@/components/listings/ListingCard'
import type { Listing } from '@/types/app.types'
import { format, parseISO } from 'date-fns'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DURATIONS = ['Any', '1–3 mo', '4–6 mo', '6–12 mo']

export default function SubletsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [month, setMonth] = useState<string | null>(null)
  const [duration, setDuration] = useState('Any')

  useEffect(() => {
    setLoading(true)
    getListings({ subleaseOnly: true, sortBy: 'newest' })
      .then(setListings)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (query) {
        const q = query.toLowerCase()
        if (!l.title.toLowerCase().includes(q) && !l.neighborhood?.toLowerCase().includes(q)) return false
      }
      if (month && l.available_from) {
        const m = MONTHS[parseISO(l.available_from).getMonth()]
        if (m !== month) return false
      }
      if (duration !== 'Any' && l.lease_duration_months) {
        const d = l.lease_duration_months
        if (duration === '1–3 mo' && (d < 1 || d > 3)) return false
        if (duration === '4–6 mo' && (d < 4 || d > 6)) return false
        if (duration === '6–12 mo' && (d < 6 || d > 12)) return false
      }
      return true
    })
  }, [listings, query, month, duration])

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-14 z-40 px-4 py-3 border-b border-border/50"
        style={{ background: 'rgba(247,247,242,0.92)', backdropFilter: 'blur(16px)' }}>
        <h1 className="font-display font-bold text-[22px] mb-3">Student Sublets</h1>

        <div className="flex items-center gap-2 bg-white rounded-xl px-3.5 py-2.5 border border-border mb-3">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search sublets..."
            className="w-full text-[15px] outline-none placeholder-gray-400 bg-transparent" />
        </div>

        {/* Month filter */}
        <div className="overflow-x-auto -mx-4 px-4 pb-1">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {[null, ...MONTHS].map(m => (
              <button key={m ?? 'all'} onClick={() => setMonth(m)}
                className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full transition-all flex-shrink-0 ${month === m ? 'text-white' : 'bg-white border border-border text-gray-600'}`}
                style={month === m ? { background: '#1A3A2A' } : {}}>
                {m ?? 'Any Month'}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-gray-400 mt-2">{filtered.length} sublet{filtered.length !== 1 ? 's' : ''} available</p>
      </div>

      {/* Duration pills */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        {DURATIONS.map(d => (
          <button key={d} onClick={() => setDuration(d)}
            className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full transition-all ${duration === d ? 'text-white' : 'bg-white border border-border text-gray-600'}`}
            style={duration === d ? { background: '#1A3A2A' } : {}}>
            {d}
          </button>
        ))}
      </div>

      {/* Info banner */}
      <div className="mx-4 mb-4 p-3 rounded-2xl flex items-center gap-3" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
        <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
        <p className="text-[12px] text-blue-700">All sublets are posted by verified Tulane students. Direct messaging included.</p>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-border" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="font-display font-bold text-xl mb-2">No sublets found</p>
            <p className="text-[14px] text-gray-400 mb-4">Try adjusting your filters or check back soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ListingCard listing={l} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
