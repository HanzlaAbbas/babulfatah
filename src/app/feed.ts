import { db } from '@/lib/db';

const BASE_URL = 'https://www.babulfatah.com';

// ═══════════════════════════════════════════════════════════════════
//  RSS FEED — Product updates for subscribers
//  Enables users to subscribe to new product notifications via RSS.
//  Great for SEO: Google Discover, feed aggregators, and bloggers.
// ═══════════════════════════════════════════════════════════════════

type RSSFeed = {
  title: string;
  description: string;
  id: string;
  link: string;
  language: string;
  copyright: string;
  lastBuildDate: string;
  generator: string;
  docs: string;
  managingEditor: string;
  webMaster: string;
  ttl: number;
  items: {
    title: string;
    id: string;
    link: string;
    description: string;
    category: string;
    pubDate: string;
    author: string;
    enclosure?: { url: string; type: string; length: number };
  }[];
};

export async function feed(): Promise<RSSFeed> {
  const latestProducts = await db.product.findMany({
    where: { stock: { gt: 0 } },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: {
      category: true,
      author: true,
      images: { take: 1, orderBy: { order: 'asc' } },
    },
  });

  return {
    title: 'Bab-ul-Fatah — New Islamic Books & Products',
    description:
      'Stay updated with the latest Islamic books, Quran, Hadith, Tafseer, Seerah, and children\'s Islamic books from Bab-ul-Fatah — Pakistan\'s #1 Islamic bookstore.',
    id: BASE_URL,
    link: BASE_URL,
    language: 'en-US',
    copyright: `Copyright ${new Date().getFullYear()} Bab-ul-Fatah`,
    lastBuildDate: new Date().toISOString(),
    generator: 'Bab-ul-Fatah E-Commerce',
    docs: 'https://www.rssboard.org/rss-specification',
    managingEditor: 'contact@babulfatah.com',
    webMaster: 'contact@babulfatah.com',
    ttl: 60,
    items: latestProducts.map((product) => ({
      title: product.title,
      id: `${BASE_URL}/shop/${product.slug}`,
      link: `${BASE_URL}/shop/${product.slug}`,
      description: product.description.slice(0, 300),
      category: product.category.name,
      pubDate: product.updatedAt.toISOString(),
      author: product.author?.name || 'Bab-ul-Fatah',
      ...(product.images[0]?.url && {
        enclosure: {
          url: product.images[0].url,
          type: 'image/jpeg',
          length: 0,
        },
      }),
    })),
  };
}
