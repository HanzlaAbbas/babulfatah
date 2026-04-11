import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  stock?: number;
}

interface AppliedCoupon {
  code: string;
  discountPercent: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  discountAmount: () => number;
  finalPrice: () => number;
  totalItems: () => number;
  openCart: () => void;
  closeCart: () => void;
  applyCoupon: (code: string, discountPercent: number) => void;
  removeCoupon: () => void;
  clearCartAndCoupon: () => void;
}

// ── Store ────────────────────────────────────────────────────────

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === newItem.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        });
        // Auto-open cart after adding item
        set({ isOpen: true });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      discountAmount: () => {
        const { coupon, totalPrice } = get();
        if (!coupon) return 0;
        const subtotal = totalPrice();
        return Math.round((subtotal * coupon.discountPercent) / 100);
      },

      finalPrice: () => {
        const { totalPrice, discountAmount } = get();
        return Math.max(0, totalPrice() - discountAmount());
      },

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      applyCoupon: (code, discountPercent) => {
        set({ coupon: { code: code.toUpperCase(), discountPercent } });
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      clearCartAndCoupon: () => {
        set({ items: [], coupon: null });
      },
    }),
    {
      name: 'bab-ul-fatah-cart',
      partialize: (state) => ({
        // Persist items and coupon, not isOpen
        items: state.items,
        coupon: state.coupon,
      }),
    }
  )
);
