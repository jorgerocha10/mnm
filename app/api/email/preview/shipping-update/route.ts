import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ShippingUpdateEmail } from '@/lib/email/templates/shipping-update';
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
    // Get shipping update data from request body
    const shippingData = await request.json();
    
    // Validate required fields
    if (!shippingData.orderId || !shippingData.customerName || !shippingData.status) {
      return new NextResponse(JSON.stringify({ error: 'Missing required shipping data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Render the email HTML
    const html = await renderAsync(ShippingUpdateEmail({
      orderId: shippingData.orderId,
      customerName: shippingData.customerName,
      status: shippingData.status,
      trackingNumber: shippingData.trackingNumber,
      trackingUrl: shippingData.trackingUrl,
      estimatedDelivery: shippingData.estimatedDelivery,
      carrier: shippingData.carrier
    }));

    // Return the HTML
    return new NextResponse(JSON.stringify({ html }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating shipping update email preview:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate email preview' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 