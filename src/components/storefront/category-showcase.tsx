'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  BookOpen,
  Sparkles,
  Star,
  Heart,
  Award,
  Gift,
  GraduationCap,
  Moon,
  Library,
  Plane,
  Landmark,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  name: string;
  slug: string;
  icon: React.ElementType;
  gradient: string;
  border: string;
  count: string;
  size: 'large' | 'medium' | 'small';
  iconColor: string;
}

// ─── Category Data ────────────────────────────────────────────────────────────

const categories: CategoryItem[] = [
  {
    name: 'Quran & Hadith',
    slug: 'quran',
    icon: BookOpen,
    gradient: 'from-[#1D333B] to-[#2A4A55]',
    border: '',
    count: '180+ books',
    size: 'large',
    iconColor: 'text-[#D4AF37]',
  },
  {
    name: "Children's Collection",
    slug: 'childrens-collection',
    icon: Sparkles,
    gradient: 'from-amber-50 to-orange-50',
    border: 'border border-amber-100',
    count: '95+ books',
    size: 'medium',
    iconColor: 'text-amber-600',
  },
  {
    name: 'Tafseer & Explanation',
    slug: 'tafseer',
    icon: Star,
    gradient: 'from-emerald-50 to-teal-50',
    border: 'border border-emerald-100',
    count: '65+ books',
    size: 'medium',
    iconColor: 'text-emerald-600',
  },
  {
    name: 'Biography & Seerah',
    slug: 'seerah',
    icon: BookOpen,
    gradient: 'from-rose-50 to-pink-50',
    border: 'border border-rose-100',
    count: '130+ books',
    size: 'medium',
    iconColor: 'text-rose-600',
  },
  {
    name: "Women's Collection",
    slug: 'womens-collection',
    icon: Heart,
    gradient: 'from-pink-50 to-fuchsia-50',
    border: 'border border-pink-100',
    count: '78+ books',
    size: 'medium',
    iconColor: 'text-pink-600',
  },
  {
    name: 'Goodword Books',
    slug: 'goodword',
    icon: Award,
    gradient: 'from-amber-50 to-yellow-50',
    border: 'border border-amber-100',
    count: '120+ books',
    size: 'large',
    iconColor: 'text-amber-700',
  },
  {
    name: 'Islamic Products',
    slug: 'islamic-products',
    icon: Gift,
    gradient: 'from-green-50 to-emerald-50',
    border: 'border border-green-100',
    count: '45+ items',
    size: 'small',
    iconColor: 'text-green-600',
  },
  {
    name: 'Education & Fiqh',
    slug: 'education-fiqh',
    icon: GraduationCap,
    gradient: 'from-blue-50 to-indigo-50',
    border: 'border border-blue-100',
    count: '175+ books',
    size: 'small',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Prayer & Supplication',
    slug: 'prayer-supplication',
    icon: Moon,
    gradient: 'from-violet-50 to-purple-50',
    border: 'border border-violet-100',
    count: '63+ books',
    size: 'small',
    iconColor: 'text-violet-600',
  },
  {
    name: 'IIPH Publications',
    slug: 'iiph',
    icon: Library,
    gradient: 'from-slate-50 to-gray-100',
    border: 'border border-slate-200',
    count: '85+ books',
    size: 'small',
    iconColor: 'text-slate-600',
  },
  {
    name: 'Hajj & Umrah',
    slug: 'hajj-umrah',
    icon: Plane,
    gradient: 'from-sky-50 to-cyan-50',
    border: 'border border-sky-100',
    count: '14+ books',
    size: 'small',
    iconColor: 'text-sky-600',
  },
  {
    name: 'Pillars of Islam',
    slug: 'pillars-of-islam',
    icon: Landmark,
    gradient: 'from-orange-50 to-amber-50',
    border: 'border border-orange-100',
    count: '25+ books',
    size: 'small',
    iconColor: 'text-orange-600',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryShowcase() {
  const animRef = useScrollAnimation();

  return (
    <section className="bg-surface py-10 md:py-14" ref={animRef}>
      <div className="container mx-auto px-4 md:px-6">
        {/* ── Section Header ── */}
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8" data-animate>
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1D333B]">
              Explore Our Collections
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
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Row 1: Large + 2 Medium ── */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4"
          data-animate-stagger
        >
          {/* Large: Quran & Hadith */}
          <CategoryCard category={categories[0]} />
          {/* Medium: Children's */}
          <CategoryCard category={categories[1]} />
          {/* Medium: Tafseer */}
          <CategoryCard category={categories[2]} />
        </div>

        {/* ── Row 2: 2 Medium + Large ── */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4"
          data-animate-stagger
        >
          {/* Medium: Seerah */}
          <CategoryCard category={categories[3]} />
          {/* Medium: Women's */}
          <CategoryCard category={categories[4]} />
          {/* Large: Goodword */}
          <CategoryCard category={categories[5]} />
        </div>

        {/* ── Row 3: 6 Small Cards ── */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
          data-animate-stagger
        >
          {categories.slice(6).map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>

        {/* Mobile: View All */}
        <div className="mt-5 text-center md:hidden" data-animate>
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

// ─── Category Card Sub-component ──────────────────────────────────────────────

function CategoryCard({ category }: { category: CategoryItem }) {
  const isLarge = category.size === 'large';
  const isDark = category.slug === 'quran';
  const Icon = category.icon;

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={`card-hover-lift shine-sweep rounded-xl bg-gradient-to-br ${category.gradient} ${category.border} p-4 md:p-5 flex flex-col justify-between group relative ${
        isLarge ? 'md:col-span-2 md:row-span-2 min-h-[120px] md:min-h-[320px]' : 'min-h-[120px] md:min-h-[152px]'
      }`}
      data-animate
    >
      {/* Icon top-left */}
      <div className="flex items-start justify-between">
        <div
          className={`w-9 h-9 md:w-11 md:h-11 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-white/10' : 'bg-white/80 shadow-sm'
          }`}
        >
          <Icon className={`h-4 w-4 md:h-5 md:w-5 ${isDark ? category.iconColor : category.iconColor}`} />
        </div>
        {/* Hover arrow */}
        <ChevronRight
          className={`h-4 w-4 md:h-5 md:w-5 transition-all duration-300 ${
            isDark ? 'text-white/0 group-hover:text-white/60' : 'text-[#1D333B]/0 group-hover:text-[#1D333B]/40'
          }`}
        />
      </div>

      {/* Bottom content */}
      <div className="mt-auto pt-2">
        <h3
          className={`font-serif font-bold text-sm md:text-base leading-tight ${
            isDark ? 'text-white' : 'text-[#1D333B]'
          }`}
        >
          {category.name}
        </h3>
        <p
          className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}
        >
          {category.count}
        </p>
      </div>
    </Link>
  );
}