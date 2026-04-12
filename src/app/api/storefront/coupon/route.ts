import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const validateSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = validateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { valid: false, message: result.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const { code } = result.data;
    const normalizedCode = code.trim().toUpperCase();

    // Find the coupon
    const coupon = await db.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid coupon code',
      });
    }

    if (coupon.used) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon has already been used',
        couponUsed: true,
      });
    }

    // Coupon is valid
    return NextResponse.json({
      valid: true,
      message: `Coupon applied! ${coupon.value}% off your order.`,
      discountPercent: coupon.value,
      code: coupon.code,
    });
  } catch (error) {
    console.error('[Coupon] Error:', error);
    return NextResponse.json(
      { valid: false, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
