import { motion } from 'framer-motion'

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: '#0E2218' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
      >
        <div
          className="w-28 h-28 rounded-[32px] flex items-center justify-center mb-7 shadow-2xl"
          style={{ background: 'linear-gradient(145deg, #2a5c40, #1A3A2A)', border: '1px solid rgba(200,245,160,0.2)' }}
        >
          <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
            {/* House roof */}
            <path d="M14 28 L32 10 L50 28 Z" fill="white" opacity="0.95" />
            {/* House body */}
            <rect x="18" y="26" width="28" height="22" rx="1.5" fill="white" opacity="0.95" />
            {/* Door */}
            <rect x="27" y="36" width="10" height="12" rx="2" fill="#1A3A2A" opacity="0.45" />
            {/* Windows */}
            <rect x="20" y="30" width="7" height="5" rx="1" fill="#1A3A2A" opacity="0.2" />
            <rect x="37" y="30" width="7" height="5" rx="1" fill="#1A3A2A" opacity="0.2" />
            {/* Wave below house */}
            <path d="M8 54 Q16 48 24 54 Q32 60 40 54 Q48 48 56 54" stroke="#C8F5A0" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* App name */}
        <motion.p
          className="font-display font-bold text-[40px] text-white tracking-tight leading-none mb-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          WaveRow
        </motion.p>

        {/* Slogan */}
        <motion.p
          className="text-white/50 text-[15px] font-sans text-center leading-snug px-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          Bridging the gap between{'\n'}students and landlords
        </motion.p>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="absolute bottom-20 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#C8F5A0' }}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
