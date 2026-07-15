"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, ArrowRight, ShieldCheck, Globe, Award, Star, Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const mockProducts = [
  {
    id: '1',
    name: 'Ar-Raheeq Al-Makhtum',
    category: 'The Seerah Collection',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1589803131753-4886b6dc18f3?q=80&w=800&auto=format&fit=crop',
    badge: '1st Prize MWL'
  },
  {
    id: '2',
    name: 'Riyad as-Salihin',
    category: 'Hadith Collection',
    price: 38.00,
    image: 'https://images.unsplash.com/photo-1608603611394-1a525f0c13e5?q=80&w=800&auto=format&fit=crop',
    badge: 'Best Seller'
  },
  {
    id: '3',
    name: 'Premium Leather Quran',
    category: 'Holy Quran',
    price: 120.00,
    image: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?q=80&w=800&auto=format&fit=crop',
    badge: 'Premium Edition'
  },
  {
    id: '4',
    name: 'Tafsir Ibn Kathir (Set)',
    category: 'Tafsir Collection',
    price: 185.00,
    image: 'https://images.unsplash.com/photo-1590076215667-873d9d51e390?q=80&w=800&auto=format&fit=crop',
    badge: 'Complete Set'
  }
];

export default function PremiumHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-[#1D333B] text-neutral-50 font-sans selection:bg-[#D4AF37] selection:text-[#1D333B] overflow-x-hidden">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-[#1D333B]/85 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-serif tracking-wide text-white">
                Babul<span className="text-[#D4AF37]">Fatah</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              <Link href="#shop" className="text-sm font-medium text-neutral-300 hover:text-[#D4AF37] transition-colors">Shop</Link>
              <Link href="#collections" className="text-sm font-medium text-neutral-300 hover:text-[#D4AF37] transition-colors">Collections</Link>
              <Link href="#seerah" className="text-sm font-medium text-neutral-300 hover:text-[#D4AF37] transition-colors">The Seerah</Link>
            </div>

            {/* Icons */}
            <div className="hidden md:flex items-center space-x-6">
              <button className="text-neutral-300 hover:text-[#D4AF37] transition-colors relative group">
                <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#1D333B] text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)]">2</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-neutral-300 hover:text-white transition-colors">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#1D333B] border-b border-white/10"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                <Link href="#shop" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-neutral-300 hover:text-[#D4AF37] transition-colors">Shop</Link>
                <Link href="#collections" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-neutral-300 hover:text-[#D4AF37] transition-colors">Collections</Link>
                <Link href="#seerah" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-neutral-300 hover:text-[#D4AF37] transition-colors">The Seerah</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center min-h-[90vh]">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-10 shadow-lg backdrop-blur-sm">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm font-medium tracking-wide text-neutral-200">Muslim World League 1st Prize Winner</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight mb-8">
              The Sealed Nectar. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FCEABB] to-[#D4AF37] bg-[length:200%_auto] animate-gradient">
                A Masterpiece.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-2xl text-neutral-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Immerse yourself in the most authoritative and elegantly translated biography of Prophet Muhammad ﷺ. An heirloom of faith, designed for the modern believer.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-[#1D333B] bg-gradient-to-r from-[#D4AF37] to-[#FCEABB] rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_#D4AF37] w-full sm:w-auto">
                <span className="relative z-10 flex items-center gap-3">
                  Experience the Seerah
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out"></div>
              </button>
              
              <button className="px-10 py-5 text-lg font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors w-full sm:w-auto">
                View Collection
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- AUTHORITY BANNER (MARQUEE) --- */}
      <div className="border-y border-white/5 bg-[#15262C] py-8 overflow-hidden relative flex items-center">
        {/* Fading Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#15262C] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#15262C] to-transparent z-10" />
        
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          className="flex whitespace-nowrap gap-16 md:gap-32 px-8"
        >
          {/* Double the content for seamless infinite loop */}
          {[...Array(2)].map((_, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-4">
                <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
                <span className="text-base font-semibold tracking-widest text-neutral-300 uppercase">Premium Craftsmanship</span>
              </div>
              <div className="flex items-center gap-4">
                <Globe className="w-7 h-7 text-[#D4AF37]" />
                <span className="text-base font-semibold tracking-widest text-neutral-300 uppercase">Global Islamic Heritage</span>
              </div>
              <div className="flex items-center gap-4">
                <Award className="w-7 h-7 text-[#D4AF37]" />
                <span className="text-base font-semibold tracking-widest text-neutral-300 uppercase">1st Prize MWL Winner</span>
              </div>
              <div className="flex items-center gap-4">
                <Star className="w-7 h-7 text-[#D4AF37]" />
                <span className="text-base font-semibold tracking-widest text-neutral-300 uppercase">5-Star Excellence</span>
              </div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* --- PROBLEM-SOLUTION MODULE --- */}
      <section className="py-32 lg:py-48 bg-[#1D333B] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-[1.1]">
                In a World of Noise, <br />
                <span className="text-[#D4AF37] italic">Find Your Anchor.</span>
              </h2>
              <div className="space-y-8 text-neutral-300 text-lg md:text-xl leading-relaxed font-light">
                <p>
                  The modern soul is constantly distracted, seeking peace in fleeting moments. True tranquility is found in reconnecting with our profound Islamic heritage.
                </p>
                <p>
                  At BabulFatah, we curate more than just books. We offer heirlooms of faith—meticulously crafted, aesthetically breathtaking editions of classical Islamic texts designed to elevate your spirit and beautify your surroundings.
                </p>
              </div>
              <div className="mt-12">
                <button className="text-[#D4AF37] font-semibold text-lg flex items-center gap-3 hover:gap-5 transition-all border-b-2 border-[#D4AF37]/30 hover:border-[#D4AF37] pb-2 group">
                  Read Our Story <ArrowRight className="w-5 h-5 group-hover:text-white transition-colors" />
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1D333B]/90 via-[#1D333B]/20 to-transparent z-10" />
              {/* Fallback to standard img tag for robust rendering without next.config modifications */}
              <img 
                src="https://images.unsplash.com/photo-1590076215667-873d9d51e390?q=80&w=1200&auto=format&fit=crop" 
                alt="Islamic Heritage Books" 
                className="object-cover w-full h-full transform hover:scale-110 transition-transform duration-1000 ease-out"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FEATURED COLLECTION (BENTO BOX) --- */}
      <section className="py-32 bg-[#15262C] relative" id="collections">
        {/* Top border glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Curated Masterpieces</h2>
              <p className="text-neutral-400 text-lg leading-relaxed">Elevate your Islamic library with our most sought-after editions, featuring premium binding, rich textures, and authentic scholarly verification.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-[#D4AF37] font-medium hover:text-white transition-colors pb-2 border-b border-transparent hover:border-white">
              View Full Catalog <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mockProducts.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="group relative bg-[#1D333B] rounded-3xl p-5 border border-white/5 hover:border-[#D4AF37]/40 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.2)] flex flex-col"
              >
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden mb-6 bg-[#0B1518]">
                  <div className="absolute top-4 left-4 z-20 bg-[#D4AF37] text-[#1D333B] text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                    {product.badge}
                  </div>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1D333B] via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 z-10" />
                  
                  {/* Quick Add Overlay */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20 px-4">
                    <button className="w-full bg-white text-[#1D333B] font-bold py-3 rounded-xl hover:bg-[#D4AF37] transition-colors shadow-lg">
                      Quick Add
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col flex-grow px-2">
                  <span className="text-xs text-[#D4AF37] uppercase tracking-widest mb-3 font-semibold">{product.category}</span>
                  <h3 className="text-xl font-serif font-bold text-white mb-3 leading-snug">{product.name}</h3>
                  <div className="flex items-center mb-6 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-medium text-white">${product.price.toFixed(2)}</span>
                    <button className="bg-white/5 border border-white/10 hover:bg-[#D4AF37] hover:border-[#D4AF37] text-white hover:text-[#1D333B] p-3 rounded-full transition-all duration-300">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
             <button className="inline-flex items-center gap-2 text-[#D4AF37] font-medium hover:text-white transition-colors">
              View Full Catalog <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0B1518] pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
        {/* Decorative Background Icon */}
        <div className="absolute -bottom-40 -right-40 text-white/5 pointer-events-none">
          <Globe className="w-96 h-96" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
            <div className="lg:col-span-4">
              <Link href="/" className="text-4xl font-serif tracking-wide text-white inline-block mb-8">
                Babul<span className="text-[#D4AF37]">Fatah</span>
              </Link>
              <p className="text-neutral-400 text-lg leading-relaxed mb-10 pr-4">
                Curating the finest Islamic literature and lifestyle heritage. Elevating the Muslim home with profound knowledge and unparalleled aesthetics.
              </p>
              <div className="flex space-x-5">
                <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#1D333B] text-neutral-400 transition-all duration-300 group">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#1D333B] text-neutral-400 transition-all duration-300 group">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
              </div>
            </div>
            
            <div className="lg:col-span-3 lg:col-start-6">
              <h4 className="text-white font-semibold mb-8 uppercase tracking-widest text-sm">Discover</h4>
              <ul className="space-y-5 text-neutral-400 font-medium">
                <li><Link href="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-[#D4AF37]"/> The Seerah Collection</Link></li>
                <li><Link href="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-[#D4AF37]"/> Holy Quran & Tafsir</Link></li>
                <li><Link href="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-[#D4AF37]"/> Hadith & Sunnah</Link></li>
                <li><Link href="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-[#D4AF37]"/> Premium Islamic Gifts</Link></li>
              </ul>
            </div>
            
            <div className="lg:col-span-4">
              <div className="bg-[#1D333B] p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-[#D4AF37]/30 transition-colors duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl rounded-full" />
                <h4 className="text-white font-serif text-2xl mb-4 relative z-10">The Inner Circle</h4>
                <p className="text-neutral-400 text-base leading-relaxed mb-8 relative z-10">Receive exclusive access to rare editions, early releases, and profound weekly reflections directly to your inbox.</p>
                <form className="flex flex-col sm:flex-row gap-3 relative z-10">
                  <div className="relative flex-grow">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="w-full bg-[#0B1518] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-[#D4AF37] text-[#1D333B] font-bold px-8 py-4 rounded-xl hover:bg-[#C5A028] transition-colors whitespace-nowrap shadow-lg">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-neutral-500 font-medium">
            <p>&copy; {new Date().getFullYear()} BabulFatah. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Shipping & Returns</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
