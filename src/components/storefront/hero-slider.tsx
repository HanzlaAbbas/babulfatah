'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Slide Data --------------------------------------------------------------

interface Slide {
  id: string;
  bgImage: string;
  productImage?: string;
  badge?: string;
  badgeIcon?: 'book' | 'sparkle' | 'star';
  subtitle: string;
  title: string;
  titleHighlight: string;
  description: string;
  features?: string[];
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  layout: 'left' | 'right';
  accent: 'golden' | 'emerald' | 'warm';
}

const slides: Slide[] = [
  {
    id: 'main-store',
    bgImage: '/hero/hero-main-store.jpg',
    badge: "Pakistan's #1 Islamic Store",
    badgeIcon: 'star',
    subtitle: 'Assalamu Alaikum',
    title: 'Your Gateway to',
    titleHighlight: 'Authentic Islamic Knowledge',
    description:
      'Curated collection of Quran, Hadith, Tafseer, Seerah, and spiritual works in Urdu, Arabic & English. Trusted by scholars and seekers worldwide.',
    features: ['1,200+ Authentic Books', 'Cash on Delivery', 'Worldwide Shipping'],
    cta: { label: 'Explore Collection', href: '/shop' },
    secondaryCta: { label: 'Browse Categories', href: '/shop' },
    layout: 'left',
    accent: 'golden',
  },
  {
    id: 'kids-collection',
    bgImage: '/hero/hero-kids-books.jpg',
    productImage: 'https://babussalam.pk/assets/images/thumbnails/9ZTZeKeOhY.jpg',
    badge: 'Goodword Books Collection',
    badgeIcon: 'sparkle',
    subtitle: 'Nurture Young Minds',
    title: 'Teach Your Children the',
    titleHighlight: 'Beauty of Islam',
    description:
      "Engaging kids' books, prayer mats, and educational resources designed to nurture love for Allah and His Messenger.",
    features: ['50+ Kids Titles', 'Age-Appropriate', 'Colorful & Interactive'],
    cta: { label: 'Shop Kids Collection', href: '/shop?category=children' },
    secondaryCta: { label: 'View All Goodword', href: '/shop?category=goodword-books' },
    layout: 'right',
    accent: 'warm',
  },
  {
    id: 'quran-collection',
    bgImage: '/hero/hero-quran-study.jpg',
    badge: 'Premium Quality',
    badgeIcon: 'book',
    subtitle: 'Word by Word Understanding',
    title: 'Study The Noble',
    titleHighlight: "Qur'an",
    description:
      "Premium quality Holy Qurans with translations in Urdu and English. From Hafzi to Ahsan-ul-Hawashi - find your perfect copy.",
    features: ['Multiple Translations', 'Premium Binding', 'All Sizes Available'],
    cta: { label: "Browse Qur'an Collection", href: '/shop?category=quran' },
    secondaryCta: { label: 'View Tafseer', href: '/shop?category=tafseer' },
    layout: 'left',
    accent: 'emerald',
  },
  {
    id: 'seerah-collection',
    bgImage: '/hero/hero-premium-collection.jpg',
    badge: 'Best Sellers',
    badgeIcon: 'star',
    subtitle: 'Life of the Prophet',
    title: 'Discover the',
    titleHighlight: "Prophet's Seerah",
    description:
      "Immerse yourself in the beautiful life story of Prophet Muhammad. From Ar-Raheequl-Makhtum to detailed biographies.",
    features: ['Ar-Raheequl-Makhtum', 'Sahabah Stories', 'Prophetic Biography'],
    cta: { label: 'Explore Seerah', href: '/shop?category=prophets-seerah' },
    secondaryCta: { label: 'View All Books', href: '/shop' },
    layout: 'right',
    accent: 'golden',
  },
];

// --- Accent Color Config -----------------------------------------------------

const accentColors = {
  golden: {
    primary: '#C9A84C',
    light: '#D4B85E',
    glow: 'rgba(201, 168, 76, 0.15)',
  },
  emerald: {
    primary: '#10B981',
    light: '#34D399',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  warm: {
    primary: '#F59E0B',
    light: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
};

// --- Progress Bar -------------------------------------------------------------

function HeroProgress({ currentIndex }: { currentIndex: number }) {
  const [progress, setProgress] = useState(0);
  const currentAccent = slides[currentIndex].accent;
  const color = accentColors[currentAccent].primary;

  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();
    const duration = 6000;
    let rafId: number;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / duration) * 100, 100));
      if (elapsed < duration) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [currentIndex]);

  return (
    <div className="flex items-center gap-2">
      {slides.map((_, i) => (
        <button
          key={i}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => {}}
          className="relative flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden cursor-pointer group"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%',
              backgroundColor: i === currentIndex ? color : 'rgba(255,255,255,0.3)',
              transition: i === currentIndex ? 'none' : 'all 0.5s ease',
            }}
          />
        </button>
      ))}
    </div>
  );
}

