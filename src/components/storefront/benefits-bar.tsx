'use client';

import { Truck, Banknote, ShieldCheck, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
  return (
    <section className="relative bg-[#0A1114]/50 border-b border-white/5 backdrop-blur-xl z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Desktop: 4-column grid + payment strip ── */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-6 lg:gap-8 py-8">
            {benefits.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="text-center group"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/10 transition-colors duration-500 border border-white/5">
                  <item.icon
                    className="h-5 w-5 text-neutral-400 group-hover:text-[#D4AF37] transition-colors duration-500"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-sm font-medium text-white mb-1 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-500 font-light">{item.subtitle}</p>
              </motion.div>
            ))}
          </div>

          {/* Payment methods strip */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-6 py-4 border-t border-white/5"
          >
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.2em]">
              We Accept:
            </span>
            <div className="flex items-center gap-3">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                >
                  <Banknote className="w-3 h-3 text-neutral-400" />
                  <span className="text-[10px] font-semibold text-neutral-300 tracking-wider uppercase">
                    {pm.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Mobile: horizontal scrollable row ── */}
        <div className="flex md:hidden gap-4 overflow-x-auto scrollbar-none py-6">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 px-4 py-3 min-w-[240px] shrink-0 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                <item.icon
                  className="h-4 w-4 text-[#D4AF37]"
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-medium text-white leading-tight mb-0.5 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-[11px] text-neutral-500 font-light">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile payment strip */}
        <div className="flex md:hidden items-center justify-center gap-2 pb-6 flex-wrap">
          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.2em] shrink-0 w-full text-center mb-1">
            Pay via:
          </span>
          {paymentMethods.map((pm) => (
            <span
              key={pm.name}
              className="text-[9px] font-semibold text-neutral-300 px-3 py-1 rounded-full bg-white/5 border border-white/10 shrink-0 uppercase tracking-wider"
            >
              {pm.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}