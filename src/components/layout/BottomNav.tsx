import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, PlusCircle, Users, User } from 'lucide-react'

const TABS = [
  { to: '/',          icon: Home,       label: 'Home'      },
  { to: '/listings',  icon: Search,     label: 'Browse'    },
  { to: '/create',    icon: PlusCircle, label: 'Post',     special: true },
  { to: '/roommates', icon: Users,      label: 'Roommates' },
  { to: '/dashboard', icon: User,       label: 'Profile'   },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60"
      style={{
        background: 'rgba(247,247,242,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center h-16 max-w-lg mx-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = tab.to === '/' ? pathname === '/' : pathname.startsWith(tab.to)

          if (tab.special) {
            return (
              <Link key={tab.to} to={tab.to} className="flex-1 flex items-center justify-center">
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg -mt-5"
                  style={{ background: 'linear-gradient(145deg, #2a5c40, #1A3A2A)', boxShadow: '0 6px 20px rgba(26,58,42,0.35)' }}
                >
                  <Icon size={24} className="text-white" strokeWidth={2.2} />
                </motion.div>
              </Link>
            )
          }

          return (
            <Link key={tab.to} to={tab.to} className="flex-1 flex flex-col items-center justify-center h-full gap-0.5">
              <motion.div whileTap={{ scale: 0.82 }} className="flex flex-col items-center gap-0.5">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? '#1A3A2A' : '#999999' }}
                />
                <span className="text-[10px] font-medium font-sans" style={{ color: isActive ? '#1A3A2A' : '#999999' }}>
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