// --- Staggered Child ---------------------------------------------------------

function StaggeredChild({
  children,
  index,
  isActive,
  className = '',
}: {
  children: React.ReactNode;
  index: number;
  isActive: boolean;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateY(0) translateX(0)' : 'translateY(20px)',
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1 + 0.15}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1 + 0.15}s`,
      }}
    >
      {children}
    </div>
  );
}

// --- Slide Content -----------------------------------------------------------

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
  const isRight = slide.layout === 'right';

  return (
    <div
      className="absolute inset-0 flex items-center"
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateX(0)' : direction > 0 ? 'translateX(40px)' : 'translateX(-40px)',
        transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: isActive ? 10 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 w-full">
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-7xl mx-auto ${isRight ? '[direction:rtl]' : ''}`}>
          {/* -- Text Content -- */}
          <div className={`lg:col-span-7 space-y-4 md:space-y-6 py-10 md:py-16 lg:py-20 ${isRight ? '[direction:ltr]' : ''}`}>
            {/* Badge */}
            <StaggeredChild index={0} isActive={isActive}>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md border"
                style={{
                  color: colors.light,
                  backgroundColor: `${colors.primary}15`,
                  borderColor: `${colors.primary}30`,
                }}
              >
                {slide.badgeIcon === 'book' && <BookOpen className="w-3.5 h-3.5" />}
                {slide.badgeIcon === 'sparkle' && <Sparkles className="w-3.5 h-3.5" />}
                {slide.badgeIcon === 'star' && <Star className="w-3.5 h-3.5" />}
                {slide.badge}
              </div>
            </StaggeredChild>

            {/* Subtitle */}
            <StaggeredChild index={1} isActive={isActive}>
              <p className="text-white/50 text-sm md:text-base font-medium tracking-wider uppercase">
                {slide.subtitle}
              </p>
            </StaggeredChild>

            {/* Title */}
            <StaggeredChild index={2} isActive={isActive}>
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4.25rem] font-bold text-white font-serif tracking-tight leading-[1.08]">
                  {slide.title}
                </h1>
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4.25rem] font-bold font-serif tracking-tight leading-[1.08]"
                  style={{ color: colors.primary }}
                >
                  {slide.titleHighlight}
                </h1>
              </div>
            </StaggeredChild>

            {/* Description */}
            <StaggeredChild index={3} isActive={isActive}>
              <p className="text-white/65 text-base md:text-lg max-w-xl leading-relaxed">
                {slide.description}
              </p>
            </StaggeredChild>

            {/* Feature Pills */}
            {slide.features && slide.features.length > 0 && (
              <StaggeredChild index={4} isActive={isActive}>
                <div className="flex flex-wrap gap-2 pt-1">
                  {slide.features.map((feature, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-medium px-3 py-1.5 rounded-full border backdrop-blur-sm"
                      style={{
                        color: colors.light,
                        backgroundColor: `${colors.primary}10`,
                        borderColor: `${colors.primary}20`,
                      }}
                    >
                      <Star className="w-3 h-3 fill-current opacity-80" />
                      {feature}
                    </span>
                  ))}
                </div>
              </StaggeredChild>
            )}

            {/* CTA Buttons */}
            <StaggeredChild index={5} isActive={isActive}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3">
                <Button
                  size="lg"
                  className="group font-semibold px-7 sm:px-8 h-12 text-sm sm:text-base rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
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
                    variant="outline"
                    className="font-medium px-7 sm:px-8 h-12 text-sm sm:text-base rounded-xl backdrop-blur-sm border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-300"
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

          {/* -- Product Showcase -- */}
          <div className={`lg:col-span-5 hidden lg:flex justify-center items-center ${isRight ? '[direction:ltr]' : ''}`}>
            <div
              className="relative w-full max-w-md transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                transitionDelay: '0.3s',
              }}
            >
              {/* Ambient glow */}
              <div
                className="absolute -inset-10 rounded-[2.5rem] blur-3xl opacity-25"
                style={{ backgroundColor: colors.primary }}
              />

              {/* Card container */}
              <div
                className="relative rounded-2xl overflow-hidden border p-3 sm:p-4 backdrop-blur-xl"
                style={{
                  borderColor: `${colors.primary}20`,
                  backgroundColor: `linear-gradient(145deg, ${colors.primary}08, ${colors.primary}03)`,
                }}
              >
                {/* Inner shine */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                  <div
                    className="absolute -top-1/2 -right-1/2 w-full h-full rotate-12 opacity-30"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}30, transparent 60%)`,
                    }}
                  />
                </div>

                {slide.productImage ? (
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <Image
                      src={slide.productImage}
                      alt={slide.titleHighlight}
                      fill
                      className="object-cover transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <Image
                      src={slide.bgImage}
                      alt={slide.titleHighlight}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                )}

                {/* Featured badge */}
                <div
                  className="absolute -top-2 -right-2 px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    backgroundColor: colors.primary,
                    color: '#142229',
                  }}
                >
                  Featured
                </div>
              </div>

              {/* Decorative dots */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: colors.primary,
                      opacity: 0.3 - i * 0.08,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Islamic Pattern Overlay -------------------------------------------------

function IslamicOverlay({ accent }: { accent: 'golden' | 'emerald' | 'warm' }) {
  const color = accentColors[accent].primary;
  return (
    <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
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

      <svg className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.03]" viewBox="0 0 400 400" fill="none">
        <defs>
          <pattern id="hero-geo-2" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="12" stroke={color} strokeWidth="0.5" fill="none" />
            <path d="M25 13L37 25L25 37L13 25Z" stroke={color} strokeWidth="0.3" fill="none" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#hero-geo-2)" />
      </svg>

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[180px] h-[100px] opacity-[0.035]"
        style={{
          border: `2px solid ${color}`,
          borderBottom: 'none',
          borderRadius: '100px 100px 0 0',
        }}
      />
    </div>
  );
}

// --- Main Hero Slider --------------------------------------------------------

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSlide = slides[currentIndex];

  const goToSlide = useCallback(
    (index: number, dir?: number) => {
      if (index === currentIndex) return;
      setDirection(dir ?? (index > currentIndex ? 1 : -1));
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  const goNext = useCallback(() => {
    goToSlide((currentIndex + 1) % slides.length, 1);
  }, [currentIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(currentIndex === 0 ? slides.length - 1 : currentIndex - 1, -1);
  }, [currentIndex, goToSlide]);

  // Auto-advance every 6s
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(goNext, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, goNext]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  // Touch swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-brand-dark select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* -- Background Images -- */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
            style={{ opacity: slide.id === currentSlide.id ? 1 : 0 }}
          >
            <Image
              src={slide.bgImage}
              alt=""
              fill
              className="object-cover animate-ken-burns"
              priority={slide.id === 'main-store'}
              sizes="100vw"
              quality={80}
            />
          </div>
        ))}

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-[1]" style={{
          background: `linear-gradient(105deg, 
            rgba(20,34,41,0.97) 0%, 
            rgba(20,34,41,0.85) 25%,
            rgba(20,34,41,0.6) 50%,
            rgba(20,34,41,0.3) 75%,
            rgba(20,34,41,0.2) 100%
          )`,
        }} />
        <div className="absolute inset-0 z-[1]" style={{
          background: 'linear-gradient(to top, rgba(20,34,41,0.7) 0%, transparent 40%, rgba(20,34,41,0.3) 100%)',
        }} />
        <div className="absolute inset-0 z-[1]" style={{
          background: 'radial-gradient(ellipse at 30% 50%, transparent 30%, rgba(20,34,41,0.3) 100%)',
        }} />
      </div>

      {/* -- Islamic Pattern -- */}
      <IslamicOverlay accent={currentSlide.accent} />

      {/* -- Slide Content -- */}
      <div className="relative z-20 min-h-[420px] sm:min-h-[480px] md:min-h-[680px] lg:min-h-[88vh]">
        {slides.map((slide) => (
          <SlideContent
            key={slide.id}
            slide={slide}
            isActive={slide.id === currentSlide.id}
            direction={direction}
          />
        ))}
      </div>

      {/* -- Navigation Arrows -- */}
      <button
        onClick={goPrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] opacity-0 hover:opacity-100 focus:opacity-100 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] opacity-0 hover:opacity-100 focus:opacity-100 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* -- Bottom Navigation Bar -- */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div
          className="h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent 5%, ${accentColors[currentSlide.accent].primary}30 30%, ${accentColors[currentSlide.accent].primary}50 50%, ${accentColors[currentSlide.accent].primary}30 70%, transparent 95%)`,
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-4 sm:py-5">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2.5 shrink-0">
              <span
                className="text-xl font-bold tabular-nums"
                style={{ color: accentColors[currentSlide.accent].primary }}
              >
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <div className="w-6 h-px bg-white/15" />
              <span className="text-white/30 text-sm font-medium tabular-nums">
                {String(slides.length).padStart(2, '0')}
              </span>
            </div>

            <div className="flex-1">
              <HeroProgress currentIndex={currentIndex} />
            </div>

            <div className="hidden md:block text-white/25 text-sm font-medium max-w-[180px] truncate">
              {currentSlide.titleHighlight}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
