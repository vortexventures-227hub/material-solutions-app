import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import DavidAvatar from './DavidAvatar'

const SERVICES = [
  'Forklift Purchase',
  'Forklift Rental',
  'OSHA Training',
  'Wire-guided Systems',
  'Racking Installation',
  'Service & Repair',
  'Parts',
  'Other'
]

export default function ContactForm() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <section id="contact" className="py-24 px-4 relative overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255, 215, 0, 0.05), transparent)'
        }}
      />

      <div className="max-w-6xl mx-auto relative" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
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
              GET IN TOUCH
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
              Ready to Upgrade
              <br />
              <span style={{ color: '#B8860B' }}>Your Fleet?</span>
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether you need a single pallet jack or a complete warehouse overhaul, we're here to help. David AI is standing by to assist you right now.
            </p>

            {/* David prompt */}
            <motion.div
              className="p-6 rounded-2xl mb-8"
              style={{
                background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4 mb-3">
                <DavidAvatar size="small" />
                <div>
                  <div className="font-bold text-yellow-500">David AI</div>
                  <div className="text-xs text-gray-400">Usually responds instantly</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm italic">
                "I can help you find the perfect equipment for your needs. Just tell me what you're looking for — capacity, fuel type, budget — and I'll show you the best matches from our inventory."
              </p>
            </motion.div>

            {/* Contact info */}
            <div className="space-y-4">
              {[
                { icon: '📍', label: 'Location', value: 'New Jersey, USA' },
                { icon: '📞', label: 'Phone', value: '(555) 123-4567' },
                { icon: '✉️', label: 'Email', value: 'info@materialsolutionsnj.com' },
                { icon: '🕐', label: 'Hours', value: 'Mon-Fri 7AM-5PM EST' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-gray-500 text-sm">{item.label}</div>
                    <div className="text-black font-semibold">{item.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="p-8 rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15)'
              }}
            >
              {submitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                      boxShadow: '0 8px 32px rgba(34, 197, 94, 0.4)'
                    }}
                  >
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">David will get back to you shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="(555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Acme Warehouse"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Service</label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                      >
                        <option value="">Select a service</option>
                        {SERVICES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                      placeholder="Tell us about your needs..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-lg text-black transition-all cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      boxShadow: '0 8px 32px rgba(255, 215, 0, 0.35)'
                    }}
                    whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(255, 215, 0, 0.45)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Message →
                  </motion.button>

                  <p className="text-center text-gray-500 text-sm">
                    Or chat with David AI directly using the chat widget
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
