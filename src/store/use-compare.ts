import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ────────────────────────────────────────────────────────
export interface CompareItem {
  productId: string;
  title: string;
  price: number;
  image?: string;
  slug: string;
  category: string;
  author: string;
  language: string;
  stock: number;
  sku?: string;
  weight?: number;
  description: string;
}

interface CompareState {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (productId: string) => void;
  clearAll: () => void;
  isInCompare: (productId: string) => boolean;
  totalItems: () => number;
}

const MAX_COMPARE = 4;

// ── Store ────────────────────────────────────────────────────────
export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (get().isInCompare(item.productId)) return; // Already in compare
        if (get().items.length >= MAX_COMPARE) return; // Max 4 items
        set({ items: [...get().items, item] });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      clearAll: () => set({ items: [] }),

      isInCompare: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      totalItems: () => get().items.length,
    }),
    {
      name: 'bab-ul-fatah-compare',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
