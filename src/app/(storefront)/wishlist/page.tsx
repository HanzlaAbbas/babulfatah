'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart, BookOpen, ArrowLeft, X, Check, MessageCircle } from 'lucide-react';
import { useWishlist } from '@/store/use-wishlist';
import { useCart } from '@/store/use-cart';
import { useState } from 'react';

export default function WishlistPage() {
  const { items, removeItem, clearAll } = useWishlist();
  const { addItem } = useCart();
  const router = useRouter();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [allAdded, setAllAdded] = useState(false);

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

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addItem({
        productId: item.productId,
        title: item.title,
        price: item.price,
        image: item.image || '',
      });
    });
    setAllAdded(true);
    setTimeout(() => setAllAdded(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const lines = items.map(
      (item) => `* ${item.title} - Rs. ${item.price.toLocaleString('en-PK')}`
    );
    const message = `Assalamu Alaikum! I'm interested in the following books from my wishlist:\n\n${lines.join('\n')}\n\nPlease confirm availability and total amount. JazakAllah!`;
    window.open(
      `https://wa.me/+923265903300?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleWhatsAppSingle = (item: typeof items[0]) => {
    const message = `Assalamu Alaikum! I'm interested in:\n\n* ${item.title}\n* Rs. ${item.price.toLocaleString('en-PK')}\n\nPlease confirm availability.`;
    window.open(
      `https://wa.me/+923265903300?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
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
            Start adding books you love! Tap the heart icon on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="bg-[#1D333B] hover:bg-[#142229] text-white text-[14px] font-medium px-6 py-3 transition-colors rounded-lg"
          >
            Browse Books
          </Link>
        </div>
      )}

      {/* Action Buttons when items exist */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleMoveAllToCart}
            disabled={allAdded}
            className={`flex-1 h-11 px-5 text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 rounded-lg ${
              allAdded
                ? 'bg-green-500 text-white'
                : 'bg-[#C9A84C] hover:bg-[#D4B85E] text-[#1D333B]'
            }`}
          >
            {allAdded ? (
              <><Check className="h-4 w-4" /> All Added to Cart!</>
            ) : (
              <><ShoppingCart className="h-4 w-4" /> Move All to Cart</>
            )}
          </button>
          <button
            onClick={handleWhatsAppOrder}
            className="flex-1 h-11 px-5 text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white transition-colors rounded-lg"
          >
            <MessageCircle className="h-4 w-4" />
            Order All via WhatsApp
          </button>
        </div>
      )}

      {/* Wishlist Items */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 p-4 border border-gray-100 hover:border-gray-200 transition-colors rounded-lg"
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
                  className={`h-10 px-4 text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 rounded-lg ${
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
                  onClick={() => handleWhatsAppSingle(item)}
                  className="h-10 px-3 text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-white transition-colors rounded-lg"
                  aria-label="Order via WhatsApp"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors rounded-lg"
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
