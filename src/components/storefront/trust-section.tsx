'use client';

import {
  BookOpen,
  Truck,
  ShieldCheck,
  MessageCircle,
  Award,
  Clock,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrustFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const trustFeatures: TrustFeature[] = [
  {
    icon: BookOpen,
    title: 'Authentic Islamic Content',
    description:
      'Every book and product is verified for authentic Islamic content from trusted publishers and scholars.',
  },
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    description:
      'Cash on Delivery to all cities across Pakistan. Free shipping on orders above Rs. 5,000.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    description:
      'Premium paper, beautiful binding, and careful packaging. Thousands of satisfied customers nationwide.',
  },
  {
    icon: MessageCircle,
    title: '24/7 WhatsApp Support',
    description:
      'Get instant help via WhatsApp for orders, recommendations, or any queries about our products.',
  },
  {
    icon: Award,
    title: 'Trusted by Scholars',
    description:
      'Recommended by Islamic scholars and institutions. Serving the Ummah since our founding.',
  },
  {
    icon: Clock,
    title: 'Easy Returns & Refunds',
    description:
      'Hassle-free returns within 7 days. Your satisfaction is our top priority in every transaction.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TrustSection() {
  const animRef = useScrollAnimation();

  return (
    <section className="py-10 md:py-14 lg:py-16 bg-white" ref={animRef}>
      <div className="container mx-auto px-4 md:px-6">
        {/* ── Section Header ── */}
        <div className="text-center mb-8 md:mb-10" data-animate>
          <p className="text-xs uppercase tracking-[0.15em] text-golden font-medium mb-1.5">
            Why Choose Us
          </p>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground font-serif">
            Trusted by Thousands of Muslims
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-lg mx-auto">
            Bab-ul-Fatah is Pakistan&apos;s largest online Islamic store, offering
            authentic books and products with reliable delivery.
          </p>
        </div>

        {/* ── Features Grid ── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
          data-animate-stagger
        >
          {trustFeatures.map((feature) => (
            <div
              key={feature.title}
              data-animate
              className="group p-5 md:p-6 rounded-xl bg-surface border border-border/30 hover:border-golden/20 hover:shadow-premium transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-brand/5 flex items-center justify-center shrink-0 group-hover:bg-golden/10 transition-colors duration-300">
                  <feature.icon
                    className="h-5 w-5 text-brand group-hover:text-golden transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm md:text-base font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
