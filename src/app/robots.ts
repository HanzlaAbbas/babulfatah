import type { MetadataRoute } from 'next';

// ── robots.txt Generation ─────────────────────────────────────
// Allows full crawling of all public storefront routes while
// explicitly blocking /admin and /api/admin from search engine
// indexing. This prevents internal dashboards and API endpoints
// from appearing in SERPs and consuming crawl budget.
// ─────────────────────────────────────────────────────────────

const BASE_URL = 'https://www.babulfatah.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/api/auth'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
