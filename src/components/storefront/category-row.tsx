import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/storefront/product-card';

interface CategoryRowProps {
  title: string;
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

/**
 * CategoryRow — Bab-ul-Fatah brand product section.
 * - Heading: brand-dark bar with golden "View All" link
 * - 5-col desktop grid, 3 tablet, 2 mobile
 */
export function CategoryRow({ title, categorySlug, products }: CategoryRowProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="main-container">
        {/* ── Section Heading — brand-dark bar ── */}
        <div className="flex items-center justify-between bg-[#1D333B] px-5 py-3 mb-6 md:mb-8">
          <h2 className="text-white text-[18px] md:text-[22px] font-semibold">
            {title}
          </h2>
          <Link
            href={`/shop?category=${categorySlug}`}
            className="flex items-center gap-1.5 text-[#C9A84C] hover:text-[#D4B85E] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* ── Product Grid — 5 cols desktop, 3 tablet, 2 mobile ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-6 md:gap-y-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={{ ...product, language: product.language ?? '' }} />
          ))}
        </div>
      </div>
    </section>
  );
}
