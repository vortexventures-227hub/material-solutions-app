import Head from 'next/head'
import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import DavidAvatar from '../components/DavidAvatar'

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
    featured: true,
    description: 'High-performance reach truck ideal for high-density warehousing. Features advanced AC drive system and ergonomic operator compartment.'
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
    featured: false,
    description: 'Versatile electric counterbalance forklift perfect for indoor/outdoor use. Low emissions, quiet operation.'
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
    featured: true,
    description: 'Rugged pneumatic tire forklift built for outdoor surfaces. Reliable Toyota engine with excellent fuel economy.'
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
    featured: false,
    description: 'Heavy-duty electric pallet jack with exceptional maneuverability. Perfect for loading docks and warehouses.'
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
    featured: false,
    description: 'Deep reach truck for extra deep racking applications. Extends into racks up to 54 inches.'
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
    featured: true,
    description: 'High-capacity pneumatic tire forklift. Built tough for outdoor yards, construction sites, and lumber yards.'
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
    featured: false,
    description: 'Like-new electric pallet jack. Very low hours, recently serviced and ready to work.'
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
    featured: false,
    description: 'Stand-up rider forklift perfect for tight spaces. Excellent visibility and operator comfort.'
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
    featured: true,
    description: 'Premium certified pre-owned reach truck. Full inspection, new batteries, and 6-month warranty included.'
  },
  {
    id: 10,
    name: 'Toyota 8FGU18',
    category: 'Electric Counterbalance',
    capacity: '3,500 lbs',
    fuel: 'Electric',
    hours: '650',
    price: '$15,900',
    status: 'In Stock',
    image: 'raymond_2178.jpg',
    featured: false,
    description: 'Compact electric counterbalance forklift. Great for warehouses with weight restrictions.'
  },
  {
    id: 11,
    name: 'Hyster H50FT',
    category: 'Pneumatic Tire',
    capacity: '5,000 lbs',
    fuel: 'Diesel',
    hours: '3,200',
    price: '$16,500',
    status: 'In Stock',
    image: 'raymond_2169.jpg',
    featured: false,
    description: 'Heavy-duty diesel forklift built for the toughest jobs. Excellent lifting capacity and durability.'
  },
  {
    id: 12,
    name: 'Raymond 7200',
    category: 'Electric Pallet Jack',
    capacity: '4,500 lbs',
    fuel: 'Electric',
    hours: '1,400',
    price: '$7,200',
    status: 'In Stock',
    image: 'raymond_2170.jpg',
    featured: false,
    description: 'Reliable walkie pallet jack for high-volume picking operations. Simple, dependable, low maintenance.'
  }
]

const CATEGORIES = ['All', 'Electric', 'LP Gas', 'Diesel', 'Pneumatic', 'Pallet Jack', 'Reach Truck']
const SORT_OPTIONS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Hours: Low to High']

export default function Inventory() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Featured')
  const [selectedItem, setSelectedItem] = useState(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  let filtered = INVENTORY.filter(item => {
    if (activeCategory === 'All') return true
    return item.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
           item.fuel.toLowerCase() === activeCategory.toLowerCase()
  })

  if (sortBy === 'Price: Low to High') {
    filtered = [...filtered].sort((a, b) => parseInt(a.price.replace(/[$,]/g, '')) - parseInt(b.price.replace(/[$,]/g, '')))
  } else if (sortBy === 'Price: High to Low') {
    filtered = [...filtered].sort((a, b) => parseInt(b.price.replace(/[$,]/g, '')) - parseInt(a.price.replace(/[$,]/g, '')))
  }

  const statusColors = {
    'In Stock': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
    'Just Arrived': { bg: 'rgba(255, 215, 0, 0.15)', text: '#B8860B', border: 'rgba(255, 215, 0, 0.3)' },
    'Hot Deal': { bg: 'rgba(234, 88, 12, 0.15)', text: '#EA580C', border: 'rgba(234, 88, 12, 0.3)' },
    'New Arrival': { bg: 'rgba(220, 38, 38, 0.15)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.3)' },
    'Certified Pre-Owned': { bg: 'rgba(255, 165, 0, 0.15)', text: '#CC8400', border: 'rgba(255, 165, 0, 0.3)' }
  }

  return (
    <>
      <Head>
        <title>Inventory | Material Solutions NJ</title>
        <meta name="description" content="Browse our complete inventory of forklifts, pallet jacks, and warehouse equipment." />
      </Head>

      <div className="pt-24 pb-16 px-4" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span
              className="px-4 py-1 rounded-full text-sm font-bold tracking-wider mb-4 inline-block"
              style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                color: '#B8860B'
              }}
            >
              {INVENTORY.length} UNITS AVAILABLE
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-black mb-4">
              Equipment <span style={{ color: '#B8860B' }}>Inventory</span>
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Browse our complete selection. Every unit inspected, serviced, and ready to work.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                    activeCategory === cat ? 'text-black' : 'text-gray-600 hover:text-black'
                  }`}
                  style={{
                    background: activeCategory === cat
                      ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                      : 'rgba(0, 0, 0, 0.05)',
                    border: activeCategory === cat ? 'none' : '1px solid rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-black text-sm focus:outline-none focus:border-yellow-500"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </motion.div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" ref={ref}>
            {filtered.map((item, index) => {
              const status = statusColors[item.status] || statusColors['In Stock']
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.05 }}
                  className="relative rounded-xl overflow-hidden cursor-pointer group"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                  }}
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
                >
                  {item.featured && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-xs font-bold text-black" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}>
                      ⭐
                    </div>
                  )}
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-xs font-bold" style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
                    {item.status}
                  </div>

                  <div className="h-36 overflow-hidden">
                    <img src={`/images/${item.image}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-black text-sm mb-1">{item.name}</h3>
                    <p className="text-gray-500 text-xs mb-2">{item.category}</p>
                    <div className="flex gap-2 text-xs text-gray-400 mb-3">
                      <span>{item.fuel}</span>
                      <span>•</span>
                      <span>{item.hours} hrs</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-yellow-600">{item.price}</span>
                      <span className="text-xs text-gray-500">{item.capacity}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden"
              style={{ background: '#FFFFFF', border: '1px solid rgba(255, 215, 0, 0.2)' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-black cursor-pointer"
                style={{ background: 'rgba(0, 0, 0, 0.05)' }}
              >
                ✕
              </button>

              <div className="h-56 overflow-hidden">
                <img src={`/images/${selectedItem.image}`} alt={selectedItem.name} className="w-full h-full object-cover" />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-black">{selectedItem.name}</h2>
                    <p className="text-gray-500">{selectedItem.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-yellow-600">{selectedItem.price}</div>
                    <div className="text-sm text-gray-400">{selectedItem.capacity}</div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{selectedItem.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                    <div className="text-yellow-600 font-bold">{selectedItem.fuel}</div>
                    <div className="text-gray-400 text-xs">Fuel Type</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                    <div className="text-yellow-600 font-bold">{selectedItem.hours}</div>
                    <div className="text-gray-400 text-xs">Hours</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                    <div className="text-yellow-600 font-bold">{selectedItem.status}</div>
                    <div className="text-gray-400 text-xs">Status</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href="/contact"
                    className="flex-1 py-3 rounded-lg font-bold text-center text-black"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                  >
                    Get Quote
                  </a>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-3 rounded-lg font-semibold text-black"
                    style={{ background: 'rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.1)' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
