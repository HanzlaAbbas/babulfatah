'use client';

import { Truck, Banknote, ShieldCheck, MessageCircle } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Benefit {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const benefits: Benefit[] = [
  { icon: Truck, title: 'Free Delivery', subtitle: 'Orders above Rs. 2,000' },
  { icon: Banknote, title: 'Cash on Delivery', subtitle: 'Pay when you receive' },
  { icon: ShieldCheck, title: '100% Authentic', subtitle: 'Verified Islamic content' },
  { icon: MessageCircle, title: 'WhatsApp Support', subtitle: 'Instant help 24/7' },
];

const paymentMethods = [
  { name: 'COD', label: 'Cash on Delivery' },
  { name: 'JazzCash', label: 'JazzCash' },
  { name: 'EasyPaisa', label: 'EasyPaisa' },
  { name: 'Bank', label: 'Bank Transfer' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function BenefitsBar() {
  const animRef = useScrollAnimation();

  return (
    <section className="bg-white border-b border-gray-100" ref={animRef}>
      <div className="container mx-auto px-4 md:px-6">
        {/* ── Desktop: 4-column grid + payment strip ── */}
        <div className="hidden md:block">
          <div
            className="grid grid-cols-4 gap-6 lg:gap-8 py-5"
            data-animate-stagger
          >
            {benefits.map((item) => (
              <div
                key={item.title}
                className="text-center group"
                data-animate
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-brand/5 flex items-center justify-center mb-2 group-hover:bg-[#D4AF37]/10 transition-colors duration-300">
                  <item.icon
                    className="h-5 w-5 text-brand group-hover:text-[#D4AF37] transition-colors duration-300"
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

          {/* Payment methods strip */}
          <div
            className="flex items-center justify-center gap-4 py-3 border-t border-gray-50"
            data-animate
          >
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              We Accept:
            </span>
            <div className="flex items-center gap-2">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-gray-100"
                >
                  <div className="w-5 h-5 rounded-full bg-brand/5 flex items-center justify-center">
                    <Banknote className="w-3 h-3 text-brand/60" />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">
                    {pm.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile: horizontal scrollable row ── */}
        <div
          className="flex md:hidden gap-3 overflow-x-auto scrollbar-none py-3"
          data-animate
        >
          {benefits.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-2.5 px-4 py-3 min-w-[220px] shrink-0 rounded-xl bg-surface border border-gray-100"
            >
              <div className="w-9 h-9 rounded-full bg-brand/5 flex items-center justify-center shrink-0">
                <item.icon
                  className="h-4 w-4 text-brand"
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-foreground leading-tight">
                  {item.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile payment strip */}
        <div className="flex md:hidden items-center gap-2 pb-3 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider shrink-0">
            Pay via:
          </span>
          {paymentMethods.map((pm) => (
            <span
              key={pm.name}
              className="text-[10px] font-semibold text-brand/80 px-2.5 py-1 rounded-full bg-brand/5 border border-brand/10 shrink-0"
            >
              {pm.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}