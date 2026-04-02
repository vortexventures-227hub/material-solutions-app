import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DavidAvatar({ size = 'large', isHero = false }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showGlow, setShowGlow] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(prev => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-40 h-40',
    hero: 'w-72 h-72 md:w-96 md:h-96'
  }

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} flex items-center justify-center`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Outer glow ring - enhanced for visibility */}
      <AnimatePresence>
        {showGlow && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 165, 0, 0.2) 40%, transparent 70%)',
              filter: 'blur(30px)'
            }}
            animate={{
              scale: isSpeaking ? [1, 1.3, 1] : [1, 1.15, 1],
              opacity: isSpeaking ? [0.7, 1, 0.7] : [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Avatar circle */}
      <motion.div
        className="relative w-full h-full rounded-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 0 80px rgba(255, 215, 0, 0.4), 0 0 160px rgba(255, 215, 0, 0.15), inset 0 0 40px rgba(255, 215, 0, 0.15)'
        }}
        animate={isSpeaking ? {
          boxShadow: [
            '0 0 80px rgba(255, 215, 0, 0.4), 0 0 160px rgba(255, 215, 0, 0.15)',
            '0 0 100px rgba(255, 215, 0, 0.6), 0 0 200px rgba(255, 215, 0, 0.25)',
            '0 0 80px rgba(255, 215, 0, 0.4), 0 0 160px rgba(255, 215, 0, 0.15)'
          ]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {/* David face silhouette */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="faceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Head outline */}
          <ellipse cx="100" cy="95" rx="55" ry="65" fill="#1a1a2e" stroke="url(#faceGrad)" strokeWidth="2" />

          {/* Visor/Helmet - yellow instead of cyan */}
          <path
            d="M50 85 Q100 70 150 85 Q155 100 150 115 Q100 130 50 115 Q45 100 50 85"
            fill="url(#visorGrad)"
            filter="url(#glow)"
            opacity="0.9"
          />
          <path
            d="M55 90 Q100 78 145 90 Q148 102 145 112 Q100 125 55 112 Q52 102 55 90"
            fill="#1a1a2e"
            opacity="0.9"
          />

          {/* Eyes behind visor - yellow glowing */}
          <circle cx="80" cy="98" r="7" fill="#FFD700" filter="url(#glow)">
            <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="120" cy="98" r="7" fill="#FFD700" filter="url(#glow)">
            <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* Jaw/lower face */}
          <path
            d="M65 125 Q100 145 135 125"
            stroke="url(#faceGrad)"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />

          {/* Status indicator */}
          <circle cx="100" cy="155" r="9" fill={isSpeaking ? '#22C55E' : '#FFD700'} filter="url(#glow)">
            <animate attributeName="opacity" values="1;0.6;1" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Animated pulse rings - yellow */}
        {isSpeaking && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-yellow-500"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-yellow-400"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}
      </motion.div>

      {/* "David AI" label - more prominent */}
      <motion.div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-black tracking-wider"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 165, 0, 0.95))',
          border: '2px solid #FFD700',
          color: '#000000',
          boxShadow: '0 4px 20px rgba(255, 215, 0, 0.5)'
        }}
        animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        DAVID AI
      </motion.div>
    </motion.div>
  )
}
