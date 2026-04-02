import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SERVICES = [
  {
    id: 'osha',
    title: 'OSHA Compliance',
    description: 'Full safety inspections, operator training, and compliance documentation. Keep your warehouse up to code.',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
        <path
          d="M24 4L6 12v12c0 11.1 7.7 21.5 18 24 10.3-2.5 18-12.9 18-24V12L24 4z"
          fill="none"
          stroke="url(#shieldGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 24l6 6 12-12"
          fill="none"
          stroke="url(#shieldGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: '#FFD700',
    features: ['Safety Inspections', 'Operator Training', 'Documentation', 'Annual Audits']
  },
  {
    id: 'wire',
    title: 'Wire-guided Systems',
    description: 'Precision wire-guided forklift technology for high-density racking. Maximize your warehouse efficiency.',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <defs>
          <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="18" fill="none" stroke="url(#wireGrad)" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M8 24h32M24 8v32" stroke="url(#wireGrad)" strokeWidth="2" />
        <circle cx="24" cy="24" r="4" fill="#FFD700" />
        <path d="M24 4v6M24 38v6M4 24h6M38 24h6" stroke="url(#wireGrad)" strokeWidth="2" />
      </svg>
    ),
    color: '#FFA500',
    features: ['Indoor Navigation', 'Precision Picking', 'Auto Steering', 'Traffic Management']
  },
  {
    id: 'racking',
    title: 'Racking Solutions',
    description: 'Custom warehouse racking installation and redesign. Selective, push-back, drive-in, and pallet flow systems.',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <defs>
          <linearGradient id="rackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="4" height="32" fill="url(#rackGrad)" rx="1" />
        <rect x="36" y="8" width="4" height="32" fill="url(#rackGrad)" rx="1" />
        <rect x="8" y="12" width="32" height="3" fill="url(#rackGrad)" rx="1" />
        <rect x="8" y="22" width="32" height="3" fill="url(#rackGrad)" rx="1" />
        <rect x="8" y="32" width="32" height="3" fill="url(#rackGrad)" rx="1" />
        <rect x="14" y="14" width="8" height="6" fill="#FFD700" opacity="0.5" rx="1" />
        <rect x="26" y="24" width="8" height="6" fill="#FFD700" opacity="0.5" rx="1" />
      </svg>
    ),
    color: '#FFD700',
    features: ['Custom Design', 'Installation', 'Permit Handling', 'Expansion Plans']
  }
]

function ServiceCard({ service, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: 'easeOut' }}
      className="relative group"
    >
      <div
        className="relative p-8 rounded-2xl overflow-hidden card-hover"
        style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255, 215, 0, 0.15)'
        }}
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${service.color}15 0%, transparent 60%)`
          }}
        />

        {/* Icon with animation */}
        <motion.div
          className="relative mb-6 w-20 h-20 rounded-xl flex items-center justify-center"
          style={{ background: `${service.color}15` }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.div
            animate={{
              boxShadow: [
                `0 0 20px ${service.color}40`,
                `0 0 40px ${service.color}60`,
                `0 0 20px ${service.color}40`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-xl"
          />
          <div className="relative z-10">{service.icon}</div>
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>

        {/* Description */}
        <p className="text-gray-400 mb-6 leading-relaxed">{service.description}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {service.features.map((feature, i) => (
            <motion.span
              key={feature}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: `${service.color}15`,
                border: `1px solid ${service.color}30`,
                color: service.color
              }}
            >
              {feature}
            </motion.span>
          ))}
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${service.color}, transparent)`
          }}
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )
}

export default function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section id="services" className="py-24 px-4 relative overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* Background decorations */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 215, 0, 0.05), transparent)'
        }}
      />

      <div className="max-w-7xl mx-auto relative" ref={ref}>
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span
            className="px-4 py-1 rounded-full text-sm font-bold tracking-wider mb-4 inline-block"
            style={{
              background: 'rgba(255, 215, 0, 0.15)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              color: '#B8860B'
            }}
          >
            OUR SERVICES
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
            Everything You Need
            <br />
            <span style={{ color: '#B8860B' }}>Under One Roof</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            From forklift sales to complete warehouse solutions, we've got you covered with professional service and expertise.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
