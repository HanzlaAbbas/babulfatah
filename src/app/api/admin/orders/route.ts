import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin';
import type { OrderStatus, Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput =
      status && status !== 'ALL' ? { status: status as OrderStatus } : {};

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { id: true, title: true, slug: true, images: { take: 1, orderBy: { order: 'asc' } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (err) {
    console.error('[Admin Orders GET] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
