import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email/send-email';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    // For order confirmation, we might want to allow this endpoint to be
    // called from both the client and server, but with proper validation
    const order = await req.json();
    
    // Basic validation
    if (!order.id || !order.customerName || !order.customerEmail || !order.items || !order.total) {
      return NextResponse.json(
        { message: 'Required order fields are missing' },
        { status: 400 }
      );
    }
    
    // Send the email
    const result = await sendOrderConfirmationEmail(order);
    
    if (!result.success) {
      throw new Error('Failed to send order confirmation email');
    }
    
    return NextResponse.json({ message: 'Order confirmation email sent', data: result.data });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return NextResponse.json(
      { message: 'Error sending order confirmation email' },
      { status: 500 }
    );
  }
} 