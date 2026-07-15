'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Flame, ShoppingCart, Check, Star } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BestsellerShowcaseProps {
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

// ─── Sub-Component: Premium Product Card ──────────────────────────────────────

function PremiumProductCard({ product }: { product: BestsellerShowcaseProps['products'][0] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdding || isAdded) return;
    
    setIsAdding(true);
    // Simulate instant AJAX Add-to-Cart delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsAdding(false);
    setIsAdded(true);
    
    // Reset after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);
  };

  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop'; // Fallback

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block relative w-full h-full bg-white rounded-2xl border border-neutral-100 overflow-hidden transition-all duration-400 ease-out hover:border-[#D4AF37]/50 hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.15)] hover:-translate-y-2 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full bg-neutral-50 overflow-hidden p-6 flex items-center justify-center">
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-[#1D333B] text-[#D4AF37] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            Best Seller
          </span>
        </div>
        
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4 transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out z-10" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow bg-white relative z-20">
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-2">
          {product.category.name}
        </span>
        <h3 className="font-serif font-bold text-[#1D333B] text-lg leading-snug mb-2 line-clamp-2 transition-colors duration-400 group-hover:text-[#D4AF37]">
          {product.title}
        </h3>
        {product.author && (
          <p className="text-sm text-neutral-500 mb-4 line-clamp-1">{product.author.name}</p>
        )}
        
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xl font-bold text-[#1D333B]">
            Rs. {product.price.toLocaleString()}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isAdded}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-400 ease-out border ${
              isAdded 
                ? 'bg-[#1D333B] border-[#1D333B] text-[#D4AF37]' 
                : isAdding
                ? 'bg-neutral-100 border-neutral-200 text-neutral-400'
                : 'bg-white border-neutral-200 text-[#1D333B] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white'
            }`}
            aria-label="Add to Cart"
          >
            {isAdded ? (
              <Check className="w-5 h-5" />
            ) : isAdding ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full"
              />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BestsellerShowcase({ products }: BestsellerShowcaseProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (products.length === 0) return null;

  return (
    <section className="bg-[#FAFAFA] py-24 md:py-32 relative overflow-hidden" aria-label="Bestselling Masterpieces">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1D333B]/5 border border-[#1D333B]/10 mb-4">
              <Flame className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#1D333B]">
                Trending Worldwide
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1D333B] mb-4">
              The Masterpieces
            </h2>
            <div className="border-b-2 border-[#D4AF37] w-20 mb-6" />
            <p className="text-lg text-neutral-500 font-light leading-relaxed">
              Discover the most beloved works that have transformed the lives of millions. Curated perfection for the discerning reader.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/shop?sort=best-selling"
              className="flex items-center gap-2 text-[#1D333B] font-medium hover:text-[#D4AF37] transition-colors duration-400 ease-out pb-1 border-b border-transparent hover:border-[#D4AF37] mr-4"
            >
              View Full Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            {/* Carousel Navigation */}
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-400 ease-out border ${
                  prevBtnEnabled 
                    ? 'border-[#1D333B]/20 text-[#1D333B] hover:bg-[#1D333B] hover:text-[#D4AF37] hover:border-[#1D333B]' 
                    : 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                }`}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-400 ease-out border ${
                  nextBtnEnabled 
                    ? 'border-[#1D333B]/20 text-[#1D333B] hover:bg-[#1D333B] hover:text-[#D4AF37] hover:border-[#1D333B]' 
                    : 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                }`}
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Embla Carousel Container ── */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden" 
          ref={emblaRef}
        >
          <div className="flex gap-6 py-4 px-1" style={{ marginLeft: '-1rem' }}>
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_25%] min-w-0 pl-4"
              >
                <PremiumProductCard product={product} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mobile: View All */}
        <div className="mt-12 text-center md:hidden">
          <Link
            href="/shop?sort=best-selling"
            className="inline-flex items-center justify-center gap-2 text-[#1D333B] font-medium transition-colors duration-400 ease-out min-h-[44px] px-8 py-3 rounded-full border border-[#1D333B]/20 hover:bg-[#1D333B] hover:text-[#D4AF37]"
          >
            View Full Collection
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}