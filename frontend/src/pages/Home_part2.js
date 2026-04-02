// HOME.JS — Part 2: Inventory, About, Contact, Footer + Export
// Continues from Home.js Part 1
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Phone, Mail, MapPin, Clock, CheckCircle2,
  Truck, Shield, Zap, Wrench, Building2, HardHat, Send, Loader
} from 'lucide-react';
import DavidCore from './DavidCore';

// ═══════════════════════════════════════════════════════════
//  INVENTORY
// ═══════════════════════════════════════════════════════════
const Inventory = () => {
  const [active, setActive] = useState('All');
  const filters = ['All', 'Electric', 'IC / Propane', 'Reach Truck', 'Order Picker'];

  const items = [
    { id: 1, name: 'Raymond 7500 Reach Truck', year: '2019', hours: '4,200', type: 'Reach Truck', price: '$32,500', status: 'Available', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', tag: 'Popular' },
    { id: 2, name: 'Toyota Core IC Cushion', year: '2020', hours: '2,800', type: 'IC / Propane', price: '$28,000', status: 'Available', img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80', tag: null },
    { id: 3, name: 'Raymond EASI OPC30TT', year: '2012', hours: '8,400', type: 'Order Picker', price: '$9,500', status: 'Available', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', tag: 'Best Value' },
    { id: 4, name: 'Hyster W40ZA Electric', year: '2018', hours: '3,100', type: 'Electric', price: '$24,000', status: 'Available', img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80', tag: null },
    { id: 5, name: 'Crown PC 4500 Chassis', year: '2015', hours: '6,700', type: 'Electric', price: '$18,500', status: 'Available', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', tag: 'Low Hours' },
    { id: 6, name: 'Komatsu Electric 3-Wheel', year: '2017', hours: '5,200', type: 'Electric', price: '$21,000', status: 'Just In', img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80', tag: 'New Arrival' },
  ];

  const filtered = active === 'All' ? items : items.filter(i => i.type === active);

  return (
    <section className="relative py-32" id="inventory">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-3 block">Current Stock</span>
            <h2 className="text-4xl md:text-5xl font-black text-white">Featured Inventory</h2>
          </div>
          <a href="#contact" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors flex items-center gap-2">
            See all units <ArrowRight size={16} />
          </a>
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          {filters.map(f => (
            <button key={f} onClick={() => setActive(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                active === f
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                  : 'bg-white/5 text-white/45 hover:text-white hover:bg-white/10 border border-white/5'
              }`}>
              {f}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-[#080d1a] border border-white/5 rounded-3xl overflow-hidden hover:border-amber-400/28 transition-all duration-500"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] to-transparent" />
                  {item.tag && (
                    <span className="absolute top-4 left-4 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                      {item.tag}
                    </span>
                  )}
                  <span className="absolute top-4 right-4 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {item.status}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">{item.type}</span>
                    <span className="text-xs text-white/25">{item.year} · {item.hours} hrs</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-1">{item.name}</h3>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <p className="text-2xl font-black text-white">{item.price}</p>
                    <motion.button
                      className="text-sm font-semibold text-amber-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ x: 4 }}
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Ask David <ArrowRight size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════
//  ABOUT DAVID
// ═══════════════════════════════════════════════════════════
const AboutDavid = () => {
  const values = [
    { icon: '🤝', title: 'Honest Deals', desc: 'No hidden fees. What we quote is what you pay.' },
    { icon: '⚡', title: 'Fast Response', desc: 'Every inquiry answered within 48 hours.' },
    { icon: '🎯', title: 'Right Fit', desc: "We recommend what you need — not what we need to move." },
    { icon: '🏆', title: '25+ Years', desc: 'Industry relationships that translate to better deals.' },
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-black/20 to-transparent" id="about">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4 block">About David</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
              25 years of moving
              <span className="block text-white/35">things forward.</span>
            </h2>
            <div className="space-y-5 text-white/42 leading-relaxed">
              <p>David built Material Solutions on a simple idea: forklift dealers should actually care about their customers. No runaround, no inflated prices, no mystery fees.</p>
              <p>Working from Hamilton, New Jersey, David has placed forklifts in warehouses across the Northeast — from family-owned distribution centers to major logistics operations.</p>
              <p>Whether you need one unit or fifty, the approach is the same: understand the operation, recommend what's right, make the whole process smooth.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-10">
              {values.map(v => (
                <div key={v.title} className="bg-[#080d1a] border border-white/5 rounded-2xl p-5">
                  <span className="text-2xl mb-2 block">{v.icon}</span>
                  <p className="text-white font-bold text-sm mb-1">{v.title}</p>
                  <p className="text-white/30 text-xs leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=700&q=80" alt="Warehouse" className="w-full h-80 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white/80 text-lg font-medium italic mb-3">
                  "A forklift isn't just a purchase — it's the backbone of your operation for the next decade."
                </p>
                <p className="text-amber-400 font-bold text-sm">— David, Material Solutions</p>
              </div>
            </div>
            <motion.div
              className="absolute -top-6 -right-6 bg-gradient-to-br from-amber-400 to-orange-500 text-black font-black text-sm px-5 py-3 rounded-2xl shadow-2xl shadow-amber-500/30"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Est. 1999
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════
//  CONTACT
// ═══════════════════════════════════════════════════════════
const Contact = () => {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setSubmitted(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <section className="relative py-32" id="contact">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left */}
          <div>
            <span className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4 block">Get in Touch</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Ready to talk
              <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">forklifts?</span>
            </h2>
            <p className="text-white/42 text-lg leading-relaxed mb-12">
              Fill out the form and David will personally respond — usually within a few hours, always within 48 hours.
            </p>
            <div className="space-y-5">
              {[
                { icon: <Phone size={18} />, label: 'Phone', value: '(609) 555-0147' },
                { icon: <Mail size={18} />, label: 'Email', value: 'david@materialsolutionsnj.com' },
                { icon: <MapPin size={18} />, label: 'Location', value: 'Hamilton, New Jersey' },
                { icon: <Clock size={18} />, label: 'Response Time', value: 'Within 48 hours' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-white/25 text-xs font-medium uppercase tracking-wider">{label}</p>
                    <p className="text-white font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* David's personal card */}
            <div className="mt-10 bg-[#080d1a] border border-white/5 rounded-3xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #EA580C)' }}>🤖</div>
                <div>
                  <p className="text-white/70 italic leading-relaxed mb-3">
                    "I personally read every inquiry. Whether you're looking at a $5,000 used pallet jack or a $60,000 electric fleet — same attention, same honesty."
                  </p>
                  <p className="text-amber-400 text-sm font-bold">— David</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-[#080d1a] border border-white/5 rounded-3xl p-8 md:p-10">
            {submitted ? (
              <motion.div className="text-center py-12" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                <p className="text-white/42 mb-6">David will get back to you within 48 hours.</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', company: '', email: '', phone: '', message: '' }); }}
                  className="text-amber-400 text-sm font-medium hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-xs font-medium uppercase tracking-wider block mb-2">Name *</label>
                    <input name="name" required value={form.name} onChange={handleChange} placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/18 text-sm focus:outline-none focus:border-amber-400/45 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs font-medium uppercase tracking-wider block mb-2">Company</label>
                    <input name="company" value={form.company} onChange={handleChange} placeholder="Company name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/18 text-sm focus:outline-none focus:border-amber-400/45 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-xs font-medium uppercase tracking-wider block mb-2">Email *</label>
                    <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/18 text-sm focus:outline-none focus:border-amber-400/45 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs font-medium uppercase tracking-wider block mb-2">Phone</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="(555) 000-0000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/18 text-sm focus:outline-none focus:border-amber-400/45 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-medium uppercase tracking-wider block mb-2">What are you looking for? *</label>
                  <textarea name="message" required rows={4} value={form.message} onChange={handleChange}
                    placeholder="Tell David what you need — unit type, budget, timeline..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/18 text-sm focus:outline-none focus:border-amber-400/45 transition-colors resize-none" />
                </div>
                <motion.button
                  type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-base py-4 rounded-2xl shadow-2xl shadow-amber-500/28 flex items-center justify-center gap-2 disabled:opacity-65"
                  whileHover={{ scale: 1.01, boxShadow: '0 25px 50px -12px rgba(245,158,11,0.4)' }}
                  whileTap={{ scale: 0.99 }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" />
                      Sending...
                    </span>
                  ) : (<>Send to David <Send size={16} /></>)}
                </motion.button>
                <p className="text-white/20 text-xs text-center">No spam. No pressure. Just a real conversation.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════
//  FOOTER
// ═══════════════════════════════════════════════════════════
const Footer = () => (
  <footer className="border-t border-white/5 bg-black/60 py-12">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black text-sm">
            M
          </div>
          <div>
            <p className="text-white font-bold text-sm">Material Solutions</p>
            <p className="text-white/25 text-xs">Hamilton, NJ · Est. 1999</p>
          </div>
        </div>
        <p className="text-white/22 text-sm">
          © 2025 Material Solutions NJ. All rights reserved. Forklift sales, service, and consulting.
        </p>
      </div>
    </div>
  </footer>
);

// ═══════════════════════════════════════════════════════════
//  HOME — Assembles all sections
// ═══════════════════════════════════════════════════════════
const Home = () => {
  return (
    <div className="bg-[#050810] min-h-screen overflow-x-hidden">
      <Navigation />
      <Hero />
      <Services />
      <Inventory />
      <AboutDavid />
      <Contact />
      <Footer />
      <DavidChatWidget />
    </div>
  );
};

export default Home;
