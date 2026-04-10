import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface CheckoutBody {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  items: CheckoutItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json();
    const { fullName, phone, city, address, items } = body;

    // ── Validate required fields ───────────────────────────────
    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !city?.trim() ||
      !address?.trim()
    ) {
      return NextResponse.json(
        { error: 'All fields are required: fullName, phone, city, address' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty' },
        { status: 400 }
      );
    }

    // ── Resolve products from database ─────────────────────────
    const productIds = items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
    }

    // Validate stock and calculate total
    const orderItemsData: (CheckoutItem & { price: number })[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = productMap.get(item.productId)!;

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.title}". Only ${product.stock} available.`,
          },
          { status: 400 }
        );
      }

      const lineTotal = Math.round(product.price * item.quantity * 100) / 100;
      totalAmount += lineTotal;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    totalAmount = Math.round(totalAmount * 100) / 100;

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid order total' },
        { status: 400 }
      );
    }

    // ── Transaction: Create order + deduct stock ───────────────
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerName: fullName.trim(),
          status: 'PENDING',
          totalAmount,
          shippingCity: city.trim(),
          shippingAddress: address.trim(),
          contactPhone: phone.trim(),
          items: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // Deduct stock for each item
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      totalAmount: order.totalAmount,
      message: 'Order placed successfully',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
