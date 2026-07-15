'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/storefront/product-card';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryProductRowProps {
  title: string;
  subtitle?: string;
  categorySlug: string;
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

// ─── Category Product Row ────────────────────────────────────────────────────

export function CategoryProductRow({
  title,
  subtitle,
  categorySlug,
  products,
}: CategoryProductRowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (products.length === 0) return null;

  return (
    <section className="relative py-24 md:py-32 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* ── Section Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16"
        >
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-white mb-6">
              {title}
            </h2>
            <div className="border-b border-white/10 w-20 mb-6" />
            {subtitle && (
              <p className="text-lg text-neutral-400 font-light leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href={`/shop?category=${categorySlug}`}
              className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors duration-500 ease-out font-medium pb-2 border-b border-white/10 hover:border-white"
            >
              View Category
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            {/* Carousel Navigation */}
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ease-out border ${
                  prevBtnEnabled 
                    ? 'border-white/20 text-white hover:bg-white hover:text-[#0A1114]' 
                    : 'border-white/5 text-neutral-600 cursor-not-allowed'
                }`}
                aria-label="Previous items"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ease-out border ${
                  nextBtnEnabled 
                    ? 'border-white/20 text-white hover:bg-white hover:text-[#0A1114]' 
                    : 'border-white/5 text-neutral-600 cursor-not-allowed'
                }`}
                aria-label="Next items"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Embla Carousel Container ── */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden" 
          ref={emblaRef}
        >
          <div className="flex gap-8 py-4 px-1" style={{ marginLeft: '-1rem' }}>
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_25%] min-w-0 pl-4"
              >
                <ProductCard
                  product={{
                    ...product,
                    language: product.language ?? '',
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mobile: View All */}
        <div className="mt-16 text-center md:hidden">
          <Link
            href={`/shop?category=${categorySlug}`}
            className="inline-flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-white transition-colors duration-500 ease-out font-medium min-h-[48px] px-8 rounded-full border border-white/20 bg-white/5 backdrop-blur-md"
          >
            View Category
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
