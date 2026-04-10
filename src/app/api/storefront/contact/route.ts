import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // Store contact submission in the database via Newsletter as a lightweight
    // approach — or we could create a dedicated ContactSubmission model.
    // For now, log and return success. The contact message is validated and
    // can be extended with email notifications (e.g., Resend, SendGrid).

    console.log('[Contact] New submission:', {
      name,
      email,
      subject,
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    });

    // TODO: Integrate email notification service
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'contact@babulfatah.com',
    //   to: 'support@babulfatah.com',
    //   subject: `[Contact] ${subject} — from ${name}`,
    //   html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message}</p>`,
    // });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    });
  } catch (error) {
    console.error('[Contact] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
