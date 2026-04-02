import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const INVENTORY = [
  {
    id: 1,
    name: 'Raymond 7500',
    category: 'Electric Reach Truck',
    capacity: '4,500 lbs',
    fuel: 'Electric',
    hours: '1,200',
    price: '$24,500',
    status: 'In Stock',
    image: 'raymond_2166.jpg',
    featured: true
  },
  {
    id: 2,
    name: 'Raymond 5500',
    category: 'Electric Counterbalance',
    capacity: '5,000 lbs',
    fuel: 'Electric',
    hours: '890',
    price: '$21,900',
    status: 'In Stock',
    image: 'raymond_2167.jpg',
    featured: false
  },
  {
    id: 3,
    name: 'Toyota 8FGU25',
    category: 'Pneumatic Tire',
    capacity: '5,000 lbs',
    fuel: 'LP Gas',
    hours: '2,100',
    price: '$18,500',
    status: 'Just Arrived',
    image: 'raymond_2169.jpg',
    featured: true
  },
  {
    id: 4,
    name: 'Crown PC 4500',
    category: 'Electric Pallet Jack',
    capacity: '6,000 lbs',
    fuel: 'Electric',
    hours: '450',
    price: '$8,900',
    status: 'In Stock',
    image: 'raymond_2170.jpg',
    featured: false
  },
  {
    id: 5,
    name: 'Raymond 7300',
    category: 'Deep Reach Truck',
    capacity: '3,500 lbs',
    fuel: 'Electric',
    hours: '1,800',
    price: '$19,500',
    status: 'In Stock',
    image: 'raymond_2172.jpg',
    featured: false
  },
  {
    id: 6,
    name: 'Toyota 8FGU32',
    category: 'Pneumatic Tire',
    capacity: '6,500 lbs',
    fuel: 'LP Gas',
    hours: '1,500',
    price: '$22,000',
    status: 'Hot Deal',
    image: 'raymond_2173.jpg',
    featured: true
  },
  {
    id: 7,
    name: 'Raymond 2160',
    category: 'Electric Pallet Jack',
    capacity: '4,500 lbs',
    fuel: 'Electric',
    hours: '200',
    price: '$6,500',
    status: 'New Arrival',
    image: 'raymond_2174.jpg',
    featured: false
  },
  {
    id: 8,
    name: 'Crown SP 3500',
    category: 'Stand-up Counterbalance',
    capacity: '3,500 lbs',
    fuel: 'Electric',
    hours: '1,100',
    price: '$16,800',
    status: 'In Stock',
    image: 'raymond_2176.jpg',
    featured: false
  },
  {
    id: 9,
    name: 'Raymond 7500',
    category: 'High Performance Reach',
    capacity: '4,000 lbs',
    fuel: 'Electric',
    hours: '750',
    price: '$27,500',
    status: 'Certified Pre-Owned',
    image: 'raymond_2177.jpg',
    featured: true
  }
]

const CATEGORIES = ['All', 'Electric', 'LP Gas', 'Pneumatic', 'Pallet Jack']

function InventoryCard({ item, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [isHovered, setIsHovered] = useState(false)

  const statusColors = {
    'In Stock': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
    'Just Arrived': { bg: 'rgba(255, 215, 0, 0.15)', text: '#FFD700', border: 'rgba(255, 215, 0, 0.3)' },
    'Hot Deal': { bg: 'rgba(234, 88, 12, 0.15)', text: '#EA580C', border: 'rgba(234, 88, 12, 0.3)' },
    'New Arrival': { bg: 'rgba(220, 38, 38, 0.15)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.3)' },
    'Certified Pre-Owned': { bg: 'rgba(255, 165, 0, 0.15)', text: '#FFA500', border: 'rgba(255, 165, 0, 0.3)' }
  }

  const status = statusColors[item.status] || statusColors['In Stock']

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden card-hover"
        style={{
          background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
          border: '1px solid rgba(255, 215, 0, 0.15)'
        }}
        whileHover={{ y: -8 }}
      >
        {/* Featured badge */}
        {item.featured && (
          <div
            className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: 'black'
            }}
          >
            ⭐ FEATURED
          </div>
        )}

        {/* Status badge */}
        <div
          className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: status.bg,
            color: status.text,
            border: `1px solid ${status.border}`
          }}
        >
          {item.status}
        </div>

        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={`/images/${item.image}`}
            alt={item.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 50%, rgba(10, 10, 10, 0.95) 100%)'
            }}
          />

          {/* Hover overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(255, 215, 0, 0.15)' }}
              >
                <motion.button
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="px-6 py-3 rounded-lg font-bold text-black"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    boxShadow: '0 8px 24px rgba(255, 215, 0, 0.4)'
                  }}
                >
                  View Details →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-white">{item.name}</h3>
              <p className="text-sm text-gray-400">{item.category}</p>
            </div>
            <div
              className="px-3 py-1 rounded-lg text-sm font-bold"
              style={{
                background: 'rgba(255, 215, 0, 0.15)',
                color: '#FFD700'
              }}
            >
              {item.capacity}
            </div>
          </div>

          {/* Specs */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {item.fuel}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item.hours} hrs
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255, 215, 0, 0.1)' }}>
            <div className="text-2xl font-black" style={{ color: '#FFD700' }}>{item.price}</div>
            <motion.button
              className="px-4 py-2 rounded-lg text-sm font-semibold text-black transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Quote
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function InventoryGrid() {
  const [activeCategory, setActiveCategory] = useState('All')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const filtered = activeCategory === 'All'
    ? INVENTORY
    : INVENTORY.filter(item =>
        item.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
        item.fuel.toLowerCase() === activeCategory.toLowerCase()
      )

  return (
    <section id="inventory" className="py-24 px-4 relative overflow-hidden" style={{ background: '#F8F8F8' }}>
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255, 215, 0, 0.05), transparent)'
        }}
      />

      <div className="max-w-7xl mx-auto relative" ref={ref}>
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
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
            OUR INVENTORY
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
            Premium Equipment
            <br />
            <span style={{ color: '#B8860B' }}>Ready to Work</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Every unit inspected, serviced, and certified. Financing available.
          </p>
        </motion.div>

        {/* Category filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{
                background: activeCategory === cat
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : 'rgba(0, 0, 0, 0.05)',
                border: activeCategory === cat
                  ? 'none'
                  : '1px solid rgba(0, 0, 0, 0.1)'
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Inventory grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((item, index) => (
              <InventoryCard key={item.id} item={item} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View all button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <motion.a
            href="/inventory"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg text-black transition-all"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              boxShadow: '0 8px 30px rgba(255, 215, 0, 0.3)'
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(255, 215, 0, 0.4)' }}
          >
            View Full Inventory
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
