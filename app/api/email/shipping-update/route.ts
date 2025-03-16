import { NextRequest, NextResponse } from 'next/server';
import { sendShippingUpdateEmail } from '@/lib/email/send-email';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    // Shipping updates should only be sent from admin/authorized routes
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Basic validation
    if (!data.orderId || !data.customerName || !data.status) {
      return NextResponse.json(
        { message: 'Required fields are missing' },
        { status: 400 }
      );
    }
    
    // Validate status type
    const validStatuses = ['shipped', 'out_for_delivery', 'delivered'];
    if (!validStatuses.includes(data.status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Send the email
    const result = await sendShippingUpdateEmail(data);
    
    if (!result.success) {
      throw new Error('Failed to send shipping update email');
    }
    
    return NextResponse.json({ message: 'Shipping update email sent', data: result.data });
  } catch (error) {
    console.error('Error sending shipping update email:', error);
    return NextResponse.json(
      { message: 'Error sending shipping update email' },
      { status: 500 }
    );
  }
} 