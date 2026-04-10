'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { ProductCard } from '@/components/storefront/product-card';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import type { TabProduct } from '@/components/storefront/featured-products-tabs';

// --- Types --------------------------------------------------------------------

interface BestSellersGridProps {
  products: TabProduct[];
}

// --- Component ----------------------------------------------------------------

export function BestSellersGrid({ products }: BestSellersGridProps) {
  const sectionRef = useScrollAnimation();

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-16 bg-surface-alt" ref={sectionRef}>
      <div className="container mx-auto px-4 md:px-6">
        {/* -- Section Header -- */}
        <div
          className="flex items-end justify-between mb-6 md:mb-8"
          data-animate
        >
          <div>
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-golden font-medium mb-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending Now
            </p>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground font-serif">
              Best Sellers
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

        {/* -- Product Grid -- */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5"
          data-animate
          data-animate-stagger
        >
          {products.map((product) => (
            <div key={product.id} data-animate className="flex">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* -- Mobile View All Button -- */}
        <div className="mt-6 text-center sm:hidden" data-animate>
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
