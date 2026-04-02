import Head from 'next/head'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import Services from '../components/Services'
import InventoryGrid from '../components/InventoryGrid'
import ContactForm from '../components/ContactForm'

export default function Home() {
  return (
    <>
      <Head>
        <title>Material Solutions NJ | Electric Forklifts & Warehouse Solutions</title>
        <meta name="description" content="New Jersey premier forklift dealer. Electric narrow aisle forklifts, warranties, financing, lease-to-own, $1 buyouts. OSHA certified. Powered by David AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Hero />

      {/* Stats bar - Yellow on dark */}
      <motion.section
        className="py-8 px-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #0a0a0a, #1a1a1a, #0a0a0a)',
          borderTop: '3px solid #FFD700',
          borderBottom: '3px solid #FFD700'
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { icon: '🏭', value: '50+', label: 'Units in Stock' },
            { icon: '🏆', value: '20+', label: 'Years Experience' },
            { icon: '✅', value: '100%', label: 'OSHA Certified' },
            { icon: '⚡', value: '24/7', label: 'Emergency Service' },
            { icon: '💰', value: '0%', label: 'Financing Available' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <div className="font-black text-yellow-500 text-lg">{stat.value}</div>
                <div className="text-gray-400 text-sm font-semibold">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <Services />
      <InventoryGrid />

      {/* Why Us Section - Dark background with yellow accents */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255, 215, 0, 0.08), transparent)'
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span
              className="px-4 py-1 rounded-full text-sm font-bold tracking-wider mb-4 inline-block"
              style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                color: '#FFD700'
              }}
            >
              WHY US
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              The Material Solutions
              <br />
              <span style={{ color: '#FFD700' }}>Difference</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                title: 'Certified Quality',
                description: 'Every unit undergoes 50-point inspection. Full warranty and certification included.',
                color: '#FFD700'
              },
              {
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Fast Delivery',
                description: 'Same-day delivery available. Most units ready to go within 48 hours of purchase.',
                color: '#FFD700'
              },
              {
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                title: 'Expert Support',
                description: "David AI plus real human support. We're with you before, during, and after the sale.",
                color: '#FFD700'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-8 rounded-2xl"
                style={{
                  background: 'linear-gradient(145deg, rgba(255, 215, 0, 0.05), transparent)',
                  border: '1px solid rgba(255, 215, 0, 0.15)'
                }}
              >
                <div
                  className="w-16 h-16 rounded-xl mx-auto mb-6 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1))',
                    color: '#FFD700'
                  }}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ContactForm />
    </>
  )
}
