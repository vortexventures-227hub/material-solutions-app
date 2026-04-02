import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import DavidAvatar from './DavidAvatar'

export default function Hero() {
  const [scrollY, setScrollY] = useState(0)
  const videoRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            filter: 'brightness(0.3)'
          }}
        >
          <source src="/videos/raymond-reach-demo.mp4" type="video/mp4" />
        </video>

        {/* Video overlay - DARK for contrast with light content */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.75) 50%, rgba(0, 0, 0, 0.9) 100%)'
        }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 0.95) 100%)'
        }} />
      </div>

      {/* Parallax floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: 'rgba(255, 215, 0, 0.4)',
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.25
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="flex flex-col items-center text-center">
            
            {/* MEET DAVID - THE CENTERPIECE */}
            <motion.div
              className="mb-8"
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
              style={{ transform: `translateY(${scrollY * 0.12}px)` }}
            >
              <DavidAvatar size="hero" />
            </motion.div>

            {/* Meet David CTA - directly below avatar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <motion.a
                href="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xl text-black transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  boxShadow: '0 8px 40px rgba(255, 215, 0, 0.5), 0 0 80px rgba(255, 215, 0, 0.3)'
                }}
                whileHover={{ scale: 1.08, boxShadow: '0 12px 50px rgba(255, 215, 0, 0.6), 0 0 100px rgba(255, 215, 0, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">👋</span>
                Talk to David
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.a>
            </motion.div>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-4"
            >
              <span
                className="px-4 py-1 rounded-full text-sm font-bold tracking-wider"
                style={{
                  background: 'rgba(255, 215, 0, 0.15)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  color: '#FFD700'
                }}
              >
                ⚡ ELECTRIC NARROW AISLE FORKLIFTS
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
              style={{ transform: `translateY(${scrollY * 0.08}px)` }}
            >
              <span className="text-white">FORKLIFTS </span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                SOLD
              </span>
              <br />
              <span className="text-white">TO MEET YOUR </span>
              <span style={{ color: '#FFD700' }}>GOALS</span>
            </motion.h1>

            {/* Brand pillars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              {[
                { icon: '🛡️', text: 'Warranties' },
                { icon: '💳', text: 'Financing' },
                { icon: '📋', text: 'Lease-to-Own' },
                { icon: '$1', text: 'Buyouts' },
                { icon: '✅', text: 'OSHA Certified' },
                { icon: '🔧', text: 'Service & Repair' }
              ].map((item, i) => (
                <motion.span
                  key={i}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-black"
                  style={{
                    background: 'rgba(255, 215, 0, 0.9)',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                  }}
                  whileHover={{ scale: 1.05, background: 'rgba(255, 228, 77, 1)' }}
                >
                  {item.icon} {item.text}
                </motion.span>
              ))}
            </motion.div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 }}
              className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl"
            >
              New Jersey's premier forklift dealer. Sales, service, parts & OSHA compliance — backed by David AI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.a
                href="/inventory"
                className="px-8 py-4 rounded-xl font-bold text-lg text-black transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)'
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(255, 215, 0, 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                Browse Inventory →
              </motion.a>

              <motion.a
                href="/contact"
                className="px-8 py-4 rounded-xl font-bold text-lg text-black transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid rgba(255, 215, 0, 0.5)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                }}
                whileHover={{ scale: 1.05, background: 'white', borderColor: '#FFD700' }}
                whileTap={{ scale: 0.98 }}
              >
                Contact Us →
              </motion.a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="mt-16 flex items-center gap-8"
            >
              {[
                { value: '50+', label: 'In Stock' },
                { value: '20+', label: 'Years Experience' },
                { value: '100%', label: 'OSHA Certified' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div
                    className="text-3xl md:text-4xl font-black"
                    style={{ color: '#FFD700' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-yellow-500/50 flex items-start justify-center p-1">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-yellow-500"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
