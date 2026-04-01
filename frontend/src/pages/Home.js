// frontend/src/pages/Home.js
// Premium dark redesign — Top 20 2025 website caliber
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, Phone, Mail, MapPin, Clock, Shield, Truck, Zap, 
  CheckCircle2, ArrowRight, MessageSquare, Menu, X,
  Wrench, Building2, HardHat
} from 'lucide-react';

// ─────────────────────────────────────────────
// ANIMATED DAVID AVATAR COMPONENT
// ─────────────────────────────────────────────
const DavidAvatar = ({ size = 280 }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setPhase(p => (p + 1) % 4), 3000);
    return () => clearInterval(interval);
  }, []);

  const expressions = ['👋', '🤝', '📦', '🏆'];
  const glowColors = ['#F59E0B', '#EA580C', '#22D3EE', '#F59E0B'];
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${glowColors[phase]}30 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Orbiting dots */}
      {[0, 120, 240].map((angle, i) => (
        <motion.div
          key={angle}
          className="absolute w-2 h-2 rounded-full bg-amber-400"
          style={{ 
            top: '50%', left: '50%',
            marginLeft: -4,
            marginTop: -4,
            transform: `rotate(${angle}deg) translateX(${size * 0.42}px)`
          }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
        />
      ))}
      
      {/* Main avatar circle */}
      <motion.div
        className="absolute inset-3 rounded-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: '3px solid rgba(245,158,11,0.6)',
          boxShadow: `0 0 40px ${glowColors[phase]}40, inset 0 0 30px rgba(0,0,0,0.5)`
        }}
        animate={{ borderColor: [glowColors[phase], glowColors[(phase+1)%4], glowColors[phase]] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-7xl mb-1 filter drop-shadow-lg"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {expressions[phase]}
          </motion.span>
          <div className="flex gap-1 mt-1">
            {[0,1,2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-400/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ borderStyle: 'dashed' }}
        />
      </motion.div>
      
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-amber-500/30">
        AI POWERED
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SCROLL REVEAL HOOK
// ─────────────────────────────────────────────
const useReveal = (threshold = 0.12) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return [ref, isInView];
};

// ─────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────
const Section = ({ children, className = '', id }) => {
  const [ref, isInView] = useReveal();
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={`relative ${className}`}
    >
      {children}
    </motion.section>
  );
};

// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Inventory', href: '#inventory' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-black/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/30">
              M
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Material Solutions</p>
              <p className="text-white/50 text-xs">New Jersey</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/60 hover:text-amber-400 transition-colors duration-300 font-medium"
              >
                {link.label}
              </a>
            ))}
            <a href="#contact">
              <motion.button
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(245,158,11,0.4)' }}
                whileTap={{ scale: 0.97 }}
              >
                Get a Quote
              </motion.button>
            </a>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-end p-6">
              <button className="text-white" onClick={() => setMobileOpen(false)}>
                <X size={28} />
              </button>
            </div>
            <div className="flex flex-col items-center gap-8 mt-16">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="text-3xl font-bold text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────
const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 200]);

  return (
    <Section className="min-h-screen relative flex items-center justify-center overflow-hidden pt-20" id="hero">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16"
        style={{ y }}
      >
        {/* Left: Text */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span 
              className="w-2 h-2 rounded-full bg-amber-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-amber-400 text-sm font-semibold">AI-Powered Forklift Sales</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Forklifts built for
            <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              your warehouse.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/45 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            From single-unit pickups to full warehouse turnkey — David delivers equipment that works, service that responds, and prices that make sense.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <a href="#inventory">
              <motion.button
                className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-base px-8 py-4 rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03, boxShadow: '0 25px 50px -12px rgba(245,158,11,0.4)' }}
                whileTap={{ scale: 0.97 }}
              >
                View Inventory <ArrowRight size={18} />
              </motion.button>
            </a>
            <a href="#contact">
              <motion.button
                className="w-full sm:w-auto bg-white/5 border border-white/10 text-white font-semibold text-base px-8 py-4 rounded-2xl backdrop-blur-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Talk to David <MessageSquare size={18} />
              </motion.button>
            </a>
          </motion.div>

          <motion.div
            className="flex items-center gap-6 mt-10 justify-center lg:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {[
              { icon: '🏆', text: '500+ Units Sold' },
              { icon: '⭐', text: '4.9 Star Rating' },
              { icon: '🛡️', text: 'OSHA Compliant' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-white/40 text-sm">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: David Avatar */}
        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.7, rotateY: -30 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ delay: 0.4, duration: 1, type: 'spring', stiffness: 100 }}
        >
          <DavidAvatar size={300} />
          <motion.p 
            className="text-center mt-4 text-amber-400 font-bold text-lg"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Hi, I'm David — your AI sales assistant
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
        <ChevronDown size={20} />
      </motion.div>
    </Section>
  );
};

