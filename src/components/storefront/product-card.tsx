'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ShoppingCart, Heart, Eye, AlertTriangle } from 'lucide-react';
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

// ─── Enhanced Product Card ───────────────────────────────────────────────────
// Design:
//   • Image container: aspect-[3/4] with object-cover
//   • Price: text-lg font-extrabold text-[#1D333B]
//   • Live scarcity tags when stock <= 5
//   • SOLD OUT overlay with pointer-events-none on the card link
//   • Frictionless ATC via Zustand (auto-opens cart)
//   • 44px touch targets on all interactive buttons
//   • Subtle hover lift effect
//   • Author name shown below title

export function ProductCard({ product, variant = 'light' }: ProductCardProps) {
  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 5;
  const addItem = useCart((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlist();
  const images = product.images?.filter((img) => img.url) || [];
  const wishlisted = isInWishlist(product.id);
  const displayImage = images[0]?.url;

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!inStock) return;
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: displayImage || '',
      });
    },
    [addItem, product, displayImage, inStock]
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
    <div
      className={`group relative flex flex-col h-full rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        variant === 'dark'
          ? 'bg-[#1D333B] border border-white/10'
          : 'bg-white border border-gray-100 hover:border-[#C9A84C]/30'
      }`}
    >
      {/* ── Image Container ── */}
      <div className="relative aspect-[3/4] bg-surface-alt overflow-hidden">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, 200px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-alt">
            <BookOpen className="h-10 w-10 text-muted-foreground/25" />
          </div>
        )}

        {/* ── SOLD OUT Overlay — premium style ── */}
        {!inStock && (
          <div className="absolute inset-0 z-20 bg-black/45 flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-1.5">
              <div className="px-4 py-2 bg-white/95 rounded-lg shadow-lg">
                <span className="text-[#DC2626] font-bold text-xs tracking-[0.15em] uppercase font-serif">
                  Sold Out
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Language Badge (top-left) ── */}
        {product.language && (
          <span className="absolute top-2 left-2 z-10 bg-white/95 text-[9px] font-bold uppercase tracking-wider text-[#1D333B] rounded-full px-2 py-0.5 shadow-sm leading-none">
            {product.language}
          </span>
        )}

        {/* ── Wishlist Heart (top-right) — 44px touch target ── */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-10 w-[44px] h-[44px] rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-4 w-4 transition-colors duration-200 ${
              wishlisted
                ? 'fill-[#DC2626] text-[#DC2626]'
                : 'text-muted-foreground/60'
            }`}
          />
        </button>

        {/* ── Low Stock Scarcity Badge ── */}
        {lowStock && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50/95 border border-amber-200/80 shadow-sm">
            <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
            <span className="text-[10px] font-semibold text-amber-700 whitespace-nowrap">
              Only {product.stock} left
            </span>
          </div>
        )}

        {/* ── Hover Quick-Action Bar (slides up from bottom) ── */}
        {inStock && (
          <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <div className="flex items-center gap-1.5 px-2 pb-2">
              {/* Add to Cart — 44px touch area */}
              <button
                onClick={handleAddToCart}
                className="flex-1 h-[44px] rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 bg-[#C9A84C] text-[#1D333B] hover:bg-[#D4B85E] shadow-md transition-all duration-200 active:scale-[0.97]"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add
              </button>
              {/* View Product — 44px touch area */}
              <Link
                href={`/shop/${product.slug}`}
                className="w-[44px] h-[44px] rounded-lg bg-white/95 flex items-center justify-center text-[#1D333B] hover:bg-white shadow-md transition-all duration-200 hover:scale-105"
                aria-label="View product"
              >
                <Eye className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Card Content ── */}
      <div className="px-2.5 py-3 flex flex-col gap-1 min-h-[88px]">
        {/* Author name (if exists) */}
        {product.author && (
          <p className="text-[11px] text-muted-foreground leading-tight truncate">
            {product.author.name}
          </p>
        )}

        {/* Title — links to product page */}
        <Link
          href={`/shop/${product.slug}`}
          className={`group/title flex-1 ${!inStock ? 'pointer-events-none' : ''}`}
        >
          <h3
            className={`font-serif text-[12px] sm:text-[13px] font-semibold line-clamp-2 leading-[1.4] transition-colors duration-200 ${
              variant === 'dark'
                ? 'text-gray-200 group-hover/title:text-[#C9A84C]'
                : 'text-foreground group-hover/title:text-[#1D333B]'
            }`}
          >
            {product.title}
          </h3>
        </Link>

        {/* Price — bigger and bolder */}
        <span className="text-lg font-extrabold text-[#1D333B] tracking-tight pt-0.5">
          Rs. {product.price.toLocaleString('en-PK')}
        </span>
      </div>
    </div>
  );
}
