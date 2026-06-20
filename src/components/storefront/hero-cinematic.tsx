'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Truck, Banknote, MessageCircle, MapPin, Phone } from 'lucide-react';

// ─── Slide Data ──────────────────────────────────────────────────────────────

const slides = [
  {
    id: 0,
    bgImage: '/hero/hero-welcome.jpg',
    badge: 'Welcome to',
    title: 'Bab-ul-Fatah',
    subtitle: "Pakistan's Largest Online Islamic Bookstore",
    description: 'Authentic Islamic books delivered to your doorstep',
    cta: { label: 'Browse Collection', href: '/shop' },
  },
  {
    id: 1,
    bgImage: '/hero/hero-kids.jpg',
    badge: 'Discover',
    title: "Children's Collection",
    subtitle: 'Beautiful Islamic books for young learners',
    description: 'Nurture faith with engaging stories and illustrations',
    cta: { label: 'Shop Kids Books', href: '/shop?category=childrens-collection' },
  },
  {
    id: 2,
    bgImage: '/hero/hero-quran.jpg',
    badge: 'Read',
    title: 'Quran & Hadith',
    subtitle: 'Authentic translations and explanations',
    description: 'Multiple languages — Urdu, Arabic, English',
    cta: { label: 'Explore Quran', href: '/shop?category=quran' },
  },
  {
    id: 3,
    bgImage: '/hero/hero-seerah.jpg',
    badge: 'Learn',
    title: 'Seerah & Biography',
    subtitle: 'Stories of the Prophet ﷺ and great scholars',
    description: 'Comprehensive biographies for every reader',
    cta: { label: 'Read Seerah', href: '/shop?category=seerah' },
  },
];

const quickCategories = [
  { label: 'Quran', slug: 'quran' },
  { label: 'Hadith', slug: 'hadith' },
  { label: 'Seerah', slug: 'seerah' },
  { label: 'Children', slug: 'childrens-collection' },
  { label: 'Tafseer', slug: 'tafseer' },
];

const trustBadges = [
  { icon: Truck, label: 'Free Delivery' },
  { icon: Banknote, label: 'Cash on Delivery' },
  { icon: MessageCircle, label: 'WhatsApp Order' },
  { icon: MapPin, label: 'All Over Pakistan' },
];

// ─── Animated Counter Hook ────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const start = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return count;
}

// ─── 8-Pointed Star SVG ──────────────────────────────────────────────────────

function GeometricPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pattern-rotate-slow pointer-events-none"
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="heroGeoPattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          {/* 8-pointed star */}
          <polygon
            points="100,20 115,75 175,75 125,110 140,165 100,135 60,165 75,110 25,75 85,75"
            fill="none"
            stroke="rgba(212,175,55,0.12)"
            strokeWidth="0.5"
          />
          {/* Inner circle */}
          <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.5" />
          {/* Outer diamond */}
          <polygon
            points="100,10 190,100 100,190 10,100"
            fill="none"
            stroke="rgba(212,175,55,0.06)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#heroGeoPattern)" />
    </svg>
  );
}

// ─── Hero Component ──────────────────────────────────────────────────────────

