'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/store/use-recently-viewed';

interface RecentlyViewedTrackerProps {
  product: {
    id: string;
    title: string;
    price: number;
    stock: number;
    image?: string;
    slug: string;
  };
}

/**
 * Headless component — renders nothing visible.
 * Tracks the product as recently viewed on mount.
 */
export function RecentlyViewedTracker({ product }: RecentlyViewedTrackerProps) {
  const addItem = useRecentlyViewed((s) => s.addItem);

  useEffect(() => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      stock: product.stock,
      image: product.image || '',
      slug: product.slug,
    });
  }, [product.id, addItem]);

  return null;
}
