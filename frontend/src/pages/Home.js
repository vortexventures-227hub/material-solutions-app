// Home.js — David-Centric Redesign
// David IS the brand. Everything else serves him.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ArrowRight, MessageSquare, X, Minimize2,
  Phone, Mail, MapPin, Clock, Truck, Shield, Zap, Wrench,
  Building2, HardHat, Send, Menu, CheckCircle2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
//  DAVID CORE — The Living, Breathing Avatar
// ═══════════════════════════════════════════════════════════
const DavidCore = ({ size = 380, className = '' }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setPhase(p => (p + 1) % 4), 4500);
    return () => clearInterval(interval);
  }, []);

  const phases = [
    { emoji: '👋', label: 'Wave', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', tagline: 'Ready to help!' },
    { emoji: '🤖', label: 'AI Active', color: '#22D3EE', bg: 'rgba(34,211,238,0.08)', tagline: 'Processing your needs...' },
    { emoji: '📦', label: 'Showing', color: '#10B981', bg: 'rgba(16,185,129,0.08)', tagline: 'Check this out!' },
    { emoji: '😊', label: 'Here to help', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', tagline: 'What else can I do?' },
  ];

  const current = phases[phase];

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${current.color}20 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rotating dashed orbit */}
      <motion.div
        className="absolute inset-3 rounded-full"
        style={{ border: `2px dashed ${current.color}25` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      {/* Counter-rotating inner ring */}
      <motion.div
        className="absolute inset-7 rounded-full"
        style={{ border: `1px solid ${current.color}18` }}
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />

      {/* Orbiting particles */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <motion.div
          key={angle}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: current.color,
            boxShadow: `0 0 8px ${current.color}`,
            top: '50%', left: '50%',
            marginTop: -6, marginLeft: -6,
          }}
          animate={{
            scale: [0.5, 1.5, 0.5],
            opacity: [0.3, 1, 0.3],
            x: [
              Math.cos((angle * Math.PI) / 180) * (size * 0.40),
              Math.cos(((angle + 30) * Math.PI) / 180) * (size * 0.40),
              Math.cos(((angle + 60) * Math.PI) / 180) * (size * 0.40),
            ],
            y: [
              Math.sin((angle * Math.PI) / 180) * (size * 0.40),
              Math.sin(((angle + 30) * Math.PI) / 180) * (size * 0.40),
              Math.sin(((angle + 60) * Math.PI) / 180) * (size * 0.40),
            ],
          }}
          transition={{ duration: 4.5, delay: i * 0.35, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Main avatar sphere */}
      <motion.div
        className="absolute inset-9 rounded-full overflow-hidden cursor-pointer"
        style={{
          background: `linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f3460 100%)`,
          border: `3px solid ${current.color}55`,
          boxShadow: `
            0 0 60px ${current.color}28,
            0 0 120px ${current.color}12,
            inset 0 0 40px rgba(0,0,0,0.7)
          `,
        }}
        animate={{ 
          borderColor: [current.color, `${current.color}85`, current.color],
          scale: [1, 1.025, 1],
        }}
        transition={{ duration: 4.5, repeat: Infinity }}
      >
        {/* Inner specular highlight */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle at 28% 28%, ${current.color}12 0%, transparent 55%)` }}
        />

        {/* Face */}
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Status badge */}
          <div 
            className="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
            style={{ 
              background: `${current.color}18`, 
              color: current.color,
              border: `1px solid ${current.color}35`,
              fontSize: '10px', letterSpacing: '0.05em'
            }}
          >
            {current.label}
          </div>

          {/* Emoji face — animated entry */}
          <motion.div
            key={phase}
            initial={{ scale: 0.4, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            className="text-[4.5rem] mt-2 filter drop-shadow-2xl"
          >
            {current.emoji}
          </motion.div>

          {/* Animated thinking/speaking dots */}
          <div className="flex gap-2 mt-3">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: current.color }}
                animate={{ 
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.25, 1, 0.25],
                  y: [0, -5, 0]
                }}
                transition={{ duration: 1.3, delay: i * 0.18, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Scan line effect */}
          <div className="absolute inset-0 overflow-hidden rounded-full" style={{ borderRadius: '100%' }}>
            <motion.div
              className="w-full h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${current.color}50, transparent)` }}
              animate={{ y: [0, size * 0.75, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
          </div>
        </div>
      </motion.div>

      {/* "Ask David" floating label */}
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-black px-5 py-1.5 rounded-full shadow-xl shadow-amber-500/30 whitespace-nowrap"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        ASK DAVID ANYTHING
      </motion.div>

      {/* Click pulse ring */}
      <motion.div
        className="absolute inset-9 rounded-full border-2"
        style={{ borderColor: `${current.color}35` }}
        animate={{ scale: [1, 1.07, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.8, repeat: Infinity }}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  PERSISTENT DAVID CHAT WIDGET
// ═══════════════════════════════════════════════════════════
const DavidChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'david', text: "Hey! I'm David 🤖 — 25 years in forklifts, zero sales pressure. What are you working with today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const quickReplies = [
    "What do you have in stock?",
    "I need a forklift for my warehouse",
    "What services do you offer?",
    "Tell me about pricing"
  ];

  const handleSend = useCallback(async (text) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { from: 'user', text }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));

    const responses = {
      "What do you have in stock?": "We've got electric forklifts, IC propane, reach trucks, order pickers, and pallet jacks. Electric is our biggest mover right now — everyone's converting to lithium. Want me to pull up what's available in your price range?",
      "I need a forklift for my warehouse": "Great — tell me about your warehouse. Concrete floor? Indoor/outdoor? Hours per day? That'll help me narrow down exactly the right fit. No guesswork.",
      "What services do you offer?": "Full gamut: new and used sales, OSHA compliance, electric fleet conversion, warehouse racking (design, supply, install), racking inspections, and consulting. We do the whole thing.",
      "Tell me about pricing": "Used electric forklifts: $15K–$35K depending on hours and age. New electric: $30K–$55K. For most operations I recommend starting with a well-maintained used unit — better value, same result.",
    };

    setLoading(false);
    setMessages(m => [...m, { 
      from: 'david', 
      text: responses[text] || "Good question — and honestly the answer depends on your specific operation. Give me a bit more detail and I'll point you exactly where you need to go. What's your biggest challenge right now?"
    }]);
  }, []);

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
          boxShadow: '0 8px 32px rgba(245,158,11,0.5), 0 0 60px rgba(245,158,11,0.2)',
        }}
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <MessageSquare size={26} className="text-white" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-400"
          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[390px] max-h-[530px] rounded-3xl flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)',
              border: '1px solid rgba(245,158,11,0.18)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.65), 0 0 50px rgba(245,158,11,0.06)',
            }}
            initial={{ opacity: 0, y: 24, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.12), rgba(234,88,12,0.06))', borderBottom: '1px solid rgba(245,158,11,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #EA580C)' }}>🤖</div>
                <div>
                  <p className="text-white font-bold text-sm">David</p>
                  <p className="text-amber-400 text-xs">Online · fast replies</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setOpen(false)} className="text-white/35 hover:text-white/70 transition-colors">
                  <Minimize2 size={15} />
                </button>
                <button onClick={() => setOpen(false)} className="text-white/35 hover:text-white/70 transition-colors">
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.from === 'david' && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #EA580C)' }}>🤖</div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.from === 'david' ? 'text-white/90' : 'text-white font-medium'
                  }`}
                    style={{
                      background: msg.from === 'david' 
                        ? 'rgba(255,255,255,0.04)' 
                        : 'linear-gradient(135deg, #F59E0B, #EA580C)',
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #EA580C)' }}>🤖</div>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400"
                        animate={{ opacity: [0.3,1,0.3], y: [0,-4,0] }}
                        transition={{ duration: 1.1, delay: i*0.12, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies (first exchange only) */}
            {messages.length <= 2 && (
              <div className="px-5 pb-2 flex flex-wrap gap-2">
                {quickReplies.map(qr => (
                  <button
                    key={qr}
                    onClick={() => handleSend(qr)}
                    className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1.5 hover:bg-amber-400/20 transition-colors"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-5 pb-4 pt-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                  placeholder="Ask David anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-400/40 transition-colors"
                />
                <motion.button
                  onClick={() => handleSend(input)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #EA580C)' }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.93 }}
                >
                  <Send size={15} className="text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ═══════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ${
          scrolled ? 'bg-black/92 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/50' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/30">
              M
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Material Solutions</p>
              <p className="text-white/35 text-xs">New Jersey · Est. 1999</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Inventory', 'Services', 'About', 'Contact'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="text-sm text-white/45 hover:text-amber-400 transition-colors duration-300 font-medium">
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <motion.a href="#contact"
              className="hidden md:block bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(245,158,11,0.45)' }}
              whileTap={{ scale: 0.97 }}
            >
              Talk to David
            </motion.a>
            <button className="md:hidden text-white" onClick={() => setMobileOpen(true)}>
              <Menu size={26} />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/98 backdrop-blur-3xl flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-end p-6">
              <button className="text-white" onClick={() => setMobileOpen(false)}><X size={28} /></button>
            </div>
            <div className="flex flex-col items-center gap-8 mt-16">
              {['Inventory', 'Services', 'About', 'Contact'].map((link, i) => (
                <motion.a key={link} href={`#${link.toLowerCase()}`}
                  className="text-4xl font-black text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ═══════════════════════════════════════════════════════════
