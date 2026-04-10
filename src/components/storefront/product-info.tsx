'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Check,
  BookOpen,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { useWishlist } from '@/store/use-wishlist';
import { useCompare } from '@/store/use-compare';
import type { Product } from './product-page-types';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addItem, openCart } = useCart();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const { isInCompare, addItem: addToCompare } = useCompare();
  const router = useRouter();
  const inStock = product.stock > 0;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');

  // Sync wishlist state with store
  const wishlisted = isInWishlist(product.id);
  const compared = isInCompare(product.id);

  const subtotal = product.price * quantity;

  const handleAddToCart = () => {
    if (!inStock || added) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.images?.[0]?.url || '',
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!inStock || !termsAgreed) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.images?.[0]?.url || '',
      });
    }
    router.push('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on Bab-ul-Fatah`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleToggleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.images?.[0]?.url || '',
        slug: product.slug,
      });
    }
  };

  const handleCompare = () => {
    if (compared) {
      router.push('/compare');
      return;
    }
    addToCompare({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0]?.url || '',
      slug: product.slug,
      category: product.category.name,
      author: product.author?.name || '',
      language: product.language,
      stock: product.stock,
      sku: product.sku || undefined,
      weight: product.weight || undefined,
      description: product.description,
    });
  };

  const handleQtyChange = (delta: number) => {
    const next = quantity + delta;
    if (next >= 1 && next <= product.stock) {
      setQuantity(next);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Title ── */}
      <h1 className="text-[20px] md:text-[22px] font-bold text-[#1D333B] leading-snug">
        {product.title}
      </h1>

      {/* ── Vendor / SKU / Availability ── */}
      <div className="space-y-1.5 text-[13px]">
        <p className="text-gray-500">
          Vendor:{' '}
          <span className="text-[#1D333B] font-medium">Bab-ul-Fatah</span>
        </p>
        {product.sku && (
          <p className="text-gray-500">
            SKU: <span className="text-[#1D333B]">{product.sku}</span>
          </p>
        )}
        <p className="flex items-center gap-1.5">
          Availability:{' '}
          {inStock ? (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-green-600 font-medium">In stock</span>
              {product.stock <= 15 && (
                <span className="text-orange-500 ml-1">— Hurry up! Only {product.stock} left</span>
              )}
            </>
          ) : (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-red-500 font-medium">Out of stock</span>
            </>
          )}
        </p>
      </div>

      {/* ── Price ── */}
      <div>
        <span className="text-[26px] md:text-[28px] font-bold text-[#1D333B]">
          Rs. {product.price.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-gray-200" />

      {/* ── Quantity Selector ── */}
      {inStock && (
        <div className="space-y-2">
          <label className="text-[13px] text-gray-500 uppercase tracking-wider font-medium">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQtyChange(-1)}
              disabled={quantity <= 1}
              className="h-10 w-10 border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[#1D333B]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-[16px] font-semibold text-[#1D333B] tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => handleQtyChange(1)}
              disabled={quantity >= product.stock}
              className="h-10 w-10 border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[#1D333B]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[13px] text-gray-500">
            Product subtotal:{' '}
            <span className="font-semibold text-[#1D333B]">Rs. {subtotal.toLocaleString('en-PK', { minimumFractionDigits: 0 })}</span>
          </p>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="space-y-3 pt-1">
        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || added}
          className={`w-full h-[50px] text-[16px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${
            added
              ? 'bg-[#16a34a] text-white'
              : inStock
                ? 'bg-[#1D333B] hover:bg-[#142229] active:scale-[0.98] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {added ? (
            <>
              <Check className="h-5 w-5" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </>
          )}
        </button>

        {/* Wishlist + Compare + Share row */}
        <div className="flex gap-2">
          <button
            onClick={handleToggleWishlist}
            className={`flex-1 h-[42px] text-[13px] font-semibold uppercase tracking-wide flex items-center justify-center gap-2 border transition-all duration-200 ${
              wishlisted
                ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]'
                : 'border-gray-300 hover:border-[#C9A84C] text-[#1D333B] hover:text-[#C9A84C]'
            }`}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
            {wishlisted ? 'Wishlisted' : 'Wishlist'}
          </button>
          <button
            onClick={handleCompare}
            className={`h-[42px] px-4 text-[13px] font-semibold uppercase tracking-wide flex items-center justify-center gap-1.5 border transition-all duration-200 ${
              compared
                ? 'border-[#1D333B] bg-[#1D333B]/10 text-[#1D333B]'
                : 'border-gray-300 hover:border-[#1D333B] text-[#1D333B] hover:text-[#1D333B]'
            }`}
            title={compared ? 'View Comparison' : 'Add to Compare'}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            className="flex-1 h-[42px] text-[13px] font-semibold uppercase tracking-wide flex items-center justify-center gap-2 border border-gray-300 hover:border-[#1D333B] text-[#1D333B] transition-all duration-200"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>

        {/* Terms & Buy Now */}
        <label className="flex items-start gap-2.5 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#C9A84C]"
          />
          <span className="text-[12px] text-gray-500 leading-snug">
            I agree with the{' '}
            <Link href="/terms" className="underline text-[#1D333B] hover:text-[#C9A84C]">
              Terms & Conditions
            </Link>
          </span>
        </label>

        <button
          onClick={handleBuyNow}
          disabled={!inStock || !termsAgreed}
          className={`w-full h-[50px] text-[16px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${
            inStock && termsAgreed
              ? 'bg-[#C9A84C] hover:bg-[#D4B85E] active:scale-[0.98] text-[#1D333B]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Buy It Now
        </button>
      </div>
    </div>
  );
}
