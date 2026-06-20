'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  Truck,
  ShieldCheck,
  BookOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ═══════════════════════════════════════════════════════════════════════════════
   HERO SLIDER v4 — "The Scholar's Gateway"
   ═══════════════════════════════════════════════════════════════════════════════
   Competitor-crushing hero with:
     1. PARALLAX background (mouse-follow subtle shift on desktop)
     2. CINEMATIC gradient overlays (multi-layer)
     3. SEARCH BAR front-and-center (fastest path to conversion)
     4. TRUST SIGNALS visible at first glance (COD, Free Delivery, Book Count)
     5. ISLAMIC WARMTH — Bismillah greeting (emotional connection)
     6. QUICK SEARCH SUGGESTIONS — one-tap category discovery
     7. ANIMATED COUNTERS — "1,200+" counts up on load (engagement)
     8. SMOOTH STAGGERED TRANSITIONS — premium, professional feel
     9. TOUCH SWIPE + keyboard navigation
    10. PROGRESS BAR with colored segments
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─── Types ────────────────────────────────────────────────────────────────────

interface Slide {
  id: string;
  bgImage: string;
  badge?: string;
  badgeIcon?: 'book' | 'sparkle' | 'star' | 'play';
  subtitle: string;
  title: string;
  titleHighlight: string;
  description: string;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  accent: 'golden' | 'emerald' | 'warm';
  isWelcome?: boolean;
  stats?: { value: string; label: string }[];
}

// ─── Config ──────────────────────────────────────────────────────────────────

const accentColors = {
  golden: { primary: '#C9A84C', light: '#D4B85E', glow: 'rgba(201,168,76,0.15)', dark: '#A88B3A' },
  emerald: { primary: '#10B981', light: '#34D399', glow: 'rgba(16,185,129,0.15)', dark: '#059669' },
  warm: { primary: '#F59E0B', light: '#FBBF24', glow: 'rgba(245,158,11,0.15)', dark: '#D97706' },
};

const SEARCH_SUGGESTIONS = [
  'Quran with Urdu Translation',
  'Sahih Bukhari',
  'Ar-Raheequl-Makhtum',
  'Kids Islamic Books',
  'Tafseer Ibn Kathir',
];

const slides: Slide[] = [
  {
    id: 'welcome',
    bgImage: '/hero/hero-welcome.jpg',
    badge: "Pakistan's #1 Islamic Store",
    badgeIcon: 'star',
    subtitle: '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645',
    title: 'Your Gateway to',
    titleHighlight: 'Authentic Islamic Knowledge',
    description:
      'Explore our curated collection of 1,200+ authentic Islamic books in Urdu, Arabic & English. Trusted by scholars and families across Pakistan.',
    cta: { label: 'Shop Collection', href: '/shop' },
    secondaryCta: { label: 'Browse Categories', href: '/shop' },
    accent: 'golden',
    isWelcome: true,
    stats: [
      { value: '1,270+', label: 'Authentic Books' },
      { value: '15,000+', label: 'Happy Customers' },
      { value: '100%', label: 'Authentic Content' },
    ],
  },
  {
    id: 'kids-collection',
    bgImage: '/hero/hero-kids.jpg',
    badge: 'Goodword Books Collection',
    badgeIcon: 'sparkle',
    subtitle: 'Nurture Young Minds',
    title: 'Teach Your Children the',
    titleHighlight: 'Beauty of Islam',
    description:
      "Engaging kids\u2019 books, prayer mats, and educational resources designed to nurture love for Allah and His Messenger \uFDFA.",
    cta: { label: 'Shop Kids Collection', href: '/shop?category=children' },
    secondaryCta: { label: 'View All Goodword', href: '/shop?category=goodword-books' },
    accent: 'warm',
  },
  {
    id: 'quran-collection',
    bgImage: '/hero/hero-quran.jpg',
    badge: 'Premium Collection',
    badgeIcon: 'book',
    subtitle: 'Word by Word Understanding',
    title: 'Study The Noble',
    titleHighlight: "Qur\u2019an",
    description:
      "Premium quality Holy Qurans with translations in Urdu and English. From Hafzi to Ahsan-ul-Hawashi \u2014 find your perfect copy.",
    cta: { label: "Browse Qur\u2019an Collection", href: '/shop?category=quran' },
    secondaryCta: { label: 'View Tafseer', href: '/shop?category=tafseer' },
    accent: 'emerald',
  },
  {
    id: 'seerah-collection',
    bgImage: '/hero/hero-seerah.jpg',
    badge: 'Best Sellers',
    badgeIcon: 'star',
    subtitle: 'Life of the Prophet \uFDFA',
    title: 'Discover the',
    titleHighlight: "Prophet\u2019s Seerah",
    description:
      "Immerse yourself in the beautiful life story of Prophet Muhammad \uFDFA. From Ar-Raheequl-Makhtum to detailed biographies.",
    cta: { label: 'Explore Seerah', href: '/shop?category=prophets-seerah' },
    secondaryCta: { label: 'View All Books', href: '/shop' },
    accent: 'golden',
  },
];

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const didAnimate = useRef(false);

  useEffect(() => {
    if (didAnimate.current) return;
    didAnimate.current = true;

    const duration = 2000;
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target]);

  return <>{value.toLocaleString()}{suffix}</>;
}

