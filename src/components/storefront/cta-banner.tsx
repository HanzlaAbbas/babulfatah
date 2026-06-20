'use client';

import Link from 'next/link';
import { Phone, BookOpen } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// ─── Geometric SVG Pattern ────────────────────────────────────────────────────

function CtaGeometricPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pattern-rotate-reverse pointer-events-none"
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="ctaGeoPattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <polygon
            points="100,20 115,75 175,75 125,110 140,165 100,135 60,165 75,110 25,75 85,75"
            fill="none"
            stroke="rgba(212,175,55,0.1)"
            strokeWidth="0.5"
          />
          <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
          <polygon
            points="100,10 190,100 100,190 10,100"
            fill="none"
            stroke="rgba(212,175,55,0.04)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ctaGeoPattern)" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CtaBanner() {
  const animRef = useScrollAnimation();

  return (
    <section
      className="relative bg-gradient-to-br from-[#1D333B] via-[#2A4A55] to-[#1D333B] overflow-hidden"
      ref={animRef}
    >
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <CtaGeometricPattern />
      </div>

      {/* Golden decorative blurs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 py-16 md:py-20 px-4">
        <div className="max-w-2xl mx-auto text-center" data-animate>
          {/* Icon */}
          <div className="mx-auto w-14 h-14 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mb-5">
            <BookOpen className="h-7 w-7 text-[#D4AF37]" />
          </div>

          <h2 className="font-serif text-2xl md:text-4xl font-bold text-white text-center mb-3">
            Start Your Islamic Learning Journey
          </h2>

          <div className="border-b-2 border-[#D4AF37] w-24 mx-auto" />

          <p className="text-white/60 text-sm md:text-base text-center mt-4 max-w-lg mx-auto">
            Explore our collection of 1,300+ authentic Islamic books, products, and
            resources. Delivered to your doorstep across Pakistan.
          </p>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/shop"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#D4B85E] text-[#1D333B] font-bold px-6 py-3 rounded-xl min-h-[44px] transition-all duration-300 shadow-golden text-sm"
            >
              <BookOpen className="h-4 w-4" />
              Browse Collection
            </Link>
            <Link
              href="https://wa.me/923265903300"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] font-semibold px-6 py-3 rounded-xl min-h-[44px] transition-all duration-300 text-sm"
            >
              <Phone className="h-4 w-4" />
              Order on WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}