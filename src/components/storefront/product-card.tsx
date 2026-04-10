'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { useWishlist } from '@/store/use-wishlist';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    stock: number;
    language: string;
    images?: { id: string; url: string; altText?: string | null }[];
    category: { id: string; name: string };
    author?: { id: string; name: string } | null;
  };
  variant?: 'light' | 'dark';
}

// ─── Compact Super-Cool Product Card ─────────────────────────────────────────
// Design:
//   • Book-cover aspect ratio (2/3) — taller than wide, like a real book
//   • Minimal content: just title + price below image
//   • Wishlist heart (top-right) — always visible
//   • Language badge (top-left) — tiny pill
//   • Hover: image zooms + quick-action bar slides up from bottom
//   • No full-width "Add to Cart" button eating space
//   • Clean, tight spacing for carousel friendliness
// ─────────────────────────────────────────────────────────────────────────────

export function ProductCard({ product, variant = 'light' }: ProductCardProps) {
  const inStock = product.stock > 0;
  const addItem = useCart((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlist();
  const images = product.images?.filter((img) => img.url) || [];
  const wishlisted = isInWishlist(product.id);
  const displayImage = images[0]?.url;

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: displayImage || '',
      });
    },
    [addItem, product, displayImage]
  );

  const handleToggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: displayImage || '',
        slug: product.slug,
      });
    },
    [toggleItem, product, displayImage]
  );

  return (
    <div className="group relative flex flex-col h-full rounded-xl overflow-hidden bg-white border border-border/40 hover:border-golden/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
      {/* ── Image Container ── */}
      <div className="relative aspect-[2/3] bg-surface-alt overflow-hidden">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 28vw, (max-width: 768px) 20vw, 15vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-alt">
            <BookOpen className="h-10 w-10 text-muted-foreground/25" />
          </div>
        )}

        {/* ── Sold Out Overlay ── */}
        {!inStock && (
          <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1.5">
              <span className="px-4 py-1.5 bg-red-500 rounded-md shadow-lg">
                <span className="text-white font-bold text-[10px] tracking-[0.18em] uppercase font-serif">
                  Out of Stock
                </span>
              </span>
            </div>
          </div>
        )}

        {/* ── Language Badge (top-left) ── */}
        <span className="absolute top-2 left-2 z-10 bg-white/95 text-[9px] font-bold uppercase tracking-wider text-brand-dark rounded-full px-2 py-0.5 shadow-sm leading-none">
          {product.language}
        </span>

        {/* ── Wishlist Heart (top-right) ── */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/95 shadow-sm flex items-center justify-center hover:scale-110 transition-all duration-200"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-3 w-3 transition-colors duration-200 ${
              wishlisted
                ? 'fill-crimson text-crimson'
                : 'text-muted-foreground/60'
            }`}
          />
        </button>

        {/* ── Hover Quick-Action Bar (slides up from bottom) ── */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div className="flex items-center gap-1.5 px-2 pb-2">
            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 h-8 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 backdrop-blur-sm ${
                inStock
                  ? 'bg-golden text-golden-foreground hover:bg-golden-light shadow-md'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="h-3 w-3" />
              {inStock ? 'Add' : 'Sold'}
            </button>
            {/* View Product */}
            <Link
              href={`/shop/${product.slug}`}
              className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand hover:bg-white shadow-md transition-all duration-200 hover:scale-105"
              aria-label="View product"
            >
              <Eye className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Card Content — Compact ── */}
      <div className="px-2.5 py-2.5 flex flex-col gap-0.5 min-h-[72px]">
        {/* Title — links to product page */}
        <Link href={`/shop/${product.slug}`} className="group/title flex-1">
          <h3 className="font-serif text-[12px] sm:text-[13px] font-semibold line-clamp-2 text-foreground group-hover/title:text-brand transition-colors leading-[1.4]">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <span className="text-sm font-bold text-brand-dark tracking-tight pt-0.5">
          Rs. {product.price.toLocaleString('en-PK')}
        </span>
      </div>
    </div>
  );
}
