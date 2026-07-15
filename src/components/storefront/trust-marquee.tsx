'use client';

import React from 'react';
import { motion } from 'framer-motion';

const marqueeItems = [
  'Free Delivery All Over Pakistan',
  'Cash on Delivery Available',
  'JazzCash & EasyPaisa Accepted',
  '100% Authentic Islamic Literature',
  '25,000+ Happy Households',
  'Dedicated WhatsApp Support: +92 326 5903300',
  'Globally Award-Winning Translations',
  'Premium Binding & Craftsmanship',
];

export function TrustMarquee() {
  return (
    <div className="w-full bg-[#15262C] border-y border-white/5 py-5 overflow-hidden relative flex items-center">
      {/* Luxury Fading Edges for depth */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#15262C] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#15262C] to-transparent z-10 pointer-events-none" />
      
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 40, repeat: Infinity }}
        className="flex whitespace-nowrap gap-12 md:gap-24 px-6 hover:[animation-play-state:paused]"
      >
        {/* Render twice for seamless infinite loop */}
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <div key={i} className="flex items-center gap-12 md:gap-24">
            <span className="text-[#D4AF37] font-semibold text-xs md:text-sm tracking-widest uppercase flex items-center">
              {item}
            </span>
            <span className="text-white/10 text-[10px]">◆</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}