import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DavidChatWidget from './DavidChatWidget'

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Inventory', href: '/inventory' },
  { name: 'Services', href: '/#services' },
  { name: 'Contact', href: '/contact' }
]

export default function Layout({ children }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - White with black/yellow accents */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-4'
        }`}
        style={{
          background: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          borderBottom: isScrolled ? '2px solid rgba(255, 215, 0, 0.3)' : '2px solid transparent',
          boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)'
                }}
              >
                <span className="text-black font-black text-lg">MS</span>
              </div>
              <div>
                <div className="font-black text-black text-lg tracking-tight">MATERIAL</div>
                <div className="text-yellow-600 text-xs font-bold tracking-widest">SOLUTIONS NJ</div>
              </div>
            </motion.a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-black font-semibold transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all group-hover:w-full" />
                </a>
              ))}
              <motion.a
                href="/contact"
                className="px-6 py-2 rounded-lg font-bold text-black transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 6px 30px rgba(255, 215, 0, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                Get Quote
              </motion.a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-black p-2 cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                borderTop: '2px solid rgba(255, 215, 0, 0.3)'
              }}
            >
              <div className="px-4 py-6 space-y-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block text-gray-700 hover:text-black font-semibold py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <a
                  href="/contact"
                  className="block text-center px-6 py-3 rounded-lg font-bold text-black"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Quote
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer - Dark for contrast */}
      <footer
        className="py-16 px-4"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
          borderTop: '3px solid #FFD700'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)'
                  }}
                >
                  <span className="text-black font-black">MS</span>
                </div>
                <div>
                  <div className="font-black text-white">MATERIAL</div>
                  <div className="text-yellow-500 text-xs font-bold tracking-widest">SOLUTIONS NJ</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                New Jersey's premier forklift dealer. Sales, service, and parts for Raymond, Toyota, Crown, and more.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/#services" className="hover:text-yellow-400 transition-colors">OSHA Compliance</a></li>
                <li><a href="/#services" className="hover:text-yellow-400 transition-colors">Wire-guided Systems</a></li>
                <li><a href="/#services" className="hover:text-yellow-400 transition-colors">Racking Installation</a></li>
                <li><a href="/inventory" className="hover:text-yellow-400 transition-colors">Equipment Sales</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Inventory</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/inventory" className="hover:text-yellow-400 transition-colors">Electric Forklifts</a></li>
                <li><a href="/inventory" className="hover:text-yellow-400 transition-colors">IC Forklifts</a></li>
                <li><a href="/inventory" className="hover:text-yellow-400 transition-colors">Reach Trucks</a></li>
                <li><a href="/inventory" className="hover:text-yellow-400 transition-colors">Pallet Jacks</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>📍 New Jersey</li>
                <li>📞 (555) 123-4567</li>
                <li>✉️ info@materialsolutionsnj.com</li>
                <li>🕐 Mon-Fri 7AM-5PM</li>
              </ul>
            </div>
          </div>

          <div
            className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <p className="text-gray-500 text-sm">© 2025 Material Solutions NJ. All rights reserved.</p>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              David AI is online
            </div>
          </div>
        </div>
      </footer>

      {/* David Chat Widget */}
      <DavidChatWidget />
    </div>
  )
}
