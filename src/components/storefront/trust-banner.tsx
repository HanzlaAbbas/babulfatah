'use client';

import { Truck, ShieldCheck, Gift, Headphones } from 'lucide-react';

const features = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'COD Available',
    desc: 'Cash on Delivery nationwide',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Original Guaranteed',
    desc: '100% authentic Islamic books',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Fast Delivery',
    desc: '3-7 business days nationwide',
  },
  {
    icon: <Gift className="h-6 w-6" />,
    title: 'Bulk Discounts',
    desc: 'Special prices for bulk orders',
  },
];

/**
 * TrustBanner — Brand-colored benefit bar.
 * bg-[#1D333B] with golden #C9A84C icons.
 */
export function TrustBanner() {
  return (
    <section className="bg-[#1D333B] py-8 md:py-10">
      <div className="main-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="shrink-0 h-12 w-12 bg-white/10 flex items-center justify-center text-[#C9A84C]">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-white">{feature.title}</h3>
                <p className="text-[12px] text-white/60 mt-0.5">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
