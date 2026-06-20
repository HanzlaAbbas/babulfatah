'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import {
  BookOpen,
  Sparkles,
  Star,
  ShoppingBag,
  ChevronRight,
  Heart,
  Gift,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  name: string;
  slug: string;
  count: number;
  icon: React.ElementType;
  gradient: string;
  textColor: string;
  size: 'large' | 'medium' | 'small';
}

// ─── Category Grid Config ────────────────────────────────────────────────────
// Bento grid layout — each category is a card with different sizes
// creating a visually dynamic, magazine-like layout that competitors lack.

const categories: CategoryItem[] = [
  {
    name: 'Quran & Hadith',
    slug: 'quran',
    count: 180,
    icon: BookOpen,
    gradient: 'from-[#1D333B] to-[#2A4A55]',
    textColor: '#C9A84C',
    size: 'large',
  },
  {
    name: "Children's Collection",
    slug: 'children',
    count: 95,
    icon: Sparkles,
    gradient: 'from-[#C9A84C]/15 to-[#F59E0B]/10',
    textColor: '#D97706',
    size: 'medium',
  },
  {
    name: 'Tafseer',
    slug: 'tafseer',
    count: 65,
    icon: Star,
    gradient: 'from-[#10B981]/12 to-[#10B981]/5',
    textColor: '#059669',
    size: 'medium',
  },
  {
    name: "Women's Collection",
    slug: 'women',
    count: 78,
    icon: Heart,
    gradient: 'from-[#EC4899]/10 to-[#F43F5E]/8',
    textColor: '#DB2777',
    size: 'small',
  },
  {
    name: 'Goodword Books',
    slug: 'goodword-books',
    count: 120,
    icon: Star,
    gradient: 'from-[#F59E0B]/12 to-[#FBBF24]/8',
    textColor: '#D97706',
    size: 'small',
  },
  {
    name: 'IIPH Publications',
    slug: 'iiph',
    count: 85,
    icon: BookOpen,
    gradient: 'from-[#1D333B]/8 to-[#2A4A55]/5',
    textColor: '#1D333B',
    size: 'small',
  },
  {
    name: 'Biography & Seerah',
    slug: 'prophets-seerah',
    count: 72,
    icon: BookOpen,
    gradient: 'from-[#C9A84C]/10 to-[#A88B3A]/8',
    textColor: '#A88B3A',
    size: 'medium',
  },
  {
    name: 'Islamic Products',
    slug: 'islamic-products',
    count: 45,
    icon: Gift,
    gradient: 'from-[#1B5E20]/10 to-[#2E7D32]/8',
    textColor: '#1B5E20',
    size: 'small',
  },
];

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({ item, index }: { item: CategoryItem; index: number }) {
  const sizeClasses = {
    large: 'md:col-span-2 md:row-span-2 min-h-[160px] md:min-h-0',
    medium: 'md:col-span-1 md:row-span-1',
    small: 'md:col-span-1 md:row-span-1',
  };

  const iconSize = {
    large: 'w-8 h-8',
    medium: 'w-6 h-6',
    small: 'w-5 h-5',
  };

  const titleSize = {
    large: 'text-lg md:text-xl',
    medium: 'text-sm md:text-base',
    small: 'text-sm',
  };

  return (
    <Link
      href={`/shop?category=${item.slug}`}
      className={`group relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br ${item.gradient} ${sizeClasses[item.size]} transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-200 flex flex-col justify-between p-4 md:p-5`}
      data-animate
    >
      {/* Icon */}
      <div
        className="transition-transform duration-300 group-hover:scale-110"
        style={{ color: item.textColor }}
      >
        <item.icon className={iconSize[item.size]} strokeWidth={1.5} />
      </div>

      {/* Text */}
      <div className="mt-3 md:mt-auto md:pt-4">
        <h3
          className={`font-serif font-bold ${titleSize[item.size]} tracking-tight transition-colors duration-200`}
          style={{ color: item.textColor }}
        >
          {item.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.count}+ books
        </p>
      </div>

      {/* Hover arrow indicator */}
      <div
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0"
      >
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
      </div>

      {/* Subtle shine on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full rotate-12 bg-gradient-to-br from-white/10 to-transparent" />
      </div>
    </Link>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function CategoryBentoGrid() {
  const animRef = useScrollAnimation();

  return (
    <section className="py-10 md:py-16 bg-surface" ref={animRef} data-animate>
      <div className="container mx-auto px-4 md:px-6">
        {/* ── Section Header ── */}
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold font-serif text-[#1D333B]">
              Shop by Category
            </h2>
            <div className="border-b-2 border-[#D4AF37] w-24 mt-3" />
            <p className="text-sm text-muted-foreground mt-2 hidden md:block">
              Browse our carefully curated Islamic book collections
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-[#1D333B] hover:text-[#C9A84C] transition-colors duration-200 shrink-0"
          >
            View All Categories
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" data-animate-stagger>
          {categories.map((item, index) => (
            <CategoryCard key={item.slug} item={item} index={index} />
          ))}
        </div>

        {/* Mobile: View All */}
        <div className="mt-5 text-center md:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D333B] hover:text-[#C9A84C] transition-colors duration-200 min-h-[44px] px-4 justify-center"
          >
            View All Categories
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}