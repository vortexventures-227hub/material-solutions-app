import Head from 'next/head'
import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import DavidAvatar from '../components/DavidAvatar'
import ContactForm from '../components/ContactForm'

const FAQS = [
  {
    q: 'Do you offer financing?',
    a: 'Yes! We offer 0% financing options up to 60 months. David can help you get pre-approved in minutes.'
  },
  {
    q: 'What brands do you carry?',
    a: 'Raymond, Toyota, Crown, Hyster, Yale, and more. We service all major brands.'
  },
  {
    q: 'Is delivery available?',
    a: 'Absolutely. Same-day and next-day delivery available throughout New Jersey and surrounding states.'
  },
  {
    q: 'Do you buy used forklifts?',
    a: 'Yes! We offer fair market value trade-ins. Upload photos and get a quote from David instantly.'
  },
  {
    q: 'What about warranty?',
    a: 'All equipment comes with a minimum 30-day warranty. Extended warranties available.'
  },
  {
    q: 'Do you offer OSHA training?',
    a: 'Yes, we provide OSHA-compliant operator training both on-site and at our facility.'
  }
]

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      <Head>
        <title>Contact Us | Material Solutions NJ</title>
        <meta name="description" content="Get in touch with Material Solutions NJ. Chat with David AI or send us a message." />
      </Head>

      <div className="pt-24" style={{ background: '#FFFFFF' }}>
        {/* Contact Form Section */}
        <ContactForm />

        {/* FAQ Section */}
        <section className="py-24 px-4 relative overflow-hidden" style={{ background: '#F8F8F8' }} ref={ref}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255, 215, 0, 0.05), transparent)'
            }}
          />

          <div className="max-w-3xl mx-auto relative">
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
                FAQ
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
                Common <span style={{ color: '#B8860B' }}>Questions</span>
              </h2>
              <p className="text-gray-600">
                Quick answers to help you make the right decision.
              </p>
            </motion.div>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="font-semibold text-black pr-4">{faq.q}</span>
                    <span
                      className="text-yellow-600 text-xl flex-shrink-0 transition-transform"
                      style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                      +
                    </span>
                  </button>

                  {openFaq === i && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* David CTA */}
            <motion.div
              className="mt-12 p-6 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <DavidAvatar size="medium" />
                <div className="text-left">
                  <div className="font-bold text-yellow-500">David AI</div>
                  <div className="text-sm text-gray-400">Your personal forklift expert</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Still have questions? David is standing by to help you find exactly what you need.
              </p>
              <p className="text-gray-500 text-sm">
                Look for the chat widget in the bottom right corner →
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
