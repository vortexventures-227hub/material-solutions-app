import Head from 'next/head'
import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import DavidAvatar from '../components/DavidAvatar'

const PLACEHOLDER_IMAGE = '/images/placeholder-forklift.jpg'

function normalizeFsmRow(row) {
  const name = [row.year, row.make, row.model].filter(Boolean).join(' ')

  let category = 'Forklift'
  const model = (row.model || '').toLowerCase()
  const mast = (row.mast_type || '').toLowerCase()
  if (model.includes('5600') || model.includes('560') || model.includes('pc30')) {
    category = 'Order Picker'
  } else if (model.includes('752') || model.includes('970') || model.includes('960')) {
    category = 'Electric Reach Truck'
  } else if (model.includes('bendi') || model.includes('b40')) {
    category = 'Articulating Forklift'
  } else if (mast) {
    const powerLabel = row.power_type ? capitalize(row.power_type) : 'Electric'
    category = `${powerLabel} ${capitalize(mast)} Forklift`
  }

  const rawImages = Array.isArray(row.images) ? row.images : []
  const firstImage = rawImages.find(img => img && typeof img === 'string' && img.trim() !== '')
  const imageUrl = firstImage || PLACEHOLDER_IMAGE

  const priceNum = parseFloat(row.listing_price || 0)
  const priceStr = priceNum > 0 ? `$${priceNum.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : 'Call for Price'

  const statusMap = {
    listed: 'In Stock',
    sold: 'Sold',
    pending: 'Pending Sale',
    draft: 'Coming Soon',
  }
  const displayStatus = statusMap[row.status] || 'In Stock'

  const hoursStr = row.hours != null ? Number(row.hours).toLocaleString('en-US') : 'N/A'
  const capacityStr = row.capacity_lbs ? `${Number(row.capacity_lbs).toLocaleString('en-US')} lbs` : ''

  const description = [row.condition_notes, row.additional_context]
    .filter(Boolean)
    .join(' ')
    .trim() || `${name}. ${capacityStr ? `Capacity: ${capacityStr}.` : ''} ${hoursStr !== 'N/A' ? `Hours: ${hoursStr}.` : ''}`.trim()

  return {
    id: row.id,
    name,
    category,
    capacity: capacityStr,
    fuel: capitalize(row.power_type || 'electric'),
    hours: hoursStr,
    price: priceStr,
    status: displayStatus,
    imageUrl,
    featured: false,
    description,
    location: row.additional_context?.match(/\b([A-Z]{2})\b/)?.[1] || null,
  }
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const CATEGORIES = ['All', 'Electric', 'Order Picker', 'Reach Truck', 'Articulating']
const SORT_OPTIONS = ['Default', 'Price: Low to High', 'Price: High to Low', 'Hours: Low to High']

export default function Inventory({ inventory, fetchError }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Default')
  const [selectedItem, setSelectedItem] = useState(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  let filtered = inventory.filter(item => {
    if (activeCategory === 'All') return true
    return item.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
           item.fuel.toLowerCase() === activeCategory.toLowerCase()
  })

  if (sortBy === 'Price: Low to High') {
    filtered = [...filtered].sort((a, b) => {
      const aVal = parseFloat(a.price.replace(/[$,]/g, '')) || 0
      const bVal = parseFloat(b.price.replace(/[$,]/g, '')) || 0
      return aVal - bVal
    })
  } else if (sortBy === 'Price: High to Low') {
    filtered = [...filtered].sort((a, b) => {
      const aVal = parseFloat(a.price.replace(/[$,]/g, '')) || 0
      const bVal = parseFloat(b.price.replace(/[$,]/g, '')) || 0
      return bVal - aVal
    })
  } else if (sortBy === 'Hours: Low to High') {
    filtered = [...filtered].sort((a, b) => {
      const aVal = parseInt(a.hours.replace(/,/g, '')) || 0
      const bVal = parseInt(b.hours.replace(/,/g, '')) || 0
      return aVal - bVal
    })
  }

  const statusColors = {
    'In Stock': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
    'Coming Soon': { bg: 'rgba(255, 215, 0, 0.15)', text: '#B8860B', border: 'rgba(255, 215, 0, 0.3)' },
    'Pending Sale': { bg: 'rgba(234, 88, 12, 0.15)', text: '#EA580C', border: 'rgba(234, 88, 12, 0.3)' },
    'Sold': { bg: 'rgba(156, 163, 175, 0.15)', text: '#6B7280', border: 'rgba(156, 163, 175, 0.3)' },
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
              {inventory.length} UNITS AVAILABLE
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-black mb-4">
              Equipment <span style={{ color: '#B8860B' }}>Inventory</span>
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Browse our complete selection. Every unit inspected, serviced, and ready to work.
            </p>
          </motion.div>

          {fetchError && (
            <div className="text-center py-8 mb-8 rounded-xl" style={{ background: 'rgba(255, 215, 0, 0.08)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
              <p className="text-gray-500 text-sm">We&apos;re updating our inventory. Please check back shortly or <a href="/contact" className="text-yellow-600 underline">contact us</a> for current availability.</p>
            </div>
          )}

          {/* Filters */}
          {inventory.length > 0 && (
            <motion.div
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
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
          )}

          {/* Grid */}
          {inventory.length === 0 && !fetchError ? (
            <div className="text-center py-24">
              <p className="text-gray-400 text-lg">We&apos;re updating our inventory — check back soon.</p>
              <p className="text-gray-400 text-sm mt-2">Have a unit in mind? <a href="/contact" className="text-yellow-600 underline">Contact us</a></p>
            </div>
          ) : (
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
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }}
                      />
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
          )}
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
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }}
                />
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
                    <div className="text-gray-400 text-xs">Power Type</div>
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

export async function getServerSideProps() {
  const FSM_BASE = process.env.FSM_API_BASE || 'https://vortex-forklift-api-production.up.railway.app'
  const FSM_JWT = process.env.FSM_SERVICE_JWT

  if (!FSM_JWT) {
    console.error('[inventory] FSM_SERVICE_JWT env var not set — returning empty inventory')
    return { props: { inventory: [], fetchError: true } }
  }

  try {
    const res = await fetch(`${FSM_BASE}/api/inventory?status=listed`, {
      headers: { Authorization: `Bearer ${FSM_JWT}` },
      // no caching — fresh truth on every render
    })

    if (!res.ok) {
      console.error(`[inventory] FSM returned ${res.status}`)
      return { props: { inventory: [], fetchError: true } }
    }

    const json = await res.json()
    const rows = Array.isArray(json.data) ? json.data : []

    // Exclude test/seed rows (serial prefixed TEST- are placeholder entries, not real stock)
    const realRows = rows.filter(row => !String(row.serial || '').toUpperCase().startsWith('TEST-'))

    const inventory = realRows.map(normalizeFsmRow)

    return { props: { inventory, fetchError: false } }
  } catch (err) {
    console.error('[inventory] FSM fetch failed:', err.message)
    return { props: { inventory: [], fetchError: true } }
  }
}
