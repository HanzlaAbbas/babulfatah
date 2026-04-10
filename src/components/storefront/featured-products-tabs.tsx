'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/storefront/product-card';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// --- Types --------------------------------------------------------------------

export interface TabProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  language: string;
  images?: { id: string; url: string; altText?: string | null }[];
  category: { id: string; name: string };
  author?: { id: string; name: string } | null;
}

export interface TabCategory {
  name: string;
  products: TabProduct[];
}

interface FeaturedProductsTabsProps {
  categories: TabCategory[];
}

// --- Component ----------------------------------------------------------------

export function FeaturedProductsTabs({ categories }: FeaturedProductsTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animRef = useScrollAnimation();

  const activeProducts = categories[activeTab]?.products || [];

  const handleTabClick = useCallback(
    (index: number) => {
      if (index === activeTab || isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTab(index);
        setIsTransitioning(false);
        // Reset scroll position
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = 0;
        }
      }, 200);
    },
    [activeTab, isTransitioning]
  );

  // Scroll active tab into view on mobile
  const scrollToTab = useCallback((index: number) => {
    const container = tabsScrollRef.current;
    if (!container) return;
    const tabBtn = container.children[index] as HTMLElement | undefined;
    if (!tabBtn) return;
    const scrollLeft =
      tabBtn.offsetLeft - container.offsetWidth / 2 + tabBtn.offsetWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, []);

  const onTabClick = useCallback(
    (index: number) => {
      scrollToTab(index);
      handleTabClick(index);
    },
    [scrollToTab, handleTabClick]
  );

  // -- Carousel navigation --
  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + 12 // gap
      : 180;
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, []);

  // Show/hide scroll buttons based on scroll position
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 5);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 5
    );
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [activeProducts, updateScrollButtons]);

  return (
    <section className="py-10 md:py-14 lg:py-16 bg-white" ref={animRef}>
      <div className="container mx-auto px-4 md:px-6" data-animate>
        {/* -- Section Header -- */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-golden font-medium mb-1.5">
              Curated for You
            </p>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground font-serif">
              Featured Products
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-brand hover:bg-brand-light rounded-lg transition-colors duration-200"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* -- Tab Navigation (bottom border style) -- */}
        <div className="relative mb-6 md:mb-8 border-b border-border/60">
          <div
            ref={tabsScrollRef}
            className="flex gap-1 overflow-x-auto scrollbar-hide"
          >
            {categories.map((cat, index) => (
              <button
                key={cat.name}
                onClick={() => onTabClick(index)}
                className={`
                  relative shrink-0 px-4 md:px-5 py-3 text-sm font-medium transition-colors duration-200 whitespace-nowrap
                  ${
                    index === activeTab
                      ? 'text-brand'
                      : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {cat.name}
                {/* Active golden bottom indicator */}
                {index === activeTab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-golden rounded-t-full transition-all duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* -- Product Carousel -- */}
        <div
          className={`transition-all duration-300 ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          {activeProducts.length > 0 ? (
            <div className="relative group/carousel">
              {/* Desktop & Mobile: horizontal scroll carousel */}
              <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-3 snap-x-mandatory"
              >
                {activeProducts.map((product) => (
                  <div
                    key={product.id}
                    className="w-[130px] sm:w-[135px] md:w-[155px] lg:w-[170px] shrink-0 snap-start"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* -- Scroll Navigation Arrows -- */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollBy('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white shadow-elevated border border-border/50 flex items-center justify-center text-foreground/70 hover:text-foreground opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 hover:scale-105 hidden md:flex"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {canScrollRight && (
                <button
                  onClick={() => scrollBy('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white shadow-elevated border border-border/50 flex items-center justify-center text-foreground/70 hover:text-foreground opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 hover:scale-105 hidden md:flex"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">
                No products found in this category.
              </p>
            </div>
          )}
        </div>

        {/* -- Mobile View All Button -- */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white bg-brand hover:bg-brand-light rounded-lg transition-colors duration-200"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
