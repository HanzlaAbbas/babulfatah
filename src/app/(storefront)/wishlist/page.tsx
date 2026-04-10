'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart, BookOpen, ArrowLeft, X, Check } from 'lucide-react';
import { useWishlist } from '@/store/use-wishlist';
import { useCart } from '@/store/use-cart';
import { useState } from 'react';

export default function WishlistPage() {
  const { items, removeItem, clearAll } = useWishlist();
  const { addItem } = useCart();
  const router = useRouter();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      productId: item.productId,
      title: item.title,
      price: item.price,
      image: item.image || '',
    });
    setAddedId(item.productId);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="main-container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-gray-400 mb-6">
        <button onClick={() => router.push('/')} className="hover:text-[#1D333B] flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Home
        </button>
        <span>/</span>
        <span className="text-[#1D333B] font-medium">Wishlist</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-[#C9A84C]" />
          <h1 className="text-[22px] md:text-[26px] font-bold text-[#1D333B]">
            My Wishlist
          </h1>
          {items.length > 0 && (
            <span className="bg-[#C9A84C] text-[#1D333B] text-[12px] font-bold px-2.5 py-0.5">
              {items.length}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={clearAll}
            className="text-[13px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-20 w-20 text-gray-200 mb-4" />
          <h2 className="text-[18px] font-semibold text-[#1D333B] mb-2">Your wishlist is empty</h2>
          <p className="text-[14px] text-gray-400 max-w-md mb-6">
            Start adding books you love! Click the heart icon on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="bg-[#1D333B] hover:bg-[#142229] text-white text-[14px] font-medium px-6 py-3 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      )}

      {/* Wishlist Items */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 p-4 border border-gray-100 hover:border-gray-200 transition-colors"
            >
              {/* Image */}
              <Link href={`/shop/${item.slug}`} className="shrink-0">
                {item.image ? (
                  <div className="h-20 w-16 bg-gray-50 rounded overflow-hidden relative">
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
                  </div>
                ) : (
                  <div className="h-20 w-16 bg-gray-50 rounded flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-gray-200" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/shop/${item.slug}`}
                  className="text-[15px] font-medium text-[#1D333B] hover:text-[#C9A84C] transition-colors line-clamp-1"
                >
                  {item.title}
                </Link>
                <p className="text-[16px] font-bold text-[#1D333B] mt-1">
                  Rs. {item.price.toLocaleString('en-PK')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={addedId === item.productId}
                  className={`h-10 px-4 text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                    addedId === item.productId
                      ? 'bg-[#16a34a] text-white'
                      : 'bg-[#1D333B] hover:bg-[#142229] text-white'
                  }`}
                >
                  {addedId === item.productId ? (
                    <><Check className="h-3.5 w-3.5" /> Added</>
                  ) : (
                    <><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</>
                  )}
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
