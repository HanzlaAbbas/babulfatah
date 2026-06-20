'use client';

import { Star } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  quote: string;
  name: string;
  city: string;
  rating: number;
}

// ─── Testimonials Data ────────────────────────────────────────────────────────

const testimonials: Testimonial[] = [
  {
    quote:
      'MashaAllah! Best collection of Islamic books in Pakistan. Received my order within 3 days. Quality is excellent!',
    name: 'Ahmed Khan',
    city: 'Lahore',
    rating: 5,
  },
  {
    quote:
      "My children love the Goodword books. Beautiful illustrations and authentic content. JazakAllah khair!",
    name: 'Fatima Zahra',
    city: 'Karachi',
    rating: 5,
  },
  {
    quote:
      'Finally found a reliable source for Darussalam publications. Prices are reasonable and delivery is fast.',
    name: 'Umar Farooq',
    city: 'Islamabad',
    rating: 5,
  },
  {
    quote:
      'The Quran with Urdu translation is beautiful. Perfect gift for my parents. Will order again InshaAllah.',
    name: 'Aisha Bibi',
    city: 'Rawalpindi',
    rating: 5,
  },
  {
    quote:
      'Amazing customer service via WhatsApp. They helped me find the right books for my Islamic studies course.',
    name: 'Bilal Ahmed',
    city: 'Peshawar',
    rating: 5,
  },
  {
    quote:
      'Cash on delivery made it so easy. The Seerah collection is comprehensive and well-organized.',
    name: 'Maryam Siddiqui',
    city: 'Multan',
    rating: 5,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TestimonialsSection() {
  const animRef = useScrollAnimation();

  return (
    <section className="bg-surface py-12 md:py-16" ref={animRef}>
      <div className="container mx-auto px-4 md:px-6">
        {/* ── Header ── */}
        <div className="text-center mb-8 md:mb-10" data-animate>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1D333B]">
            What Our Customers Say
          </h2>
          <div className="border-b-2 border-[#D4AF37] w-24 mx-auto mt-3" />
          <p className="text-sm text-muted-foreground mt-3">
            Join 15,000+ happy readers across Pakistan
          </p>
        </div>

        {/* ── Testimonial Grid ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          data-animate-stagger
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              data-animate
              className="bg-[#DCF8C6] rounded-xl rounded-tl-none p-4 md:p-5"
            >
              {/* Quote */}
              <p className="text-[#1D333B]/90 text-sm leading-relaxed mb-3">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Star rating */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]"
                  />
                ))}
              </div>

              {/* Customer info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-[#1D333B]">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
                <span className="text-[10px] text-emerald-600 font-medium px-2 py-0.5 bg-emerald-100/50 rounded-full">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}