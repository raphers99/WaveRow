import { Link, useLocation } from 'react-router-dom'
import { User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const PAGE_TITLES: Record<string, string> = {
  '/listings':      'Browse',
  '/sublets':       'Sublets',
  '/roommates':     'Roommates',
  '/neighborhoods': 'Neighborhoods',
  '/create':        'New Listing',
  '/dashboard':     'Profile',
  '/login':         'Sign In',
  '/lease-analyzer':'Lease Analyzer',
  '/chat':          'Messages',
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
        background: 'rgba(247,247,242,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {isHome ? (
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(145deg, #2a5c40, #1A3A2A)' }}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M4 20 Q10 8 16 16 Q22 24 28 12" stroke="#C8F5A0" strokeWidth="3.5" strokeLinecap="round" />
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
