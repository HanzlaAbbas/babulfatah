'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, ExternalLink, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCart } from '@/store/use-cart';
import { useWishlist } from '@/store/use-wishlist';

interface QuickViewProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  language: string;
  description?: string;
  images: { id: string; url: string; altText?: string | null }[];
  category: { id: string; name: string };
  author?: { id: string; name: string } | null;
}

interface QuickViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: QuickViewProduct | null;
}

export function QuickViewModal({
  open,
  onOpenChange,
  product,
}: QuickViewModalProps) {
  const addItem = useCart((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlist();
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) return null;

  const inStock = product.stock > 0;
  const wishlisted = isInWishlist(product.id);
  const primaryImage =
    product.images.length > 0 ? product.images[0] : null;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: primaryImage?.url || '',
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleToggleWishlist = () => {
    toggleItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: primaryImage?.url || '',
      slug: product.slug,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-xl overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription>Quick view of {product.title}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* ── Image ── */}
          <div className="relative aspect-[3/4] bg-surface-alt overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || product.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-alt">
                <Package className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* ── Info Panel ── */}
          <div className="p-6 flex flex-col gap-4">
            {/* Badges — language + category */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark bg-surface-alt rounded-full px-2.5 py-0.5"
              >
                {product.language}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs border-golden/40 text-golden-dark rounded-full"
              >
                {product.category.name}
              </Badge>
            </div>

            {/* Title */}
            <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground leading-snug">
              {product.title}
            </h2>

            {/* Author */}
            {product.author && (
              <p className="text-sm text-muted-foreground">
                by{' '}
                <span className="font-medium text-foreground/80">
                  {product.author.name}
                </span>
              </p>
            )}

            {/* Price */}
            <div className="text-2xl font-bold text-brand">
              Rs. {product.price.toLocaleString('en-PK')}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <>
                  <Check className="h-4 w-4 text-islamic-green" />
                  <span className="text-sm font-medium text-islamic-green">
                    In Stock
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Description snippet */}
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 mt-auto pt-2">
              {/* Primary — Add to Cart (golden) */}
              <Button
                size="lg"
                className={`w-full h-11 rounded-lg text-sm font-semibold gap-2 transition-all duration-200 ${
                  addedToCart
                    ? 'bg-islamic-green hover:bg-islamic-green-light text-white'
                    : inStock
                      ? 'bg-golden hover:bg-golden-hover text-golden-foreground shadow-md hover:shadow-lg active:scale-[0.98]'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                disabled={!inStock || addedToCart}
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                  </>
                )}
              </Button>

              {/* Secondary — Wishlist (outline) */}
              <Button
                variant="outline"
                size="lg"
                className={`w-full h-11 rounded-lg text-sm font-semibold gap-2 transition-all duration-200 ${
                  wishlisted
                    ? 'border-crimson/30 text-crimson hover:bg-crimson/5'
                    : 'border-border hover:border-crimson/30 hover:text-crimson'
                }`}
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`}
                />
                {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>

              {/* Ghost — View Full Details */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-brand hover:text-golden gap-1.5"
                asChild
              >
                <Link href={`/shop/${product.slug}`}>
                  View Full Details
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
