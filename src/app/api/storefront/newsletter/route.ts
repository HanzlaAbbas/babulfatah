import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

// ── Generate a unique coupon code ───────────────────────────
// Format: WELCOME-XXXXXX (6 random alphanumeric chars)
function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1 to avoid confusion
  let code = 'WELCOME-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message || 'Invalid email' },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email: normalizedEmail },
      include: { coupons: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (existing) {
      if (existing.active) {
        // Already subscribed — return their existing coupon
        const existingCoupon = existing.coupons[0];
        if (existingCoupon) {
          return NextResponse.json({
            success: true,
            message: 'You are already subscribed!',
            couponCode: existingCoupon.code,
            couponUsed: existingCoupon.used,
            isNew: false,
          });
        }
        // Edge case: subscribed but no coupon (shouldn't happen)
        // Create one now
        const code = generateCouponCode();
        const coupon = await db.coupon.create({
          data: {
            code,
            type: 'PERCENTAGE',
            value: 10,
            email: normalizedEmail,
          },
        });
        return NextResponse.json({
          success: true,
          message: 'Your discount code is ready!',
          couponCode: coupon.code,
          couponUsed: false,
          isNew: false,
        });
      }
      // Re-activate previously unsubscribed + create coupon
      await db.newsletter.update({
        where: { email: normalizedEmail },
        data: { active: true },
      });
    }

    // Create new subscription + coupon in transaction
    const code = generateCouponCode();

    // Ensure uniqueness (retry if collision)
    let uniqueCode = code;
    let attempts = 0;
    while (attempts < 5) {
      const exists = await db.coupon.findUnique({ where: { code: uniqueCode } });
      if (!exists) break;
      uniqueCode = generateCouponCode();
      attempts++;
    }

    // Create newsletter + coupon
    await db.newsletter.create({
      data: {
        email: normalizedEmail,
        coupons: {
          create: {
            code: uniqueCode,
            type: 'PERCENTAGE',
            value: 10,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'JazakAllah! Here is your discount code.',
      couponCode: uniqueCode,
      couponUsed: false,
      isNew: true,
    });
  } catch (error) {
    console.error('[Newsletter] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