export function HeroCinematic() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const touchStartX = useRef(0);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressStartRef = useRef<number>(0);

  const bookCount = useAnimatedCounter(1300, 2500);
  const customerCount = useAnimatedCounter(15000, 2500);
  const authCount = useAnimatedCounter(100, 1500);

  const goToSlide = useCallback((index: number) => {
    setIsTransitioning((prev) => {
      if (prev) return true;
      setCurrentSlide((prevSlide) => {
        if (index === prevSlide) return prevSlide;
        setTimeout(() => setIsTransitioning(false), 1800);
        return index;
      });
      return true;
    });
  }, []);

  // ── Auto-advance timer ──
  useEffect(() => {
    progressStartRef.current = Date.now();
    autoAdvanceRef.current = setTimeout(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slides.length;
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 1800);
        return next;
      });
    }, 8000);
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, [currentSlide]);

  // ── Keyboard navigation ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
      }
      if (e.key === 'ArrowRight') {
        goToSlide((currentSlide + 1) % slides.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, goToSlide]);

  // ── Touch swipe ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide((currentSlide + 1) % slides.length);
      else goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }
  }, [currentSlide, goToSlide]);

  const activeSlide = slides[currentSlide];
  const progressElapsed = Date.now() - progressStartRef.current;
  const progressPercent = Math.min((progressElapsed / 8000) * 100, 100);

  return (
    <section
      className="relative min-h-[85svh] md:min-h-[100svh] w-full overflow-hidden bg-[#1D333B]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Hero slideshow"
    >
      {/* ── Background Images (crossfading) ── */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 hero-bg-crossfade ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={i !== currentSlide}
        >
          <Image
            src={slide.bgImage}
            alt=""
            fill
            priority={i === 0}
            className={`object-cover ${i === currentSlide ? 'animate-ken-burns' : ''}`}
            sizes="100vw"
          />
        </div>
      ))}

      {/* ── Multi-layer Gradient Overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1D333B]/80 via-[#1D333B]/40 to-[#1D333B]/90 z-[1]" />

      {/* ── Geometric Pattern Overlay ── */}
      <div className="absolute inset-0 z-[2] opacity-[0.04]">
        <GeometricPattern />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85svh] md:min-h-[100svh] px-4 md:px-6">
        <div className="w-full max-w-2xl mx-auto text-center">
          {/* Bismillah */}
          <p className="font-serif text-white/60 text-lg md:text-2xl tracking-widest mb-4 md:mb-6 animate-slide-up-blur">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          {/* Badge */}
          <div className="animate-slide-up-blur" style={{ animationDelay: '0.1s' }}>
            <span className="inline-block text-[11px] md:text-xs font-medium text-[#D4AF37] tracking-widest uppercase mb-3">
              {activeSlide.badge}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 md:mb-4 animate-slide-up-blur" style={{ animationDelay: '0.2s' }}>
            {currentSlide === 0 ? (
              <>
                <span className="text-white">Bab-ul-</span>
                <span className="gold-shimmer-text">Fatah</span>
              </>
            ) : (
              <span className="text-white">{activeSlide.title}</span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-sm md:text-lg mb-5 md:mb-6 animate-slide-up-blur" style={{ animationDelay: '0.3s' }}>
            {currentSlide === 0 ? activeSlide.subtitle : activeSlide.subtitle}
          </p>

          {/* Search Bar */}
          <div className="animate-slide-up-blur" style={{ animationDelay: '0.4s' }}>
            <div className="relative w-full max-w-2xl mx-auto mb-4">
              <form action="/search" method="get" className="w-full">
                <div className="glass rounded-2xl flex items-center px-4 py-3 border border-white/20 focus-within:border-[#D4AF37]/50 transition-colors duration-300">
                  <Search className="h-5 w-5 text-white/50 shrink-0 mr-3" aria-hidden="true" />
                  <input
                    type="text"
                    name="q"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 1,300+ Islamic books..."
                    className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm md:text-base outline-none min-h-[44px]"
                    aria-label="Search Islamic books"
                  />
                  <Link
                    href={searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : '/search'}
                    className="shrink-0 bg-[#D4AF37] hover:bg-[#D4B85E] text-[#1D333B] font-semibold text-xs md:text-sm px-4 py-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors duration-200"
                    aria-label="Search"
                  >
                    Search
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Category Pills */}
          <div className="animate-slide-up-blur" style={{ animationDelay: '0.5s' }}>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 md:mb-8">
              {quickCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="rounded-full px-4 py-2 text-xs md:text-sm text-white/80 border border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 min-h-[44px] flex items-center justify-center"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Animated Counters */}
          <div className="animate-slide-up-blur" style={{ animationDelay: '0.6s' }}>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6 md:mb-8">
              <div className="text-center">
                <p className="font-serif text-2xl md:text-3xl font-bold text-[#D4AF37]">
                  {bookCount.toLocaleString()}+
                </p>
                <p className="text-white/60 text-[10px] md:text-xs mt-0.5">Islamic Books</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-2xl md:text-3xl font-bold text-[#D4AF37]">
                  {customerCount.toLocaleString()}+
                </p>
                <p className="text-white/60 text-[10px] md:text-xs mt-0.5">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-2xl md:text-3xl font-bold text-[#D4AF37]">
                  {authCount}%
                </p>
                <p className="text-white/60 text-[10px] md:text-xs mt-0.5">Authentic Products</p>
              </div>
            </div>
          </div>

          {/* Trust Badges Row */}
          <div className="animate-slide-up-blur" style={{ animationDelay: '0.7s' }}>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mb-4">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-1.5 text-white/70"
                >
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <badge.icon className="h-3 w-3 text-white/70" />
                  </div>
                  <span className="text-[11px] hidden sm:inline">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── WhatsApp Button (mobile only) ── */}
      <Link
        href="https://wa.me/923265903300"
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed bottom-20 right-4 z-30 bg-[#25D366] hover:bg-[#1EBE57] text-white font-semibold text-xs px-4 py-3 rounded-full min-h-[44px] min-w-[44px] flex items-center gap-2 shadow-lg transition-colors duration-200 wa-pulse"
        aria-label="Order via WhatsApp"
      >
        <Phone className="h-4 w-4" />
        <span>Order via WhatsApp</span>
      </Link>

      {/* ── Navigation Dots ── */}
      <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center ${
              i === currentSlide ? 'bg-[#D4AF37] w-6' : 'bg-white/30'
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === currentSlide ? 'true' : undefined}
          >
            <span className="sr-only">{`Slide ${i + 1}`}</span>
          </button>
        ))}
      </div>

      {/* ── Progress Bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-white/10">
        <div
          className="h-full bg-[#D4AF37] transition-none"
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}