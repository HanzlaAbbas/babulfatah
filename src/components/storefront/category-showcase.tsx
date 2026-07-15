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
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryShowcase() {
  return (
    <section className="bg-[#0B1518] py-24 md:py-32 relative overflow-hidden" aria-label="Curated Collections">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1D333B]/50 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── Section Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16"
        >
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Curated Collections
            </h2>
            <div className="border-b-2 border-[#D4AF37] w-20 mb-6" />
            <p className="text-lg text-neutral-400 font-light leading-relaxed">
              Explore our meticulously organized categories. Every book is selected to elevate your understanding and beautify your Islamic library.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden md:flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors duration-400 ease-out font-medium pb-1 border-b border-transparent hover:border-white"
          >
            View Full Library
            <ChevronRight className="h-5 w-5" />
          </Link>
        </motion.div>

        {/* ── Bento Grid ── */}
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
        <div className="mt-12 text-center md:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 text-[#D4AF37] hover:text-white transition-colors duration-400 ease-out font-medium min-h-[44px] px-6 py-3 rounded-full border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10"
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
        className={`group block relative w-full h-full bg-[#15262C] rounded-3xl border border-white/5 p-6 md:p-8 overflow-hidden transition-all duration-400 ease-out hover:border-[#D4AF37]/50 ${
          isLarge ? 'min-h-[220px] md:min-h-[300px]' : 'min-h-[160px] md:min-h-[200px]'
        }`}
      >
        {/* Inner Glow Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/0 via-[#D4AF37]/0 to-[#D4AF37]/0 group-hover:from-[#D4AF37]/10 group-hover:via-transparent group-hover:to-transparent transition-all duration-400 ease-out opacity-0 group-hover:opacity-100" />
        
        <div className="relative z-10 h-full flex flex-col justify-between">
          {/* Icon Header */}
          <div className="flex items-start justify-between">
            <div className={`rounded-2xl flex items-center justify-center transition-transform duration-400 ease-out group-hover:scale-110 ${
              isLarge ? 'w-16 h-16 bg-[#1D333B] shadow-inner' : 'w-12 h-12 bg-[#1D333B]'
            }`}>
              <Icon className={`${isLarge ? 'h-8 w-8' : 'h-6 w-6'} text-[#D4AF37]`} />
            </div>
            
            {/* Arrow indicator */}
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400 ease-out">
              <ChevronRight className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Content Footer */}
          <div className="mt-8">
            <h3 className={`font-serif font-bold text-white leading-tight mb-2 transition-colors duration-400 ease-out group-hover:text-[#D4AF37] ${
              isLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
            }`}>
              {category.name}
            </h3>
            <p className="text-sm text-neutral-400 font-medium tracking-wide">
              {category.count}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}