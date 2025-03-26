import { NextResponse } from 'next/server';
import { resend } from '@/lib/email/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const toEmail = body.email || 'delivered@resend.dev';

    console.log('Sending test email to:', toEmail);
    
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's testing domain
      to: toEmail,
      subject: 'Maps & Memories Test Email',
      html: `
        <h1>Test Email from Maps & Memories</h1>
        <p>This is a test email to verify the email service is working.</p>
        <p>If you received this email, it means our email service is configured correctly!</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `,
    });

    console.log('Test email result:', result);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Test email error:', {
      error,
      message: error?.message,
      response: error?.response,
    });
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
} 