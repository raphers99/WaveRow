'use client'
import { motion } from 'framer-motion'

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1A3A2A 0%, #0E2218 100%)' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 wave-bg" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
      >
        <div
          className="w-24 h-24 rounded-[28px] flex items-center justify-center border border-white/20"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}
        >
          <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
            <path d="M4 20 Q10 8 16 16 Q22 24 28 12" stroke="#C8F5A0" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M4 24 Q10 12 16 20 Q22 28 28 16" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
          </svg>
        </div>

        <div className="text-center">
          <p className="font-display font-bold text-[38px] text-white tracking-tight leading-none">WaveRow</p>
          <p className="text-white/50 text-[14px] font-sans mt-1.5 tracking-wide">Student Housing · Tulane</p>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#C8F5A0' }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.22 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
