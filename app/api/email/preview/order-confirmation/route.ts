import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { OrderConfirmationEmail } from '@/lib/email/templates/order-confirmation';
import { renderAsync } from '@react-email/components';

export async function POST(request: Request) {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get order data from request body
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.id || !orderData.customerName || !orderData.items) {
      return new NextResponse(JSON.stringify({ error: 'Missing required order data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Render the email HTML
    const html = await renderAsync(OrderConfirmationEmail({ order: orderData }));

    // Return the HTML
    return new NextResponse(JSON.stringify({ html }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating order confirmation email preview:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate email preview' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 