'use client';

import { ShieldCheck, Banknote, Truck, MessageCircle } from 'lucide-react';
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
    icon: ShieldCheck,
    title: '100% Authentic Texts',
    description: 'Verified content from trusted Islamic publishers and scholars.',
  },
  {
    icon: Banknote,
    title: 'Secure COD & JazzCash',
    description: 'Pay with Cash on Delivery or JazzCash across Pakistan.',
  },
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    description: 'Reliable shipping to all major cities and towns in Pakistan.',
  },
  {
    icon: MessageCircle,
    title: '24/7 WhatsApp Support',
    description: 'Instant help via WhatsApp for orders and product queries.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TrustBanner() {
  const animRef = useScrollAnimation();

  return (
    <section
      className="py-10 md:py-14 bg-[#F9FAFB] border-t border-gray-200"
      ref={animRef}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          data-animate-stagger
        >
          {trustFeatures.map((feature) => (
            <div
              key={feature.title}
              data-animate
              className="flex flex-col items-center text-center px-2"
            >
              {/* Icon in golden circle */}
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-3">
                <feature.icon
                  className="h-5 w-5 text-[#C9A84C]"
                  strokeWidth={1.8}
                />
              </div>
              {/* Title */}
              <h3 className="font-semibold text-sm text-[#1D333B] mb-1">
                {feature.title}
              </h3>
              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
