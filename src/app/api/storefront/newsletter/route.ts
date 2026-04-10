import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

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

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.active) {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed!',
        });
      }
      // Re-activate previously unsubscribed
      await db.newsletter.update({
        where: { email },
        data: { active: true },
      });
      return NextResponse.json({
        success: true,
        message: 'Welcome back! Your subscription has been reactivated.',
      });
    }

    // Create new subscription
    await db.newsletter.create({
      data: { email },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully!',
    });
  } catch (error) {
    console.error('[Newsletter] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
