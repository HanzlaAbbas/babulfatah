'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';

const slides = [
  {
    id: 0,
    bgImage: '/hero/hero-welcome.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1589803131753-4886b6dc18f3?q=80&w=2000&auto=format&fit=crop',
    badge: 'Welcome to',
    title: 'BabulFatah',
    subtitle: "The Universe's Verse of Islamic Heritage",
    description: "Curating the finest Islamic literature and lifestyle heritage. Elevating the Muslim home with profound knowledge and unparalleled aesthetics.",
    cta: { label: 'Experience the Seerah', href: '/shop' },
  },
  {
    id: 1,
    bgImage: '/hero/hero-quran.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1608603611394-1a525f0c13e5?q=80&w=2000&auto=format&fit=crop',
    badge: 'Discover',
    title: 'Curated Masterpieces',
    subtitle: 'Premium Holy Quran & Tafsir Collections',
    description: 'Immerse yourself in authoritative, elegantly bound editions crafted for the modern believer.',
    cta: { label: 'Explore the Quran', href: '/shop?category=quran' },
  },
  {
    id: 2,
    bgImage: '/hero/hero-seerah.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1590076215667-873d9d51e390?q=80&w=2000&auto=format&fit=crop',
    badge: 'Learn',
    title: 'Prophetic Wisdom',
    subtitle: 'Authentic Hadith & Seerah Biographies',
    description: 'Connect with the greatest life ever lived through award-winning translations and profound scholarship.',
    cta: { label: 'Read Seerah', href: '/shop?category=seerah' },
  }
];

export function HeroCinematic() {
  const [current, setCurrent] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative w-full min-h-[90vh] md:min-h-[100svh] bg-[#1D333B] overflow-hidden flex items-center justify-center">
      {/* Background Slider with Parallax & Crossfade */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={slide.bgImage}
            alt={slide.title}
            fill
            priority={current === 0}
            sizes="100vw"
            className="object-cover"
            onError={(e) => {
              // Fallback to high-res unsplash if local image doesn't exist
              const target = e.target as HTMLImageElement;
              target.srcset = '';
              target.src = slide.fallbackImage;
            }}
          />
          {/* Luxury Gradient Overlay for maximum text contrast and depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1D333B]/40 via-[#1D333B]/60 to-[#1D333B] z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center justify-center bg-white/5 border border-white/10 rounded-full px-6 py-2.5 mb-8 backdrop-blur-md shadow-lg">
              <span className="text-xs font-semibold tracking-[0.2em] text-neutral-200 uppercase">
                {slide.badge}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[1.1] mb-6 tracking-tight">
              {slide.title}
            </h1>
            
            {/* Subtitle */}
            <h2 className="text-xl md:text-3xl font-serif text-[#D4AF37] mb-8 italic tracking-wide">
              {slide.subtitle}
            </h2>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-neutral-300 max-w-2xl font-light leading-relaxed mb-12">
              {slide.description}
            </p>

            {/* CTA Button */}
            <Link 
              href={slide.cta.href} 
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-[#1D333B] bg-[#D4AF37] rounded-full overflow-hidden transition-all duration-400 ease-out hover:scale-[1.02] shadow-[0_0_40px_-10px_#D4AF37]"
            >
              <span className="relative z-10 flex items-center gap-3">
                {slide.cta.label}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-400 ease-out" />
              </span>
              <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-400 ease-out" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Interactive Search Bar */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-4">
        <form action="/search" method="get" className="w-full">
          <div className="bg-[#1D333B]/80 backdrop-blur-xl rounded-full flex items-center px-6 py-4 border border-white/10 focus-within:border-[#D4AF37]/50 transition-colors duration-400 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <Search className="h-6 w-6 text-neutral-400 shrink-0 mr-4" />
            <input
              type="text"
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search our premium Islamic collection..."
              className="flex-1 bg-transparent text-white placeholder:text-neutral-500 text-lg outline-none min-h-[44px] font-medium"
            />
            <button 
              type="submit"
              className="shrink-0 bg-transparent hover:text-[#D4AF37] text-white font-semibold text-base px-4 py-2 rounded-xl transition-colors duration-300"
            >
              Discover
            </button>
          </div>
        </form>
      </div>

      {/* Slider Nav Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-400 ease-out ${
              i === current ? 'w-10 bg-[#D4AF37]' : 'w-3 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}