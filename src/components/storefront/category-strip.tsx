import { db } from '@/lib/db';
import { CategorySlider } from '@/components/storefront/category-slider';

/* ============================================================
   CategoryStrip — Server component that fetches category data
   and renders a horizontal scrolling slider with:
   1. Trust badges (COD, Original, Same Day, Bulk)
   2. All product categories with icons (like Darussalam.pk)
   ============================================================ */

// ── Trust badges (non-clickable, informational) ──
const trustBadges = [
  { icon: '💰', title: 'COD Available', subtitle: 'Cash on Delivery' },
  { icon: '✅', title: 'Original Guaranteed', subtitle: '100% Authentic' },
  { icon: '🚚', title: 'Same Day Delivery', subtitle: 'Fast Shipping' },
  { icon: '📦', title: 'Bulk Order Discounts', subtitle: 'Wholesale Prices' },
];

// ── Category definition: slug → display name + DB matching ──
interface CategoryDef {
  displayName: string;
  matchSlugs: string[];
  emoji: string;
}

const sliderCategories: CategoryDef[] = [
  { displayName: 'Quran', matchSlugs: ['quran'], emoji: '📖' },
  { displayName: 'Hadith', matchSlugs: ['hadith'], emoji: '📚' },
  { displayName: 'Tafseer', matchSlugs: ['tafseer'], emoji: '📿' },
  { displayName: 'Biography', matchSlugs: ['biography'], emoji: '🕌' },
  { displayName: 'Hajj & Umrah', matchSlugs: ['hajj-umrah'], emoji: '🕋' },
  { displayName: 'Pillars of Islam', matchSlugs: ['pillars-of-islam'], emoji: '🕌' },
  { displayName: 'Education', matchSlugs: ['education'], emoji: '🎓' },
  { displayName: 'Fiqh', matchSlugs: ['fiqh'], emoji: '⚖️' },
  { displayName: 'Family', matchSlugs: ['family'], emoji: '👨‍👩‍👧‍👦' },
  { displayName: 'Women', matchSlugs: ['women'], emoji: '👩' },
  { displayName: 'Kids', matchSlugs: ['children'], emoji: '🧒' },
  { displayName: 'Islamic Products', matchSlugs: ['islamic-products'], emoji: '🌙' },
  { displayName: 'Home Decor', matchSlugs: ['home-decor'], emoji: '🏠' },
  { displayName: 'Calligraphy', matchSlugs: ['calligraphy'], emoji: '🖌️' },
  { displayName: 'Ramadan', matchSlugs: ['ramadan'], emoji: '🌙' },
  { displayName: 'Lifestyle', matchSlugs: ['lifestyle'], emoji: '🌟' },
  { displayName: 'Health', matchSlugs: ['health'], emoji: '❤️' },
];

/**
 * Build a category tree lookup and count products recursively.
 */
async function getCategoryData() {
  // Fetch ALL categories + their direct product counts in one query
  const allCategories = await db.category.findMany({
    select: { id: true, slug: true, name: true, parentId: true },
  });

  // Build product count map: categoryId → direct product count
  const countRows = await db.product.groupBy({
    by: ['categoryId'],
    _count: true,
  });
  const directCountMap = new Map(countRows.map((r) => [r.categoryId, r._count]));

  // Build children map: parentId → [childId, ...]
  const childrenMap = new Map<string, string[]>();
  for (const cat of allCategories) {
    if (cat.parentId) {
      const existing = childrenMap.get(cat.parentId) || [];
      existing.push(cat.id);
      childrenMap.set(cat.parentId, existing);
    }
  }

  // Build slug → category map
  const slugToCat = new Map(allCategories.map((c) => [c.slug, c]));

  // Recursive count function
  function countProducts(categoryId: string): number {
    let count = directCountMap.get(categoryId) || 0;
    const children = childrenMap.get(categoryId) || [];
    for (const childId of children) {
      count += countProducts(childId);
    }
    return count;
  }

  // Find category by trying slug patterns
  function findCategory(matchSlugs: string[]) {
    for (const slug of matchSlugs) {
      // Exact match
      if (slugToCat.has(slug)) {
        return slugToCat.get(slug)!;
      }
      // Contains match
      for (const [, cat] of slugToCat) {
        if (cat.slug.includes(slug)) return cat;
      }
    }
    return null;
  }

  // Build slider items
  const items: { name: string; slug: string; icon: string; count: number }[] = [];
  const usedIds = new Set<string>();

  for (const def of sliderCategories) {
    const cat = findCategory(def.matchSlugs);
    if (cat && !usedIds.has(cat.id)) {
      usedIds.add(cat.id);
      const count = countProducts(cat.id);
      if (count > 0) {
        items.push({
          name: def.displayName,
          slug: cat.slug,
          icon: def.emoji,
          count,
        });
      }
    }
  }

  // Sort by product count descending
  items.sort((a, b) => b.count - a.count);

  return items;
}

export async function CategoryStrip() {
  const categoryItems = await getCategoryData();

  return (
    <CategorySlider
      trustBadges={trustBadges}
      categories={categoryItems}
    />
  );
}
