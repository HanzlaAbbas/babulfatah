'use client';

import Link from 'next/link';
import { ArrowRight, Star, BookOpen } from 'lucide-react';
import { ProductCard } from '@/components/storefront/product-card';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CollectionProduct {
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

interface FeaturedCollectionProps {
  title: string;
  description?: string;
  categorySlug: string;
  products: CollectionProduct[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FeaturedCollection({
  title,
  description,
  categorySlug,
  products,
}: FeaturedCollectionProps) {
  const animRef = useScrollAnimation();

  return (
    <section
      className="py-10 md:py-14 lg:py-16 bg-brand relative overflow-hidden"
      ref={animRef}
    >
      {/* ── Decorative Islamic geometric pattern (subtle background) ── */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, #C9A84C 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, #C9A84C 1px, transparent 1px),
              radial-gradient(circle at 50% 50%, #C9A84C 1px, transparent 1px),
              radial-gradient(circle at 20% 80%, #C9A84C 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, #C9A84C 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10" data-animate>
        {/* ── Section Header with golden divider ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 md:mb-8 gap-4">
          <div>
            {/* Golden decorative divider */}
            <div className="flex items-center gap-3 mb-2.5">
              <div className="h-px w-10 bg-golden/50" />
              <Star className="h-4 w-4 text-golden" strokeWidth={1.5} />
              <div className="h-px w-10 bg-golden/50" />
            </div>
            <p className="text-xs uppercase tracking-[0.15em] text-golden font-medium mb-1.5">
              Featured Collection
            </p>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white font-serif">
              {title}
            </h2>
            {description && (
              <p className="text-white/50 text-sm md:text-base mt-2 max-w-md leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <Link
            href={`/shop?category=${categorySlug}`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-golden-foreground bg-golden hover:bg-golden-light rounded-lg transition-colors duration-200 shrink-0"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Product Carousel (horizontal scroll) ── */}
        {products.length > 0 ? (
          <div
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x-mandatory"
            data-animate-stagger
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[120px] sm:w-[135px] md:w-[155px] lg:w-[170px] shrink-0 snap-start"
                data-animate
              >
                <ProductCard product={product} variant="dark" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-white/50">
              No products found in this collection.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
