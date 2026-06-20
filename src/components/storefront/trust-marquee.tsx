'use client';

const marqueeItems = [
  '✦ Free Delivery All Over Pakistan',
  '✦ Cash on Delivery Available',
  '✦ JazzCash & EasyPaisa Accepted',
  '✦ 100% Authentic Islamic Books',
  '✦ 15,000+ Happy Customers',
  '✦ WhatsApp Order: +92 326 5903300',
  '✦ Trusted Since 2020',
  '✦ New Arrivals Every Week',
];

export function TrustMarquee() {
  return (
    <div className="w-full bg-[#1D333B] border-y border-[#D4AF37]/20 py-3 md:py-4 overflow-hidden hover:[animation-play-state:paused]">
      <div className="animate-marquee flex items-center whitespace-nowrap">
        {/* Duplicate content 2x for seamless loop */}
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span
            key={i}
            className="text-white/70 text-xs md:text-sm tracking-wide whitespace-nowrap font-medium px-3"
          >
            {item}
            <span className="text-[#D4AF37]/60 text-xs ml-3">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}