import { Link, useLocation } from 'react-router-dom'
import { User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const PAGE_TITLES: Record<string, string> = {
  '/listings':       'Browse',
  '/sublets':        'Sublets',
  '/roommates':      'Roommates',
  '/neighborhoods':  'Neighborhoods',
  '/create':         'New Listing',
  '/dashboard':      'Profile',
  '/login':          'Sign In',
  '/lease-analyzer': 'Lease Analyzer',
  '/chat':           'Messages',
  '/waitlist':       'Waitlist',
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { session, profile } = useAuthStore()
  const isHome = pathname === '/'
  const title = PAGE_TITLES[pathname] ??
    (pathname.startsWith('/listings/') ? 'Listing' :
     pathname.startsWith('/chat/')     ? 'Chat'    : 'WaveRow')

  return (
    <header
      className="sticky top-0 z-50 border-b border-border/60"
      style={{
        background: 'rgba(247,247,242,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between" style={{ height: '52px' }}>
        {isHome ? (
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(145deg, #2a5c40, #1A3A2A)' }}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                {/* House roof */}
                <path d="M6 14 L16 4 L26 14 Z" fill="white" opacity="0.95" />
                {/* House body */}
                <rect x="9" y="13" width="14" height="11" rx="1" fill="white" opacity="0.95" />
                {/* Door */}
                <rect x="13" y="17" width="6" height="7" rx="1" fill="#1A3A2A" opacity="0.45" />
                {/* Wave below */}
                <path d="M4 27 Q8 24 12 27 Q16 30 20 27 Q24 24 28 27" stroke="#C8F5A0" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <span className="font-display font-bold text-[19px] text-charcoal">WaveRow</span>
          </Link>
        ) : (
          <h1 className="font-display font-bold text-[19px] text-charcoal">{title}</h1>
        )}

        <Link
          to={session ? '/dashboard' : '/login'}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-border shadow-sm overflow-hidden"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User size={17} className="text-gray-500" />
          )}
        </Link>
      </div>
    </header>
  )
}
