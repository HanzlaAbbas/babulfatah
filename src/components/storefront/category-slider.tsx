'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ============================================================
   CategorySlider — Horizontal scrolling category icon strip
   Matches Darussalam.pk layout: Trust badges + Category icons
   Brand colors: #1D333B (dark), #C9A84C (golden)
   ============================================================ */

interface TrustBadge {
  icon: string;
  title: string;
  subtitle: string;
}

interface CategoryItem {
  name: string;
  slug: string;
  icon: string;
  count: number;
}

interface CategorySliderProps {
  trustBadges: TrustBadge[];
  categories: CategoryItem[];
}

export function CategorySlider({ trustBadges, categories }: CategorySliderProps) {
  const trustRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft_t, setCanScrollLeft_t] = useState(false);
  const [canScrollRight_t, setCanScrollRight_t] = useState(false);
  const [canScrollLeft_c, setCanScrollLeft_c] = useState(false);
  const [canScrollRight_c, setCanScrollRight_c] = useState(false);

  const checkScroll = useCallback((el: HTMLDivElement | null, setLeft: Function, setRight: Function) => {
    if (!el) return;
    setLeft(el.scrollLeft > 4);
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll(trustRef.current, setCanScrollLeft_t, setCanScrollRight_t);
    checkScroll(catRef.current, setCanScrollLeft_c, setCanScrollRight_c);

    const onResize = () => {
      checkScroll(trustRef.current, setCanScrollLeft_t, setCanScrollRight_t);
      checkScroll(catRef.current, setCanScrollLeft_c, setCanScrollRight_c);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [checkScroll]);

  const scroll = (el: HTMLDivElement | null, dir: 'left' | 'right', setL: Function, setR: Function) => {
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(() => checkScroll(el, setL, setR), 350);
  };

  return (
    <section className="bg-white py-6 md:py-10">
      <div className="main-container">
        {/* ── Trust Badges Slider ── */}
        <div className="relative group/trust mb-6 md:mb-8">
          {canScrollLeft_t && (
            <button
              onClick={() => scroll(trustRef.current, 'left', setCanScrollLeft_t, setCanScrollRight_t)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-[#1D333B] hover:text-white hover:border-[#1D333B] transition-colors -ml-1 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {canScrollRight_t && (
            <button
              onClick={() => scroll(trustRef.current, 'right', setCanScrollLeft_t, setCanScrollRight_t)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-[#1D333B] hover:text-white hover:border-[#1D333B] transition-colors -mr-1 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div
            ref={trustRef}
            onScroll={() => checkScroll(trustRef.current, setCanScrollLeft_t, setCanScrollRight_t)}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="flex-shrink-0 flex flex-col items-center justify-center w-[130px] md:w-[160px] py-3 md:py-4 px-2"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1D333B]/5 flex items-center justify-center mb-2">
                  <span className="text-2xl md:text-3xl">{badge.icon}</span>
                </div>
                <h4 className="text-[12px] md:text-[13px] font-semibold text-[#1D333B] text-center leading-tight">
                  {badge.title}
                </h4>
                <p className="text-[10px] md:text-[11px] text-gray-400 text-center mt-0.5">
                  {badge.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Category Icons Slider ── */}
        <div className="relative group/cat">
          {canScrollLeft_c && (
            <button
              onClick={() => scroll(catRef.current, 'left', setCanScrollLeft_c, setCanScrollRight_c)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-[#1D333B] hover:text-white hover:border-[#1D333B] transition-colors -ml-1 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {canScrollRight_c && (
            <button
              onClick={() => scroll(catRef.current, 'right', setCanScrollLeft_c, setCanScrollRight_c)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-[#1D333B] hover:text-white hover:border-[#1D333B] transition-colors -mr-1 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div
            ref={catRef}
            onScroll={() => checkScroll(catRef.current, setCanScrollLeft_c, setCanScrollRight_c)}
            className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="flex-shrink-0 flex flex-col items-center text-center w-[95px] md:w-[115px] py-2 md:py-3 group/cat-item hover:bg-[#C9A84C]/5 rounded-lg transition-colors duration-200"
              >
                <div className="w-[68px] h-[68px] md:w-[80px] md:h-[80px] rounded-full bg-[#1D333B]/[0.04] group-hover/cat-item:bg-[#C9A84C]/10 flex items-center justify-center transition-all duration-200 mb-2.5 relative overflow-hidden">
                  {/* Decorative ring on hover */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover/cat-item:border-[#C9A84C]/30 transition-colors duration-200" />
                  <span className="text-[28px] md:text-[34px] leading-none">{cat.icon}</span>
                </div>
                <h3 className="text-[12px] md:text-[13px] font-semibold text-[#1D333B] group-hover/cat-item:text-[#C9A84C] transition-colors line-clamp-2 leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[10px] md:text-[11px] text-gray-400 mt-1">
                  {cat.count} Items
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
