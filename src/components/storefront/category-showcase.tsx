'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Library,
  PenTool,
  Users,
  Scale,
  HandHeart,
  Landmark,
  Baby,
  UserRound,
  GraduationCap,
  Heart,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Globe,
  Dumbbell,
  Utensils,
  BookMarked,
  Cross,
  FileText,
  TreePine,
  Droplets,
  type LucideIcon,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShowcaseCategory {
  name: string;
  slug: string;
  productCount: number;
}

interface CategoryShowcaseProps {
  categories: ShowcaseCategory[];
}

// ─── Category Icon Mapping ────────────────────────────────────────────────────

const categoryIcons: Record<string, LucideIcon> = {
  quran: BookOpen,
  hadith: Library,
  tafseer: PenTool,
  biography: Users,
  fiqh: Scale,
  'prayer-supplication': HandHeart,
  'pillars-of-islam': Landmark,
  children: Baby,
  women: UserRound,
  education: GraduationCap,
  family: Heart,
  'islamic-products': ShoppingBag,
  'prophets-seerah': Star,
  'darussalam-publishers': BookMarked,
  dawah: Globe,
  general: BookOpen,
  health: Dumbbell,
  history: Landmark,
  lifestyle: ShoppingBag,
  miscellaneous: FileText,
  reference: Library,
  'healthy-foods': Utensils,
  'aqeedah-creed': Cross,
  'islamic-lifestyle': Droplets,
  'acts-of-worship': HandHeart,
  'dua-dhikr': Sparkles,
  'goodword-books': BookMarked,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  const animRef = useScrollAnimation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update scroll button visibility
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [categories, updateScrollButtons]);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : 160;
    const amount = direction === 'left' ? -cardWidth * 3 : cardWidth * 3;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  return (
    <section className="py-10 md:py-14 lg:py-16 bg-surface" ref={animRef}>
      <div className="container mx-auto px-4 md:px-6" data-animate>
        {/* ── Section Header ── */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-golden font-medium mb-1.5">
              Browse Our Collection
            </p>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground font-serif">
              Shop by Category
            </h2>
          </div>

          {/* ── Navigation Arrows ── */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollBy('left')}
              disabled={!canScrollLeft}
              className={`h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? 'border-border/60 bg-white text-foreground hover:text-brand hover:border-brand/30 hover:shadow-premium'
                  : 'border-border/30 bg-surface text-muted-foreground/30 cursor-not-allowed'
              }`}
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy('right')}
              disabled={!canScrollRight}
              className={`h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? 'border-border/60 bg-white text-foreground hover:text-brand hover:border-brand/30 hover:shadow-premium'
                  : 'border-border/30 bg-surface text-muted-foreground/30 cursor-not-allowed'
              }`}
              aria-label="Scroll categories right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Horizontal Carousel ── */}
        <div className="relative group/cat">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-2"
            data-animate-stagger
          >
            {categories.map((category) => {
              const Icon = categoryIcons[category.slug] || BookOpen;

              return (
                <Link
                  key={category.slug}
                  href={`/shop?category=${category.slug}`}
                  data-animate
                  className="group block shrink-0 snap-start"
                >
                  <div className="relative overflow-hidden rounded-xl w-[130px] sm:w-[145px] md:w-[155px] p-4 md:p-5 bg-white border border-border/40 min-h-[130px] md:min-h-[145px] flex flex-col items-center justify-center gap-2.5 transition-all duration-300 group-hover:shadow-elevated group-hover:-translate-y-1 group-hover:border-golden/30">
                    {/* Icon */}
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-brand/5 flex items-center justify-center transition-all duration-300 group-hover:bg-golden/10 group-hover:scale-110">
                      <Icon
                        className="h-5 w-5 md:h-6 md:w-6 text-brand group-hover:text-golden transition-colors duration-300"
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Category Name */}
                    <div className="text-center">
                      <h3 className="text-foreground font-semibold text-xs md:text-sm leading-tight group-hover:text-brand transition-colors duration-200">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {category.productCount}{' '}
                        {category.productCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── Mobile scroll fade indicators ── */}
          {canScrollRight && (
            <div className="absolute top-0 right-0 bottom-2 w-10 bg-gradient-to-l from-surface to-transparent pointer-events-none md:hidden" />
          )}
        </div>
      </div>
    </section>
  );
}