// ─────────────────────────────────────────────
// STATS BAR
// ─────────────────────────────────────────────
const StatsBar = () => {
  const stats = [
    { value: '500+', label: 'Units Sold' },
    { value: '25+', label: 'Years Experience' },
    { value: '100%', label: 'Satisfaction' },
    { value: '48h', label: 'Avg Response' },
  ];

  return (
    <Section className="py-16 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-1">
                {stat.value}
              </p>
              <p className="text-white/40 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

// ─────────────────────────────────────────────
// SERVICES SECTION
// ─────────────────────────────────────────────
const Services = () => {
  const services = [
    {
      icon: <Truck size={30} />,
      title: 'New & Used Forklifts',
      desc: 'Complete inventory of electric and IC forklifts from top brands. Buy, trade, or liquidate.',
      color: '#F59E0B',
      badge: 'Core Service',
    },
    {
      icon: <Wrench size={30} />,
      title: 'OSHA Compliance',
      desc: 'Full safety inspections, certification, and compliance documentation for warehouse operations.',
      color: '#22D3EE',
      badge: 'Certified',
    },
    {
      icon: <Zap size={30} />,
      title: 'Electric Fleet Conversion',
      desc: 'Transition to zero-emission electric forklifts with battery solutions and charging infrastructure.',
      color: '#10B981',
      badge: 'Popular',
    },
    {
      icon: <Shield size={30} />,
      title: 'Warehouse Racking',
      desc: 'Industrial pallet racking, selective, drive-in, push-back, and cantilever systems. Layout and install.',
      color: '#8B5CF6',
      badge: 'Turnkey',
    },
    {
      icon: <HardHat size={30} />,
      title: 'Racking Inspections',
      desc: 'Annual pallet rack inspections by certified professionals. Identify damage, overloading, and hazards.',
      color: '#F87171',
      badge: 'Safety First',
    },
    {
      icon: <Building2 size={30} />,
      title: 'Warehouse Consulting',
      desc: 'Layout optimization, space planning, and material handling consulting for new and existing facilities.',
      color: '#A78BFA',
      badge: 'Expert',
    },
  ];

  return (
    <Section className="py-32 bg-black/40" id="services">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span 
            className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4 block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            What We Do
          </motion.span>
          <motion.h2
            className="text-4xl md:text-6xl font-black text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Built to handle every
            <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              warehouse challenge.
            </span>
          </motion.h2>
          <motion.p
            className="text-white/45 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            From a single forklift to a complete warehouse makeover — David has the equipment, expertise, and network.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              className="group relative bg-[#0D1117] border border-white/5 rounded-3xl p-8 overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -6, borderColor: `${service.color}40` }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ 
                  background: `radial-gradient(circle at 50% 0%, ${service.color}15 0%, transparent 60%)` 
                }}
              />
              
              <div className="relative">
                <span 
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-6"
                  style={{ 
                    background: `${service.color}20`, 
                    color: service.color,
                    border: `1px solid ${service.color}30`
                  }}
                >
                  {service.badge}
                </span>

                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `${service.color}15`, color: service.color }}
                >
                  {service.icon}
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm">{service.desc}</p>

                <motion.div
                  className="mt-6 flex items-center gap-2 text-white/25 group-hover:text-amber-400 transition-colors cursor-pointer"
                  initial={{ x: 0 }}
                  whileHover={{ x: 6 }}
                >
                  <span className="text-sm font-semibold">Learn more</span>
                  <ArrowRight size={14} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

// ─────────────────────────────────────────────
// INVENTORY SECTION
// ─────────────────────────────────────────────
const Inventory = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filters = ['All', 'Electric', 'IC / Propane', 'Reach Truck', 'Order Picker'];

  const inventory = [
    {
      id: 1,
      name: 'Raymond 7500 Reach Truck',
      year: '2019',
      hours: '4,200',
      type: 'Reach Truck',
      price: '$32,500',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
      tag: 'Popular',
    },
    {
      id: 2,
      name: 'Toyota Core IC Cushion',
      year: '2020',
      hours: '2,800',
      type: 'IC / Propane',
      price: '$28,000',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80',
      tag: null,
    },
    {
      id: 3,
      name: 'Raymond EASI OPC30TT',
      year: '2012',
      hours: '8,400',
      type: 'Order Picker',
      price: '$9,500',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
      tag: 'Best Value',
    },
    {
      id: 4,
      name: 'Hyster W40ZA Electric',
      year: '2018',
      hours: '3,100',
      type: 'Electric',
      price: '$24,000',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80',
      tag: null,
    },
    {
      id: 5,
      name: 'Crown PC 4500 Chassis',
      year: '2015',
      hours: '6,700',
      type: 'Electric',
      price: '$18,500',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
      tag: 'Low Hours',
    },
    {
      id: 6,
      name: 'Komatsu Electric 3-Wheel',
      year: '2017',
      hours: '5,200',
      type: 'Electric',
      price: '$21,000',
      status: 'Just In',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80',
      tag: 'New Arrival',
    },
  ];

  const filtered = activeFilter === 'All' 
    ? inventory 
    : inventory.filter(item => item.type === activeFilter);

  return (
    <Section className="py-32" id="inventory">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-3 block">Current Stock</span>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Featured Inventory
            </h2>
          </div>
          <a href="#contact" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors flex items-center gap-2">
            View all units <ArrowRight size={16} />
          </a>
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {filter}
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
                className="group bg-[#0D1117] border border-white/5 rounded-3xl overflow-hidden hover:border-amber-400/30 transition-all duration-500"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] to-transparent" />
                  
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
                    <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                    <span className="text-xs text-white/30">{item.year} · {item.hours} hrs</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </h3>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <p className="text-2xl font-black text-white">{item.price}</p>
                    <motion.button
                      className="text-sm font-semibold text-amber-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ x: 4 }}
                    >
                      Details <ArrowRight size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </Section>
  );
};

