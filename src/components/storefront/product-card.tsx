'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/store/use-cart';

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
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  
  const inStock = product.stock > 0;
  const displayImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock || isAdding || isAdded) return;
    
    setIsAdding(true);
    // Simulate luxury instant feedback before dispatching
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: displayImage,
    });
    
    setIsAdding(false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative flex flex-col h-full w-full">
      {/* Image Container - Borderless, floating book aesthetic */}
      <Link href={`/shop/${product.slug}`} className="relative aspect-[3/4] w-full mb-6 block overflow-visible">
        <div className="absolute inset-0 bg-[#0B1518]/50 rounded-2xl transition-colors duration-500 group-hover:bg-[#0B1518]/30" />
        
        {/* Realistic Book Shadow */}
        <div className="absolute bottom-[-10%] left-[5%] right-[5%] h-[20%] bg-black/40 blur-2xl rounded-[100%] transition-opacity duration-500 opacity-60 group-hover:opacity-100" />
        
        <div className="absolute inset-4 overflow-hidden rounded-md transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] group-hover:-translate-y-2">
          <Image
            src={displayImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Sold Out Overlay */}
        {!inStock && (
          <div className="absolute inset-4 z-20 bg-[#0A1114]/80 flex items-center justify-center backdrop-blur-sm rounded-md">
            <span className="text-white text-xs font-semibold tracking-[0.2em] uppercase">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Typography & Actions */}
      <div className="flex flex-col flex-grow px-2">
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-2">
          {product.category.name}
        </span>
        
        <Link href={`/shop/${product.slug}`} className="flex-grow">
          <h3 className="font-serif text-lg text-neutral-200 leading-snug mb-1 line-clamp-2 transition-colors duration-500 group-hover:text-[#D4AF37]">
            {product.title}
          </h3>
          {product.author && (
            <p className="text-sm text-neutral-500 line-clamp-1 mb-4">{product.author.name}</p>
          )}
        </Link>
        
        <div className="mt-4 flex items-end justify-between">
          <span className="text-xl font-medium text-white tracking-tight">
            Rs. {product.price.toLocaleString('en-PK')}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={!inStock || isAdding || isAdded}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-out border ${
              isAdded 
                ? 'bg-white border-white text-[#0A1114]' 
                : isAdding
                ? 'bg-white/5 border-white/10 text-neutral-400'
                : 'bg-transparent border-white/20 text-white hover:bg-white hover:text-[#0A1114] hover:border-white'
            } ${!inStock && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-white hover:border-white/20'}`}
            aria-label="Add to Cart"
          >
            {isAdded ? (
              <Check className="w-4 h-4" />
            ) : isAdding ? (
              <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