// ─── Staggered Entrance ─────────────────────────────────────────────────────

function StaggeredChild({
  children, index, isActive, className = '',
}: {
  children: React.ReactNode;
  index: number;
  isActive: boolean;
  className?: string;
}) {
  return (
    <div className={className} style={{
      opacity: isActive ? 1 : 0,
      transform: isActive ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 0.08 + 0.12}s, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 0.08 + 0.12}s`,
    }}>
      {children}
    </div>
  );
}

// ─── Hero Search Bar ─────────────────────────────────────────────────────────

function HeroSearchBar({ isActive }: { isActive: boolean }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fillSuggestion = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  if (!isActive) return null;

  return (
    <StaggeredChild index={4} isActive={isActive}>
      <div className="w-full max-w-xl">
        <form action="/shop" method="GET" className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#1D333B]/30 pointer-events-none z-10" />
          <input
            ref={inputRef}
            type="text"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search Quran, Hadith, Tafseer, Seerah..."
            autoComplete="off"
            className="w-full h-11 sm:h-[52px] pl-11 pr-20 sm:pr-4 rounded-xl bg-white text-[#1D333B] placeholder:text-[#1D333B]/30 text-sm font-medium shadow-[0_4px_24px_rgba(0,0,0,0.18)] focus:outline-none focus:shadow-[0_6px_32px_rgba(201,168,76,0.18),0_4px_24px_rgba(0,0,0,0.18)] focus:ring-2 focus:ring-[#C9A84C]/50 transition-all duration-300"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3.5 rounded-lg bg-[#1D333B] text-white text-xs font-semibold hover:bg-[#1D333B]/80 transition-colors hidden sm:flex items-center gap-1.5 active:scale-95"
          >
            Search
            <ArrowRight className="w-3 h-3" />
          </button>
        </form>

        {/* Quick search suggestions */}
        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: focused ? '60px' : '0px',
            opacity: focused ? 1 : 0,
            marginTop: focused ? '10px' : '0px',
          }}
        >
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <span className="text-[10px] uppercase tracking-widest text-white/25 font-semibold shrink-0">
              Quick:
            </span>
            {SEARCH_SUGGESTIONS.map((term) => (
              <button
                key={term}
                type="button"
                onMouseDown={() => fillSuggestion(term)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white/[0.07] border border-white/[0.09] text-white/50 hover:bg-white/[0.14] hover:text-white/85 hover:border-white/[0.16] transition-all duration-200 active:scale-95"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StaggeredChild>
  );
}

// ─── Trust Signal Badges ─────────────────────────────────────────────────────

function TrustSignals({ isActive }: { isActive: boolean }) {
  const badges = [
    { icon: Truck, label: 'Cash on Delivery', sub: 'All Over Pakistan' },
    { icon: ShieldCheck, label: 'Free Delivery', sub: 'Orders Above Rs. 2,000' },
    {
      icon: BookOpen,
      label: <AnimatedCounter target={1270} suffix="+" />,
      sub: 'Authentic Books',
    },
  ];

  return (
    <StaggeredChild index={6} isActive={isActive} className="pt-0.5 sm:pt-1">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {badges.map((badge) => (
          <div
            key={typeof badge.label === 'string' ? badge.label : 'counter'}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.07] backdrop-blur-sm"
          >
            <badge.icon className="w-4 h-4 text-[#C9A84C] shrink-0" />
            <div className="leading-tight">
              <span className="text-[11px] sm:text-xs font-semibold text-white/90 block">
                {badge.label}
              </span>
              <span className="text-[9px] sm:text-[10px] text-white/35 hidden sm:block">
                {badge.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </StaggeredChild>
  );
}

// ─── Stats Strip (Welcome Slide) ─────────────────────────────────────────────

function StatsStrip({ stats, isActive, accent }: { stats: { value: string; label: string }[]; isActive: boolean; accent: 'golden' | 'emerald' | 'warm' }) {
  const colors = accentColors[accent];

  return (
    <StaggeredChild index={5} isActive={isActive} className="pt-1">
      <div className="flex justify-center gap-6 sm:gap-10">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div
              className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight"
              style={{ color: colors.primary }}
            >
              {stat.value}
            </div>
            <div className="text-[10px] sm:text-xs text-white/40 font-medium mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </StaggeredChild>
  );
}

// ─── Slide Content ───────────────────────────────────────────────────────────

function SlideContent({
  slide,
  isActive,
  direction,
}: {
  slide: Slide;
  isActive: boolean;
  direction: number;
}) {
  const colors = accentColors[slide.accent];

  return (
    <div
      className="absolute inset-0 flex items-center"
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive
          ? 'translateX(0)'
          : direction > 0 ? 'translateX(50px)' : 'translateX(-50px)',
        transition:
          'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
        zIndex: isActive ? 10 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <div className="w-full h-full flex items-center" style={{ padding: '14px' }}>
        {slide.isWelcome ? (
          /* ═══ WELCOME SLIDE — centered, search-first layout ═══ */
          <div className="w-full max-w-2xl mx-auto text-center space-y-2.5 sm:space-y-4 pb-8 sm:pb-12">
            {/* Bismillah */}
            <StaggeredChild index={0} isActive={isActive}>
              <p className="text-white/25 text-sm sm:text-base font-serif tracking-wide leading-relaxed">
                {slide.subtitle}
              </p>
            </StaggeredChild>

            {/* Badge */}
            <StaggeredChild index={1} isActive={isActive}>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider backdrop-blur-md border"
                style={{
                  color: colors.light,
                  backgroundColor: `${colors.primary}12`,
                  borderColor: `${colors.primary}25`,
                }}
              >
                <Star className="w-3 h-3" />
                {slide.badge}
              </div>
            </StaggeredChild>

            {/* Title */}
            <StaggeredChild index={2} isActive={isActive}>
              <div className="space-y-0">
                <h1 className="text-[1.6rem] sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white font-serif tracking-tight leading-[1.12]">
                  {slide.title}
                </h1>
                <h1
                  className="text-[1.6rem] sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif tracking-tight leading-[1.12]"
                  style={{ color: colors.primary }}
                >
                  {slide.titleHighlight}
                </h1>
              </div>
            </StaggeredChild>

            {/* Description */}
            <StaggeredChild index={3} isActive={isActive}>
              <p className="text-white/45 text-xs sm:text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                {slide.description}
              </p>
            </StaggeredChild>

            {/* Search Bar */}
            <HeroSearchBar isActive={isActive} />

            {/* Stats Strip */}
            {slide.stats && <StatsStrip stats={slide.stats} isActive={isActive} accent={slide.accent} />}

            {/* Trust Badges */}
            <TrustSignals isActive={isActive} />

            {/* CTA Buttons */}
            <StaggeredChild index={7} isActive={isActive} className="pt-1">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <Button
                  size="lg"
                  className="group font-semibold px-7 h-10 sm:h-11 text-[13px] sm:text-sm rounded-xl transition-all duration-300 hover:scale-[1.04] active:scale-[0.96] w-full sm:w-auto"
                  style={{
                    backgroundColor: colors.primary,
                    color: '#142229',
                    boxShadow: `0 8px 24px ${colors.glow}, 0 2px 8px ${colors.glow}`,
                  }}
                  asChild
                >
                  <Link href={slide.cta.href}>
                    <span className="flex items-center justify-center gap-2">
                      {slide.cta.label}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Button>
                {slide.secondaryCta && (
                  <Button
                    size="lg"
                    className="font-medium px-7 h-10 sm:h-11 text-[13px] sm:text-sm rounded-xl backdrop-blur-sm bg-transparent border border-white/15 text-white/70 hover:bg-white/[0.06] hover:border-white/25 hover:text-white transition-all duration-300 w-full sm:w-auto"
                    asChild
                  >
                    <Link href={slide.secondaryCta.href}>
                      {slide.secondaryCta.label}
                    </Link>
                  </Button>
                )}
              </div>
            </StaggeredChild>
          </div>
        ) : (
          /* ═══ PRODUCT SLIDES — full-width cinematic text layout ═══ */
          <div className="w-full max-w-7xl mx-auto">
            <div className="max-w-xl sm:max-w-2xl lg:max-w-3xl space-y-2 sm:space-y-3 pb-8 sm:pb-14">
              {/* Badge */}
              <StaggeredChild index={0} isActive={isActive}>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider backdrop-blur-md border"
                  style={{
                    color: colors.light,
                    backgroundColor: `${colors.primary}12`,
                    borderColor: `${colors.primary}25`,
                  }}
                >
                  {slide.badgeIcon === 'book' && <BookOpen className="w-3 h-3" />}
                  {slide.badgeIcon === 'sparkle' && <Sparkles className="w-3 h-3" />}
                  {slide.badgeIcon === 'star' && <Star className="w-3 h-3" />}
                  {slide.badgeIcon === 'play' && <Play className="w-3 h-3" />}
                  {slide.badge}
                </div>
              </StaggeredChild>

              {/* Subtitle */}
              <StaggeredChild index={1} isActive={isActive}>
                <p className="text-white/40 text-xs sm:text-sm font-medium tracking-wider uppercase">
                  {slide.subtitle}
                </p>
              </StaggeredChild>

              {/* Title */}
              <StaggeredChild index={2} isActive={isActive}>
                <div className="space-y-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white font-serif tracking-tight leading-[1.08]">
                    {slide.title}
                  </h1>
                  <h1
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-serif tracking-tight leading-[1.08]"
                    style={{ color: colors.primary }}
                  >
                    {slide.titleHighlight}
                  </h1>
                </div>
              </StaggeredChild>

              {/* Description */}
              <StaggeredChild index={3} isActive={isActive}>
                <p className="text-white/50 sm:text-white/55 text-xs sm:text-sm md:text-base max-w-lg leading-relaxed">
                  {slide.description}
                </p>
              </StaggeredChild>

              {/* CTAs */}
              <StaggeredChild index={4} isActive={isActive} className="pt-1 sm:pt-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <Button
                    size="lg"
                    className="group font-semibold px-5 sm:px-6 h-10 sm:h-11 text-[13px] sm:text-sm rounded-xl transition-all duration-300 hover:scale-[1.04] active:scale-[0.96] w-full sm:w-auto"
                    style={{
                      backgroundColor: colors.primary,
                      color: '#142229',
                      boxShadow: `0 8px 24px ${colors.glow}, 0 2px 8px ${colors.glow}`,
                    }}
                    asChild
                  >
                    <Link href={slide.cta.href}>
                      <span className="flex items-center gap-2">
                        {slide.cta.label}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Button>
                  {slide.secondaryCta && (
                    <Button
                      size="lg"
                      className="font-medium px-5 sm:px-6 h-10 sm:h-11 text-[13px] sm:text-sm rounded-xl backdrop-blur-sm bg-transparent border border-white/15 text-white/70 hover:bg-white/[0.06] hover:border-white/25 hover:text-white transition-all duration-300 w-full sm:w-auto"
                      asChild
                    >
                      <Link href={slide.secondaryCta.href}>
                        {slide.secondaryCta.label}
                      </Link>
                    </Button>
                  )}
                </div>
              </StaggeredChild>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Islamic Pattern Overlay ─────────────────────────────────────────────────

function IslamicOverlay({ accent }: { accent: 'golden' | 'emerald' | 'warm' }) {
  const color = accentColors[accent].primary;
  return (
    <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
      {/* Geometric pattern — top-right corner */}
      <svg className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.04]" viewBox="0 0 500 500" fill="none">
        <defs>
          <pattern id="hero-geo-1" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 0L60 30L30 60L0 30Z" stroke={color} strokeWidth="0.8" fill="none" />
            <circle cx="30" cy="30" r="8" stroke={color} strokeWidth="0.5" fill="none" />
            <path d="M30 10L50 30L30 50L10 30Z" stroke={color} strokeWidth="0.3" fill="none" />
          </pattern>
        </defs>
        <rect width="500" height="500" fill="url(#hero-geo-1)" />
      </svg>

      {/* Geometric pattern — bottom-left corner */}
      <svg className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.03]" viewBox="0 0 400 400" fill="none">
        <defs>
          <pattern id="hero-geo-2" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="12" stroke={color} strokeWidth="0.5" fill="none" />
            <path d="M25 13L37 25L25 37L13 25Z" stroke={color} strokeWidth="0.3" fill="none" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#hero-geo-2)" />
      </svg>

      {/* Arch decoration — centered top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[180px] h-[100px] opacity-[0.03]"
        style={{
          border: `2px solid ${color}`,
          borderBottom: 'none',
          borderRadius: '100px 100px 0 0',
        }}
      />
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function HeroProgress({ currentIndex, slideId }: { currentIndex: number; slideId: string }) {
  const [progress, setProgress] = useState(0);
  const color = accentColors[slides[currentIndex].accent].primary;
  const duration = slideId === 'welcome' ? 8000 : 6000;

  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress(Math.min((elapsed / duration) * 100, 100));
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentIndex, slideId, duration]);

  return (
    <div className="flex items-center gap-2">
      {slides.map((_, i) => (
        <button
          key={i}
          aria-label={`Go to slide ${i + 1}`}
          className="relative flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden cursor-pointer group"
          onClick={(e) => {
            const parent = (e.currentTarget.closest('[data-slider]') as HTMLElement);
            if (parent) {
              parent.dispatchEvent(new CustomEvent('slideTo', { detail: i, bubbles: true }));
            }
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width:
                i === currentIndex
                  ? `${progress}%`
                  : i < currentIndex
                    ? '100%'
                    : '0%',
              backgroundColor:
                i === currentIndex ? color : 'rgba(255,255,255,0.3)',
              transition: i === currentIndex ? 'none' : 'all 0.5s ease',
            }}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Main Hero Slider ────────────────────────────────────────────────────────

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  const currentSlide = slides[currentIndex];

  const goToSlide = useCallback(
    (index: number, dir?: number) => {
      if (index === currentIndex) return;
      setDirection(dir ?? (index > currentIndex ? 1 : -1));
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  const goNext = useCallback(
    () => goToSlide((currentIndex + 1) % slides.length, 1),
    [currentIndex, goToSlide],
  );

  const goPrev = useCallback(
    () =>
      goToSlide(
        currentIndex === 0 ? slides.length - 1 : currentIndex - 1,
        -1,
      ),
    [currentIndex, goToSlide],
  );

  // Auto-advance
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const ms = currentSlide.isWelcome ? 8000 : 6000;
    timerRef.current = setInterval(goNext, ms);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, goNext, currentSlide.isWelcome]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  // Parallax mouse tracking (desktop only)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Touch swipe
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  // Handle custom slideTo event from progress dots
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === 'number') {
        goToSlide(detail);
      }
    };
    const el = containerRef.current;
    if (el) {
      el.addEventListener('slideTo', handler);
      return () => el.removeEventListener('slideTo', handler);
    }
  }, [goToSlide]);

  const parallaxStyle = {
    transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -5}px) scale(1.05)`,
    transition: 'transform 0.3s ease-out',
  };

  return (
    <section
      ref={containerRef}
      data-slider
      className="relative bg-brand-dark select-none overflow-hidden"
      style={{ minWidth: 0 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Background Images ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
            style={{ opacity: slide.id === currentSlide.id ? 1 : 0 }}
          >
            <div style={slide.id === currentSlide.id ? parallaxStyle : { transform: 'scale(1.05)' }}>
              <Image
                src={slide.bgImage}
                alt=""
                fill
                className="object-cover"
                priority={slide.id === 'welcome'}
                sizes="100vw"
                quality={80}
              />
            </div>
          </div>
        ))}

        {/* Multi-layer gradient overlays */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: currentSlide.isWelcome
              ? `linear-gradient(105deg,
                  rgba(20,34,41,0.97) 0%,
                  rgba(20,34,41,0.88) 20%,
                  rgba(20,34,41,0.65) 40%,
                  rgba(20,34,41,0.35) 65%,
                  rgba(20,34,41,0.18) 100%
                )`
              : `linear-gradient(105deg,
                  rgba(20,34,41,0.95) 0%,
                  rgba(20,34,41,0.82) 25%,
                  rgba(20,34,41,0.55) 50%,
                  rgba(20,34,41,0.25) 75%,
                  rgba(20,34,41,0.10) 100%
                )`,
            transition: 'background 1s ease',
          }}
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(to top, rgba(20,34,41,0.65) 0%, transparent 35%, rgba(20,34,41,0.25) 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, transparent 30%, rgba(20,34,41,0.25) 100%)',
          }}
        />
      </div>

      {/* ── Islamic Pattern Overlay ── */}
      <IslamicOverlay accent={currentSlide.accent} />

      {/* ── Slide Content Container ── */}
      <div className="relative z-20">
        <div style={{ height: 'clamp(380px, 72vh, 720px)' }}>
          {slides.map((slide) => (
            <SlideContent
              key={slide.id}
              slide={slide}
              isActive={slide.id === currentSlide.id}
              direction={direction}
            />
          ))}
        </div>
      </div>

      {/* ── Navigation Arrows ── */}
      <button
        onClick={goPrev}
        className="absolute left-2 sm:left-4 md:left-6 top-[42%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.1] border border-white/[0.06] hover:border-white/[0.14] opacity-0 hover:opacity-100 focus:opacity-100 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-2 sm:right-4 md:right-6 top-[42%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.1] border border-white/[0.06] hover:border-white/[0.14] opacity-0 hover:opacity-100 focus:opacity-100 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* ── Bottom Navigation Bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        {/* Golden accent separator line */}
        <div
          className="h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent 5%, ${accentColors[currentSlide.accent].primary}25 30%, ${accentColors[currentSlide.accent].primary}45 50%, ${accentColors[currentSlide.accent].primary}25 70%, transparent 95%)`,
            transition: 'background 0.7s ease',
          }}
        />

        <div style={{ padding: '10px 14px' }}>
          <div className="flex items-center gap-3 sm:gap-5 max-w-7xl mx-auto">
            {/* Slide counter */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span
                className="text-lg font-bold tabular-nums"
                style={{ color: accentColors[currentSlide.accent].primary, transition: 'color 0.7s ease' }}
              >
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <div className="w-5 h-px bg-white/12" />
              <span className="text-white/25 text-xs font-medium tabular-nums">
                {String(slides.length).padStart(2, '0')}
              </span>
            </div>

            {/* Progress dots */}
            <div className="flex-1">
              <HeroProgress
                currentIndex={currentIndex}
                slideId={currentSlide.id}
              />
            </div>

            {/* Current slide label */}
            <div className="hidden md:block text-white/20 text-xs font-medium max-w-[160px] truncate">
              {currentSlide.titleHighlight}
            </div>

            {/* WhatsApp quick action (mobile) */}
            <a
              href="https://wa.me/+923265903300"
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 hover:bg-white/[0.12] hover:text-white transition-all duration-200 shrink-0"
              aria-label="Order on WhatsApp"
            >
              <Phone className="w-3 h-3" />
              <span className="text-[10px] font-medium">Order on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}