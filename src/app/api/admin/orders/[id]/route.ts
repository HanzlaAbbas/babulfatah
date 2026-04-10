import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await verifyAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, title: true, slug: true, sku: true, images: { take: 1, orderBy: { order: 'asc' } } },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error('[Admin Order GET] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await verifyAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const result = updateOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const order = await db.order.update({
      where: { id },
      data: result.data,
      include: {
        items: {
          include: {
            product: { select: { title: true } },
          },
        },
      },
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error('[Admin Order PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
