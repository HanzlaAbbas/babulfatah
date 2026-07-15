'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  name: string;
  slug: string;
  icon: React.ElementType;
  count: string;
  size: 'large' | 'medium' | 'small';
}

// ─── Category Data ────────────────────────────────────────────────────────────

const categories: CategoryItem[] = [
  {
    name: 'Quran & Hadith',
    slug: 'quran',
    icon: BookOpen,
    count: '180+ Masterpieces',
    size: 'large',
  },
  {
    name: "Children's Collection",
    slug: 'childrens-collection',
    icon: Sparkles,
    count: '95+ Illustrated Books',
    size: 'medium',
  },
  {
    name: 'Tafseer & Explanation',
    slug: 'tafseer',
    icon: Star,
    count: '65+ Volumes',
    size: 'medium',
  },
  {
    name: 'Biography & Seerah',
    slug: 'seerah',
    icon: Library,
    count: '130+ Biographies',
    size: 'medium',
  },
  {
    name: "Women's Collection",
    slug: 'womens-collection',
    icon: Heart,
    count: '78+ Curated Texts',
    size: 'medium',
  },
  {
    name: 'Goodword Excellence',
    slug: 'goodword',
    icon: Award,
    count: '120+ Award-Winners',
    size: 'large',
  },
  {
    name: 'Premium Gifts',
    slug: 'islamic-products',
    icon: Gift,
    count: '45+ Exquisite Items',
    size: 'small',
  },
  {
    name: 'Education & Fiqh',
    slug: 'education-fiqh',
    icon: GraduationCap,
    count: '175+ Academic Texts',
    size: 'small',
  },
  {
    name: 'Prayer & Dua',
    slug: 'prayer-supplication',
    icon: Moon,
    count: '63+ Spiritual Guides',
    size: 'small',
  },
  {
    name: 'IIPH Publications',
    slug: 'iiph',
    icon: Landmark,
    count: '85+ Authentic Books',
    size: 'small',
  },
  {
    name: 'Hajj & Umrah',
    slug: 'hajj-umrah',
    icon: Plane,
    count: '14+ Travel Guides',
    size: 'small',
  },
  {
    name: 'Pillars of Islam',
    slug: 'pillars-of-islam',
    icon: Landmark,
    count: '25+ Fundamental Texts',
    size: 'small',
  },
];

// ─── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryShowcase() {
  return (
    <section className="relative py-32 md:py-48 z-10" aria-label="Curated Collections">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* ── Section Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-end justify-between gap-6 mb-20"
        >
          <div className="max-w-2xl">
            <h2 className="font-serif text-5xl md:text-6xl font-normal text-white mb-6 tracking-tight">
              Curated Collections
            </h2>
            <p className="text-lg text-neutral-400 font-light leading-relaxed max-w-xl">
              Immerse yourself in our meticulously organized library. Every category is a gateway to profound Islamic heritage.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden md:flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors duration-500 ease-out font-medium pb-2 border-b border-white/10 hover:border-white"
          >
            View Full Library
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* ── Frosted Bento Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Row 1: Large + 2 Medium */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <CategoryCard category={categories[0]} />
            <CategoryCard category={categories[1]} />
            <CategoryCard category={categories[2]} />
          </div>

          {/* Row 2: 2 Medium + Large */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 flex-col-reverse md:flex-row">
            <CategoryCard category={categories[3]} />
            <CategoryCard category={categories[4]} />
            <CategoryCard category={categories[5]} />
          </div>

          {/* Row 3: 6 Small Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.slice(6).map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </motion.div>

        {/* Mobile: View All */}
        <div className="mt-16 text-center md:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-white transition-colors duration-500 ease-out font-medium min-h-[48px] px-8 rounded-full border border-white/20 bg-white/5 backdrop-blur-md"
          >
            View Full Library
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
  const Icon = category.icon;

  return (
    <motion.div variants={itemVariants} className={isLarge ? 'md:col-span-2' : ''}>
      <Link
        href={`/shop?category=${category.slug}`}
        className={`group block relative w-full h-full bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/[0.05] p-8 md:p-10 overflow-hidden transition-all duration-500 ease-out hover:bg-white/[0.04] hover:border-white/20 ${
          isLarge ? 'min-h-[280px] md:min-h-[340px]' : 'min-h-[200px] md:min-h-[240px]'
        }`}
      >
        <div className="relative z-10 h-full flex flex-col justify-between">
          {/* Icon Header */}
          <div className="flex items-start justify-between">
            <div className={`rounded-2xl flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110 ${
              isLarge ? 'w-16 h-16 bg-white/5 border border-white/10' : 'w-12 h-12 bg-transparent'
            }`}>
              <Icon className={`${isLarge ? 'h-8 w-8 text-white' : 'h-6 w-6 text-neutral-400 group-hover:text-white transition-colors duration-500'}`} strokeWidth={1.5} />
            </div>
            
            {/* Arrow indicator */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out border border-white/20 bg-white/5">
              <ChevronRight className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Content Footer */}
          <div className="mt-12">
            <h3 className={`font-serif font-normal text-white leading-tight mb-3 transition-colors duration-500 ease-out group-hover:text-[#D4AF37] ${
              isLarge ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
            }`}>
              {category.name}
            </h3>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.15em] font-medium group-hover:text-neutral-400 transition-colors duration-500">
              {category.count}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}