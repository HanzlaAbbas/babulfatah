'use client';

import { Truck, Banknote, ShieldCheck, MessageCircle } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

interface Benefit {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

const benefits: Benefit[] = [
  {
    icon: Truck,
    title: 'Trusted Islamic Publisher',
    subtitle: 'Authentic & verified content',
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    subtitle: 'Pay when you receive',
  },
  {
    icon: ShieldCheck,
    title: 'Authentic Products',
    subtitle: 'Thousands of customers trust us',
  },
  {
    icon: MessageCircle,
    title: 'Nationwide Delivery',
    subtitle: 'All cities across Pakistan',
  },
];

export function BenefitsBar() {
  const animRef = useScrollAnimation();

  return (
    <section className="py-8 md:py-10 bg-surface" ref={animRef}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Desktop: 4-column centered grid */}
        <div
          className="hidden md:grid grid-cols-4 gap-6 lg:gap-8"
          data-animate-stagger
        >
          {benefits.map((item) => (
            <div
              key={item.title}
              className="text-center group"
              data-animate
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-brand/5 flex items-center justify-center mb-3 group-hover:bg-golden/10 transition-colors duration-300">
                <item.icon
                  className="h-5 w-5 text-brand group-hover:text-golden transition-colors duration-300"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-0.5">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Mobile: horizontal scrollable row */}
        <div
          className="flex md:hidden gap-4 overflow-x-auto scrollbar-hide py-1"
          data-animate
        >
          {benefits.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 px-4 py-3 min-w-[220px] shrink-0 rounded-xl bg-white border border-border/40"
            >
              <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center shrink-0">
                <item.icon
                  className="h-5 w-5 text-brand"
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