// ─────────────────────────────────────────────
// ABOUT DAVID SECTION
// ─────────────────────────────────────────────
const AboutDavid = () => {
  const values = [
    { icon: '🤝', title: 'Honest Deals', desc: 'No hidden fees, no bait-and-switch. What we quote is what you pay.' },
    { icon: '⚡', title: 'Fast Response', desc: 'Every inquiry answered within 48 hours. Usually much faster.' },
    { icon: '🎯', title: 'Right Fit', desc: 'We recommend what you actually need — not the unit we need to move.' },
    { icon: '🏆', title: '25+ Years', desc: 'Built relationships across the industry that translate to better deals for you.' },
  ];

  return (
    <Section className="py-32 bg-gradient-to-b from-black/40 to-transparent" id="about">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4 block">About David</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
              25 years of moving
              <span className="block text-white/40">things forward.</span>
            </h2>
            
            <div className="space-y-5 text-white/45 leading-relaxed">
              <p>
                David built Material Solutions on a simple idea: forklift dealers should actually care about their customers. No runaround, no inflated prices, no mystery fees. Just honest equipment, fair prices, and service that shows up when it says it will.
              </p>
              <p>
                Working from Hamilton, New Jersey, David has placed forklifts in warehouses across the Northeast — from family-owned distribution centers to major logistics operations.
              </p>
              <p>
                Whether you need one unit for a loading dock or fifty for a full warehouse conversion, the approach is the same: understand the operation, recommend what's right, and make the whole process as smooth as possible.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10">
              {values.map(v => (
                <div key={v.title} className="bg-[#0D1117] border border-white/5 rounded-2xl p-5">
                  <span className="text-2xl mb-2 block">{v.icon}</span>
                  <p className="text-white font-bold text-sm mb-1">{v.title}</p>
                  <p className="text-white/35 text-xs leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image + quote */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=700&q=80" 
                alt="Warehouse forklift"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Quote overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white/80 text-lg font-medium italic mb-3">
                  "A forklift isn't just a purchase — it's the backbone of your operation for the next decade."
                </p>
                <p className="text-amber-400 font-bold text-sm">— David, Material Solutions</p>
              </div>
            </div>

            {/* Floating badge */}
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
    </Section>
  );
};

// ─────────────────────────────────────────────
// CONTACT SECTION
// ─────────────────────────────────────────────
const Contact = () => {


  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Section className="py-32" id="contact">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <span className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4 block">Get in Touch</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Ready to talk
              <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">forklifts?</span>
            </h2>
            <p className="text-white/45 text-lg leading-relaxed mb-12">
              Fill out the form and David will personally respond — usually within a few hours, always within 48 hours.
            </p>
            <div className="space-y-6">
              {[{icon: <Phone size={18} />, label: 'Phone', value: '(609) 555-0147'}, {icon: <Mail size={18} />, label: 'Email', value: 'david@materialsolutionsnj.com'}, {icon: <MapPin size={18} />, label: 'Location', value: 'Hamilton, New Jersey'}, {icon: <Clock size={18} />, label: 'Response Time', value: 'Within 48 hours'}].map(({icon, label, value}) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0">{icon}</div>
                  <div>
                    <p className="text-white/30 text-xs font-medium uppercase tracking-wider">{label}</p>
                    <p className="text-white font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 bg-[#0D1117] border border-white/5 rounded-3xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-2xl flex-shrink-0">🤝</div>
                <div>
                  <p className="text-white/70 italic leading-relaxed mb-3">
                    "I personally read every inquiry. Whether you are looking at a 5,000 used pallet jack or a 60,000 electric fleet, you get the same attention."
                  </p>
                  <p className="text-amber-400 text-sm font-bold">— David</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#0D1117] border border-white/5 rounded-3xl p-8 md:p-10">
            {submitted ? (
              <motion.div className="text-center py-12" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                <p className="text-white/45 mb-6">David will get back to you within 48 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', company: '', email: '', phone: '', message: '' }); }} className="text-amber-400 text-sm font-medium hover:underline">Send another message</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Name *</label>
                    <input name="name" required value={form.name} onChange={handleChange} placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Company</label>
                    <input name="company" value={form.company} onChange={handleChange} placeholder="Company name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/50 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Email *</label>
                    <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@company.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Phone</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="(555) 000-0000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">What are you looking for? *</label>
                  <textarea name="message" required rows={4} value={form.message} onChange={handleChange} placeholder="Tell David what you need — unit type, budget, timeline..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/50 transition-colors resize-none" />
                </div>
                <motion.button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-base py-4 rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-70" whileHover={{ scale: 1.01, boxShadow: '0 25px 50px -12px rgba(245,158,11,0.4)' }} whileTap={{ scale: 0.99 }}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" />
                      Sending...
                    </span>
                  ) : (<>Send to David <ArrowRight size={18} /></>)}
                </motion.button>
                <p className="text-white/25 text-xs text-center">No spam. No pressure. Just a real conversation about your equipment needs.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

const Home = () => {
  return (
    <div className="bg-[#050810] min-h-screen overflow-x-hidden">
      <Navigation />
      <Hero />
      <StatsBar />
      <Services />
      <Inventory />
      <AboutDavid />
      <Contact />
      <footer className="border-t border-white/5 bg-black/60 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black text-sm">M</div>
              <div>
                <p className="text-white font-bold text-sm">Material Solutions</p>
                <p className="text-white/30 text-xs">Hamilton, NJ · Est. 1999</p>
              </div>
            </div>
            <p className="text-white/25 text-sm">© 2025 Material Solutions NJ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
