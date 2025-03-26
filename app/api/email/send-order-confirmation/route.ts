import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email/send-email';

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the order ID from the request body
    const { orderId } = await req.json();
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Fetch the order from the database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: {
          include: {
            Product: true,
          },
        },
      },
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Prepare the order data for the email
    const orderForEmail = {
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderDate: order.createdAt,
      total: order.total,
      items: order.OrderItem.map((item: any) => ({
        productId: item.productId,
        name: item.Product.name,
        price: item.price,
        image: item.Product.images?.[0] || "https://placehold.co/200x200/png",
        quantity: item.quantity,
        frameSize: item.frameSize,
        frameType: item.frameType,
        engravingText: item.engravingText,
      })),
      shippingAddress: {
        address: order.shippingAddress,
        city: order.city,
        postalCode: order.postalCode,
        country: order.country,
      }
    };
    
    // Send the email
    const result = await sendOrderConfirmationEmail(orderForEmail);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send order confirmation email', details: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Order confirmation email sent successfully',
      data: {
        orderId: order.id,
        sentTo: order.customerEmail,
      }
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending the order confirmation email' },
      { status: 500 }
    );
  }
} 