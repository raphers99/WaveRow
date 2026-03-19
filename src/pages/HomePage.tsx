import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Shield, MessageSquare, TrendingDown, ArrowRight, MapPin } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import { getListings } from '@/lib/queries/listings'
import type { Listing } from '@/types/app.types'

const NEIGHBORHOODS = [
  { name: 'Freret', avg: 1150, desc: 'Right off campus — most walkable for freshmen & sophomores' },
  { name: 'Carrollton', avg: 1050, desc: 'Quiet residential blocks with great coffee shops' },
  { name: 'Riverbend', avg: 1250, desc: 'Bustling nightlife and Camellia Grill vibes' },
  { name: 'Garden District', avg: 1600, desc: 'Historic mansions, Magazine Street, and St. Charles streetcar' },
]

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getListings({ sortBy: 'newest' }).then(data => setListings(data.slice(0, 4)))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section
        className="relative wave-bg pt-10 pb-12 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A3A2A 0%, #0E2218 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: '#C8F5A0' }} />

        <div className="max-w-lg mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 text-white/75 text-xs px-3.5 py-1.5 rounded-full mb-5 border border-white/20"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Shield size={11} style={{ color: '#C8F5A0' }} /> Verified student housing
          </div>

          <h1 className="font-display font-bold text-[38px] sm:text-[44px] text-white leading-[1.1] mb-3">
            Find Your<br />
            <span style={{ color: '#C8F5A0' }}>Perfect Home</span>
          </h1>
          <p className="text-white/60 text-[15px] mb-7 leading-relaxed">
            Verified apartments, student sublets, and roommates — built for Tulane students.
          </p>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-2xl p-2 flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <MapPin size={15} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Neighborhood or keyword..."
                className="w-full text-[15px] outline-none py-2 placeholder-gray-400"
              />
            </div>
            <Link to={`/listings${query ? `?q=${query}` : ''}`} className="btn-primary px-5 py-2.5 text-[14px]">
              <Search size={14} /> Search
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {['Freret', 'Carrollton', 'Sublets', 'Furnished', 'Pet Friendly'].map(tag => (
              <Link key={tag} to={`/listings?q=${tag}`}
                className="text-white/60 text-xs border border-white/20 px-3.5 py-1.5 rounded-full hover:bg-white/10 transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 -mt-1">
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-2 bg-white rounded-2xl shadow-md p-4 border border-border">
          {[
            { value: '200+', label: 'Listings' },
            { value: '98%', label: 'Verified' },
            { value: '500+', label: 'Students' },
            { value: '4.8★', label: 'Rating' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-[17px]" style={{ color: '#1A3A2A' }}>{s.value}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* New Listings */}
      <section className="pt-8 pb-2 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="section-title">New Listings</h2>
              <p className="text-gray-400 text-[13px] mt-0.5">Just posted near campus</p>
            </div>
            <Link to="/listings" className="flex items-center gap-1 font-semibold text-[13px]" style={{ color: '#1A3A2A' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex-shrink-0 w-[80vw] max-w-sm h-64 bg-white rounded-2xl animate-pulse border border-border" />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:mx-0">
              {listings.map(l => (
                <div key={l.id} className="flex-shrink-0 w-[80vw] max-w-sm snap-start md:w-auto md:max-w-none">
                  <ListingCard listing={l} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why WaveRow */}
      <section className="py-8 px-4">
        <div className="max-w-lg mx-auto">
          <h2 className="section-title mb-5">Why WaveRow?</h2>
          <div className="space-y-3">
            {[
              { icon: <Shield size={20} style={{ color: '#1A3A2A' }} />, title: 'Student Verified', desc: 'Every listing reviewed. All landlords verified. Tulane email required to post.' },
              { icon: <MessageSquare size={20} className="text-blue-500" />, title: 'Direct Messaging', desc: 'Message landlords and subletters directly in-app with real-time chat.' },
              { icon: <TrendingDown size={20} style={{ color: '#1A3A2A' }} />, title: 'Price Alerts', desc: 'Save listings and get notified instantly when rent drops.' },
            ].map(f => (
              <div key={f.title} className="card p-4 flex items-start gap-4">
                <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-border">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[16px] mb-0.5">{f.title}</h3>
                  <p className="text-gray-500 text-[13px] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-end justify-between mb-4">
            <h2 className="section-title">Neighborhoods</h2>
            <Link to="/neighborhoods" className="flex items-center gap-1 font-semibold text-[13px]" style={{ color: '#1A3A2A' }}>
              Guide <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {NEIGHBORHOODS.map(n => (
              <Link key={n.name} to={`/listings?neighborhood=${n.name}`}
                className="card p-4 block active:scale-[0.97] transition-transform">
                <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center" style={{ background: '#C8F5A0' }}>
                  <MapPin size={16} style={{ color: '#1A3A2A' }} />
                </div>
                <h3 className="font-display font-bold text-[15px] mb-0.5">{n.name}</h3>
                <p className="text-gray-400 text-[12px] mb-2 line-clamp-2">{n.desc}</p>
                <p className="text-xs font-semibold" style={{ color: '#1A3A2A' }}>Avg ${n.avg}/mo</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-4 mb-4 rounded-2xl wave-bg py-10 px-6 text-center overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1A3A2A, #0E2218)' }}
      >
        <h2 className="font-display text-[26px] font-bold text-white mb-2">List Your Place</h2>
        <p className="text-white/60 text-[14px] mb-6 leading-relaxed">
          Going abroad? Have an extra room? Connect directly with verified Tulane students.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link to="/create" className="btn-mint w-full text-[15px] py-3.5">Post a Listing</Link>
          <Link to="/login?role=student" className="border border-white/25 text-white font-semibold px-8 py-3.5 rounded-full text-[15px] active:scale-[0.97] transition-transform text-center">
            I&apos;m Subletting My Place
          </Link>
        </div>
      </motion.section>
    </div>
  )
}
