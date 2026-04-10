import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ────────────────────────────────────────────────────────

export interface RecentItem {
  productId: string;
  title: string;
  price: number;
  stock: number;
  image?: string;
  slug: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentItem[];
  addItem: (item: Omit<RecentItem, 'viewedAt'>) => void;
  clearAll: () => void;
}

const MAX_ITEMS = 20;

// ── Store ────────────────────────────────────────────────────────

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          // Remove if already exists (will be re-added with new timestamp)
          const filtered = state.items.filter(
            (i) => i.productId !== newItem.productId
          );
          const updated = [
            { ...newItem, viewedAt: Date.now() },
            ...filtered,
          ];
          // Keep only the most recent MAX_ITEMS
          return { items: updated.slice(0, MAX_ITEMS) };
        });
      },

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'bab-ul-fatah-recently-viewed',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
