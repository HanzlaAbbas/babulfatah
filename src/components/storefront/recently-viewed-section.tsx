'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useRecentlyViewed } from '@/store/use-recently-viewed';

export function RecentlyViewedSection() {
  const items = useRecentlyViewed((s) => s.items);

  // Don't render if no items
  if (items.length === 0) return null;

  // Show at most 10 items
  const displayItems = items.slice(0, 10);

  return (
    <section className="py-10 md:py-14 border-t bg-muted/20 px-4 md:px-0">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-6">
          Recently Viewed
        </h2>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {displayItems.map((item) => (
            <Link
              key={`${item.productId}-${item.viewedAt}`}
              href={`/shop/${item.slug}`}
              className="group shrink-0 w-[140px] md:w-[160px]"
            >
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted border border-border/50 group-hover:border-golden/30 transition-all duration-200 relative mb-2">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="160px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                {item.stock <= 0 && (
                  <div className="absolute inset-0 z-10 bg-black/25 flex items-center justify-center">
                    <span className="px-2.5 py-1 bg-white/95 rounded text-[9px] font-bold uppercase tracking-[0.12em] text-red-600 leading-none">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-xs font-medium line-clamp-2 text-foreground group-hover:text-brand transition-colors leading-snug">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className={`text-sm font-bold ${item.stock <= 0 ? 'text-muted-foreground line-through' : 'text-brand-dark'}`}>
                  Rs. {item.price.toLocaleString('en-PK')}
                </p>
                {item.stock <= 0 && (
                  <span className="text-[9px] font-semibold text-red-500 uppercase tracking-wide">
                    Sold Out
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
