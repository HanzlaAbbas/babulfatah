'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Flame } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { ProductCard } from '@/components/storefront/product-card';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BestsellerShowcaseProps {
  products: {
    id: string;
    title: string;
    slug: string;
    price: number;
    stock: number;
    language?: string;
    images?: { id: string; url: string; altText?: string | null }[];
    category: { id: string; name: string };
    author?: { id: string; name: string } | null;
  }[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BestsellerShowcase({ products }: BestsellerShowcaseProps) {
  const animRef = useScrollAnimation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = el.querySelector<HTMLElement>('[data-product-card]')?.offsetWidth || 200;
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * 2;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(updateScrollState, 350);
    },
    [updateScrollState]
  );

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-10 md:py-14" ref={animRef}>
      <div className="container mx-auto px-4 md:px-6">
        {/* ── Section Header ── */}
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8" data-animate>
          <div className="flex-1">
            {/* Trending badge */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                  Trending Now
                </span>
              </div>
            </div>

            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1D333B]">
              Bestsellers
            </h2>
            <div className="border-b-2 border-[#D4AF37] w-24 mt-3" />
            <p className="text-sm text-muted-foreground mt-2 hidden md:block">
              Most popular books loved by our customers across Pakistan
            </p>
          </div>

          {/* Desktop: View All */}
          <Link
            href="/shop?sort=best-selling"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-[#1D333B] hover:text-[#C9A84C] transition-colors duration-200 shrink-0 min-h-[44px]"
          >
            View All Bestsellers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Horizontal Scroll Container ── */}
        <div className="relative group/scroll" data-animate>
          {/* Left scroll arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-[#1D333B] hover:bg-gray-50 opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-200 min-w-[44px] min-h-[44px]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4"
          >
            {products.map((product) => (
              <div
                key={product.id}
                data-product-card
                className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px] snap-start"
              >
                <ProductCard
                  product={{
                    ...product,
                    language: product.language ?? '',
                  }}
                />
              </div>
            ))}
            <div className="shrink-0 w-4" aria-hidden="true" />
          </div>

          {/* Right scroll arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-[#1D333B] hover:bg-gray-50 opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-200 min-w-[44px] min-h-[44px]"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Mobile: View All */}
        <div className="mt-5 text-center md:hidden" data-animate>
          <Link
            href="/shop?sort=best-selling"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D333B] hover:text-[#C9A84C] transition-colors duration-200 min-h-[44px] px-4 justify-center"
          >
            View All Bestsellers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}