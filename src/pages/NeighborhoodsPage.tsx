import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, Bike, Coffee, Moon, Sun } from 'lucide-react'

const NEIGHBORHOODS = [
  {
    name: 'Freret',
    avg: 1150,
    desc: 'The most popular neighborhood for Tulane students. Steps from campus with a growing restaurant scene, coffee shops, and easy walkability.',
    vibe: ['Walkable', 'Student Hub', 'Food Scene'],
    walkTime: '5–10 min to campus',
    icons: [<Bike size={14} />, <Coffee size={14} />],
    highlight: 'Most popular with freshmen & sophomores',
  },
  {
    name: 'Carrollton',
    avg: 1050,
    desc: 'Quiet, tree-lined residential streets north of campus. Great for students who want a calmer environment with easy access to the streetcar.',
    vibe: ['Quiet', 'Residential', 'Streetcar'],
    walkTime: '15–20 min to campus',
    icons: [<Sun size={14} />, <Coffee size={14} />],
    highlight: 'Best value near campus',
  },
  {
    name: 'Riverbend',
    avg: 1250,
    desc: 'Where Carrollton meets the river. Home to Camellia Grill, local bars, and a vibrant nightlife scene popular with upperclassmen.',
    vibe: ['Nightlife', 'Restaurants', 'River Views'],
    walkTime: '20 min to campus',
    icons: [<Moon size={14} />, <Coffee size={14} />],
    highlight: 'Best nightlife access',
  },
  {
    name: 'Garden District',
    avg: 1600,
    desc: 'Historic New Orleans at its finest. Magazine Street shopping, St. Charles streetcar, and stunning antebellum architecture.',
    vibe: ['Historic', 'Magazine St', 'Streetcar'],
    walkTime: '25–35 min to campus',
    icons: [<Sun size={14} />, <MapPin size={14} />],
    highlight: 'Most iconic New Orleans feel',
  },
  {
    name: 'Uptown',
    avg: 1350,
    desc: 'Classic uptown New Orleans neighborhood stretching from campus toward the Garden District. Mix of student housing and family homes.',
    vibe: ['Classic NOLA', 'Mixed', 'Oak-lined'],
    walkTime: '10–20 min to campus',
    icons: [<Bike size={14} />, <Sun size={14} />],
    highlight: 'Wide variety of housing options',
  },
  {
    name: 'Mid-City',
    avg: 950,
    desc: 'Further from campus but increasingly popular for its affordability, City Park access, and a thriving local dining scene.',
    vibe: ['Affordable', 'City Park', 'Local Gems'],
    walkTime: '30–40 min (bus/bike)',
    icons: [<Coffee size={14} />, <MapPin size={14} />],
    highlight: 'Most affordable option',
  },
]

export default function NeighborhoodsPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="px-4 pt-6 pb-6"
        style={{ background: 'linear-gradient(160deg, #1A3A2A 0%, #0E2218 100%)' }}>
        <h1 className="font-display font-bold text-[28px] text-white mb-2">
          Neighborhood<br /><span style={{ color: '#C8F5A0' }}>Guide</span>
        </h1>
        <p className="text-white/60 text-[14px] leading-relaxed">
          Find the perfect area for your Tulane lifestyle
        </p>
      </div>

      <div className="px-4 py-5 space-y-4">
        {NEIGHBORHOODS.map((n, i) => (
          <motion.div key={n.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#C8F5A0' }}>
                      <MapPin size={16} style={{ color: '#1A3A2A' }} />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-[18px] text-charcoal">{n.name}</h2>
                      <p className="text-[12px] font-semibold" style={{ color: '#1A3A2A' }}>Avg ${n.avg}/mo</p>
                    </div>
                  </div>
                  <Link to={`/listings?neighborhood=${n.name}`}
                    className="flex items-center gap-1 text-[12px] font-semibold text-gray-400 mt-1">
                    View <ArrowRight size={12} />
                  </Link>
                </div>

                <p className="text-[13px] text-gray-500 leading-relaxed mb-3">{n.desc}</p>

                <div className="flex items-center gap-1.5 mb-3 text-[12px] text-gray-400">
                  <Bike size={12} />
                  <span>{n.walkTime}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {n.vibe.map(v => (
                    <span key={v} className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{v}</span>
                  ))}
                </div>

                <div className="bg-forest/5 rounded-xl px-3 py-2 border border-forest/10">
                  <p className="text-[12px] font-semibold text-forest">{n.highlight}</p>
                </div>
              </div>

              <Link to={`/listings?neighborhood=${n.name}`}
                className="flex items-center justify-center gap-2 py-3 border-t border-border text-[13px] font-semibold text-forest">
                Browse {n.name} listings <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