//  HERO — David is EVERYTHING
// ═══════════════════════════════════════════════════════════
const Hero = () => {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 150]);
  const contentY = useTransform(scrollY, [0, 600], [0, -100]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20" id="hero">
      {/* Animated background layers */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.09) 0%, rgba(234,88,12,0.03) 40%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />
      </motion.div>

      {/* Hero content */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center w-full"
        style={{ y: contentY }}
      >
        {/* David dominates the hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3, rotateY: -45 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ delay: 0.2, duration: 1.4, type: 'spring', stiffness: 75, damping: 11 }}
          className="mb-6"
        >
          <DavidCore size={340} />
        </motion.div>

        {/* David greeting */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="max-w-2xl"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2 mb-8"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            <motion.span 
              className="w-2 h-2 rounded-full bg-amber-400"
              animate={{ scale: [1, 2.2, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
            <span className="text-amber-400 text-sm font-semibold">AI Avatar · 25 Years Experience · Real human expertise</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.02] tracking-tight mb-6">
            Your warehouse deserves
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              expert guidance.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/38 max-w-xl mx-auto mb-10 leading-relaxed">
            I'm David. I've sold 500+ forklifts across the Northeast. Tell me what you're working with — 
            I'll cut through the noise and point you exactly where you need to go.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-base px-10 py-4 rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-3"
              whileHover={{ scale: 1.04, boxShadow: '0 30px 60px -15px rgba(245,158,11,0.45)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start a Conversation <ArrowRight size={18} />
            </motion.button>
            <motion.button
              className="bg-white/5 border border-white/10 text-white font-semibold text-base px-10 py-4 rounded-2xl backdrop-blur-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Browse Inventory
            </motion.button>
          </div>

          <p className="text-white/22 text-sm mt-8">
            No account needed · Real answers in minutes · Straight talk, no sales pressure
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/18"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 2.8, repeat: Infinity }}
      >
        <span className="text-xs font-medium uppercase tracking-widest">Scroll to explore</span>
        <ChevronDown size={22} />
      </motion.div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════
//  SECTION + REVEAL
// ═══════════════════════════════════════════════════════════
const Section = ({ children, className = '', id }) => (
  <section id={id} className={`relative ${className}`}>
    {children}
  </section>
);

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ delay, duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
  >
    {children}
  </motion.div>
);

// ═══════════════════════════════════════════════════════════
//  SERVICES
// ═══════════════════════════════════════════════════════════
const Services = () => {
  const services = [
    { icon: <Truck size={28} />, title: 'New & Used Forklifts', desc: 'Electric, IC propane, reach trucks, order pickers. Top brands, tested and ready.', color: '#F59E0B', n: '01' },
    { icon: <Shield size={28} />, title: 'OSHA Compliance', desc: 'Safety inspections, certification, and documentation. Stay compliant, stay safe.', color: '#22D3EE', n: '02' },
    { icon: <Zap size={28} />, title: 'Electric Fleet Conversion', desc: 'Go zero-emission with lithium battery solutions and charging infrastructure.', color: '#10B981', n: '03' },
    { icon: <Building2 size={28} />, title: 'Warehouse Racking', desc: 'Selective, drive-in, push-back, cantilever. Design, supply, and install.', color: '#8B5CF6', n: '04' },
    { icon: <HardHat size={28} />, title: 'Racking Inspections', desc: 'Annual certified inspections. Find damage and hazard risk before it costs you.', color: '#F87171', n: '05' },
    { icon: <Wrench size={28} />, title: 'Warehouse Consulting', desc: 'Space planning, layout optimization, and material handling strategy.', color: '#A78BFA', n: '06' },
  ];

  return (
    <Section className="py-32 bg-black/25" id="services">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4 block">What David Offers</span>
            <h2 className="text-4xl md:text-6xl font-black text-white">
              Everything your warehouse needs.
              <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mt-3">
                One conversation away.
              </span>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, i) => (
            <Reveal key={svc.title} delay={i * 0.07}>
              <motion.div
                className="group relative bg-[#080d1a] border border-white/5 rounded-3xl p-8 overflow-hidden"
                whileHover={{ y: -6, borderColor: `${svc.color}38` }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${svc.color}10 0%, transparent 65%)` }} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: `${svc.color}15`, color: svc.color }}>
                      {svc.icon}
                    </div>
                    <span className="text-white/8 text-5xl font-black">{svc.n}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{svc.title}</h3>
                  <p className="text-white/38 text-sm leading-relaxed">{svc.desc}</p>
                  <button 
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="mt-6 flex items-center gap-2 text-sm font-semibold transition-colors"
                    style={{ color: svc.color }}
                  >
                    Ask David about this <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>

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
