/**
 * Product Badge Logic — Determines which badge to show on product cards.
 * 
 * Badges are based on product metadata:
 * - "NEW" — Created in last 30 days
 * - "HOT" — 5+ orders or high-demand tags
 * - "BESTSELLER" — 10+ orders
 * - "SALE" — Has a sale/compare price (future: comparePrice field)
 * - "SOLD OUT" — Stock = 0
 */

export type BadgeType = 'NEW' | 'HOT' | 'BESTSELLER' | 'SALE' | 'SOLD_OUT' | null;

export interface BadgeConfig {
  type: BadgeType;
  label: string;
  className: string;
  icon: string;
}

const BADGE_STYLES: Record<string, BadgeConfig> = {
  NEW: {
    type: 'NEW',
    label: 'NEW',
    className: 'bg-green-600 text-white',
    icon: '✨',
  },
  HOT: {
    type: 'HOT',
    label: 'HOT',
    className: 'bg-red-600 text-white',
    icon: '🔥',
  },
  BESTSELLER: {
    type: 'BESTSELLER',
    label: 'BESTSELLER',
    className: 'bg-[#C9A84C] text-[#1D333B]',
    icon: '⭐',
  },
  SALE: {
    type: 'SALE',
    label: 'SALE',
    className: 'bg-orange-500 text-white',
    icon: '🏷️',
  },
  SOLD_OUT: {
    type: 'SOLD_OUT',
    label: 'Sold Out',
    className: 'bg-red-600 text-white',
    icon: '',
  },
};

export function getProductBadge(product: {
  createdAt?: string | Date;
  stock: number;
  _count?: { orderItems: number };
  tags?: string | null;
  price?: number;
  salePrice?: number;
}): BadgeConfig | null {
  // Sold out takes priority
  if (product.stock <= 0) {
    return BADGE_STYLES.SOLD_OUT;
  }

  // Check for sale (future: when comparePrice/salePrice field exists)
  if (product.salePrice && product.price) {
    return BADGE_STYLES.SALE;
  }

  // Check order count for bestseller
  const orderCount = product._count?.orderItems || 0;
  if (orderCount >= 10) {
    return BADGE_STYLES.BESTSELLER;
  }

  // Check for "hot" tag or moderate order count
  if (orderCount >= 5) {
    return BADGE_STYLES.HOT;
  }
  if (product.tags) {
    const tags = product.tags.toLowerCase();
    if (tags.includes('hot') || tags.includes('popular') || tags.includes('trending')) {
      return BADGE_STYLES.HOT;
    }
  }

  // Check for "new" — created within last 30 days
  if (product.createdAt) {
    const createdDate = new Date(product.createdAt);
    const daysAgo = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo <= 30) {
      return BADGE_STYLES.NEW;
    }
  }

  // Check for "new" tag
  if (product.tags) {
    const tags = product.tags.toLowerCase();
    if (tags.includes('new') || tags.includes('arrival') || tags.includes('latest')) {
      return BADGE_STYLES.NEW;
    }
  }

  return null;
}
