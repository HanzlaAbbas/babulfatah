'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 0,
    bgImage: '/hero/hero-welcome.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1589803131753-4886b6dc18f3?q=100&w=2500&auto=format&fit=crop',
    title: 'The Universe\'s Verse',
    subtitle: 'Curating the profound heritage of Islamic literature.',
    cta: { label: 'Explore the Library', href: '/shop' },
  },
  {
    id: 1,
    bgImage: '/hero/hero-quran.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1608603611394-1a525f0c13e5?q=100&w=2500&auto=format&fit=crop',
    title: 'Divine Revelation',
    subtitle: 'Masterfully bound translations and Tafsir.',
    cta: { label: 'Discover Quran', href: '/shop?category=quran' },
  },
];

export function HeroCinematic() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative w-full h-[100svh] overflow-hidden flex items-center justify-center bg-[#0A1114]">
      {/* ── Background Engine ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={slide.bgImage || slide.fallbackImage}
            alt={slide.title}
            fill
            priority={current === 0}
            sizes="100vw"
            quality={100}
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = '';
              target.src = slide.fallbackImage;
            }}
          />
          {/* Subtle gradient vignette to ensure text contrast without muddying the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1114] via-transparent to-[#0A1114]/50 z-10" />
          <div className="absolute inset-0 bg-black/30 z-10 backdrop-blur-[1px]" />
        </motion.div>
      </AnimatePresence>

      {/* ── Foreground Content ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto flex flex-col items-center"
          >
            {/* Supreme Minimalism Typography */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] font-serif text-white leading-[1.05] tracking-tight mb-8 drop-shadow-2xl mix-blend-plus-lighter">
              {slide.title}
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-neutral-200/90 font-light tracking-wide mb-14 drop-shadow-lg max-w-3xl">
              {slide.subtitle}
            </p>

            <Link 
              href={slide.cta.href} 
              className="group relative inline-flex items-center justify-center px-12 py-5 text-sm uppercase tracking-[0.2em] font-medium text-white bg-white/10 backdrop-blur-md rounded-full overflow-hidden transition-all duration-500 hover:bg-white/20 border border-white/20 hover:border-white/40"
            >
              <span className="relative z-10 flex items-center gap-4">
                {slide.cta.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500 ease-out" />
              </span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Ultra-minimal Nav Indicators ── */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group relative flex items-center justify-center w-8 h-8"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className={`absolute h-[1px] transition-all duration-700 ease-out ${
              i === current ? 'w-8 bg-white' : 'w-4 bg-white/30 group-hover:bg-white/60'
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
}