'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/store/use-cart';
import type { Product } from './product-page-types';

interface StickyATCProps {
  product: Product;
}

export function StickyATC({ product }: StickyATCProps) {
  const { addItem } = useCart();
  const inStock = product.stock > 0;
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!inStock || added) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0]?.url || '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="main-container flex items-center justify-between h-[56px] gap-4">
        {/* Product info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {product.images?.[0]?.url && (
            <div className="hidden sm:block relative w-9 h-9 rounded overflow-hidden bg-gray-100 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0].url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-[13px] font-medium text-[#1D333B] truncate">
              {product.title}
            </h3>
            <p className="text-[15px] font-bold text-[#1D333B]">
              Rs. {product.price.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAdd}
          disabled={!inStock || added}
          className={`shrink-0 h-[40px] px-6 text-[13px] font-bold uppercase tracking-wide flex items-center gap-2 transition-all duration-300 ${
            added
              ? 'bg-[#16a34a] text-white'
              : inStock
                ? 'bg-[#1D333B] hover:bg-[#142229] text-white active:scale-[0.97]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
