import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

// ── Helpers ──────────────────────────────────────────────────────

function buildSearchWhere(query: string, language?: string) {
  const searchTerms = query.split(/\s+/).filter(Boolean);
  const orConditions = searchTerms.flatMap((term) => [
    { title: { contains: term } },
    { description: { contains: term } },
    { sku: { contains: term } },
    { tags: { contains: term } },
    { author: { name: { contains: term } } },
    { category: { name: { contains: term } } },
  ]);

  const where: Prisma.ProductWhereInput = { OR: orConditions };

  // Apply language filter if provided
  if (language && language !== '') {
    where.AND = [{ language: language as Prisma.EnumLanguageFilter }];
  }

  return where;
}

function buildOrderBy(sort: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'newest':
      return [{ stock: 'desc' }, { createdAt: 'desc' }];
    case 'price-asc':
      return [{ stock: 'desc' }, { price: 'asc' }];
    case 'price-desc':
      return [{ stock: 'desc' }, { price: 'desc' }];
    case 'relevance':
    default:
      return [{ stock: 'desc' }, { createdAt: 'desc' }];
  }
}

// ── POST: Full search with pagination, sort, language filter ──────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit, offset, sort, language } = body;

    // Validate query
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const trimmed = query.trim();

    if (trimmed.length < 2) {
      return NextResponse.json({
        products: [],
        total: 0,
        query: trimmed,
      });
    }

    // Validate limit and offset
    const resolvedLimit = Math.min(Math.max(typeof limit === 'number' ? limit : 24, 1), 50);
    const resolvedOffset = Math.max(typeof offset === 'number' ? offset : 0, 0);
    const resolvedSort = typeof sort === 'string' ? sort : 'relevance';

    // Build where clause with optional language filter
    const where = buildSearchWhere(trimmed, language);

    // Run count + products in parallel
    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          stock: true,
          language: true,
          author: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, slug: true } },
          images: { take: 1, orderBy: { order: 'asc' }, select: { id: true, url: true, altText: true } },
        },
        orderBy: buildOrderBy(resolvedSort),
        take: resolvedLimit,
        skip: resolvedOffset,
      }),
    ]);

    return NextResponse.json({
      products,
      total,
      query: trimmed,
    });
  } catch (error) {
    console.error('[SEARCH_API_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
