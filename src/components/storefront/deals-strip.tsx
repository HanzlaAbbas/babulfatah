'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/store/use-cart';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DealsStripProps {
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

export function DealsStrip({ products }: DealsStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const addItem = useCart((s) => s.addItem);

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
      const cardWidth = el.querySelector<HTMLElement>('[data-deal-card]')?.offsetWidth || 220;
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

  const handleAddToCart = useCallback(
    (e: React.MouseEvent, product: DealsStripProps['products'][0]) => {
      e.preventDefault();
      e.stopPropagation();
      if (product.stock <= 0) return;
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.images?.[0]?.url || '',
      });
    },
    [addItem]
  );

  if (products.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-[#1D333B] via-[#2A4A55] to-[#1D333B] py-10 md:py-14">
      <div className="container mx-auto px-4 md:px-6">
        {/* ── Header ── */}
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-white">
              Today&apos;s Special
            </h2>
            <p className="text-white/50 text-sm mt-1">Handpicked deals just for you</p>
          </div>
          <Link
            href="/shop?sort=best-selling"
            className="text-[#D4AF37] text-sm font-semibold hover:text-[#D4B85E] transition-colors duration-200 shrink-0 min-h-[44px] flex items-center"
          >
            View All
          </Link>
        </div>

        {/* ── Horizontal Scroll Container ── */}
        <div className="relative group/scroll">
          {/* Left arrow */}
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
            {products.map((product) => {
              const displayImage = product.images?.find((img) => img.url)?.url;
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  data-deal-card
                  className="shrink-0 w-[200px] md:w-[220px] snap-start bg-white rounded-xl overflow-hidden card-hover-lift group/card"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-surface-alt overflow-hidden">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt={product.title}
                        fill
                        sizes="220px"
                        className="object-cover transition-transform duration-500 group-hover/card:scale-[1.05]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-10 w-10 text-muted-foreground/25" />
                      </div>
                    )}

                    {/* DEAL badge */}
                    <span className="absolute top-2 left-2 bg-[#DC2626] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase z-10">
                      Deal
                    </span>

                    {/* Quick add to cart on hover */}
                    {product.stock > 0 && (
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="absolute bottom-2 left-2 right-2 h-[36px] rounded-lg bg-[#D4AF37] text-[#1D333B] text-xs font-bold flex items-center justify-center gap-1.5 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-300 z-10"
                        aria-label={`Add ${product.title} to cart`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add to Cart
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="font-serif text-xs font-semibold line-clamp-2 leading-[1.4] text-[#1D333B] mb-1">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-[#1D333B]">
                        Rs. {product.price.toLocaleString('en-PK')}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
            <div className="shrink-0 w-4" aria-hidden="true" />
          </div>

          {/* Right arrow */}
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
      </div>
    </section>
  );
}