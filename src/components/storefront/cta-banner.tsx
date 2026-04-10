'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// ─── Component ────────────────────────────────────────────────────────────────

export function CtaBanner() {
  const animRef = useScrollAnimation();

  return (
    <section
      className="relative py-14 md:py-20 lg:py-24 overflow-hidden"
      ref={animRef}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-dark" />

      {/* ── Decorative elements ── */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 30%, #C9A84C 1px, transparent 1px),
              radial-gradient(circle at 70% 30%, #C9A84C 1px, transparent 1px),
              radial-gradient(circle at 50% 70%, #C9A84C 1px, transparent 1px),
              radial-gradient(circle at 15% 70%, #C9A84C 1px, transparent 1px),
              radial-gradient(circle at 85% 70%, #C9A84C 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* ── Golden decorative circles ── */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-golden/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-golden/5 blur-3xl pointer-events-none" />

      {/* ── Content ── */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center" data-animate>
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Icon */}
          <div className="mx-auto w-14 h-14 rounded-full bg-golden/15 flex items-center justify-center mb-2">
            <Sparkles className="h-7 w-7 text-golden" />
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white font-serif leading-tight">
            Start Your Islamic Learning Journey Today
          </h2>

          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Explore our curated collection of authentic Islamic books, Quran
            editions, Hadith collections, and more. Trusted by scholars and
            families across Pakistan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold bg-golden hover:bg-golden-light text-golden-foreground rounded-lg shadow-lg shadow-golden/20 hover:shadow-golden/30 transition-all duration-200"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/5 rounded-lg transition-all duration-200"
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
