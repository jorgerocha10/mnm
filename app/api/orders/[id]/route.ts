import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';
import { sendShippingUpdateEmail } from '@/lib/email/send-email';

// Schema for order update validation
const orderUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  shippingAddress: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('[ORDER_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validatedData = orderUpdateSchema.parse(body);

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: {
        id: params.id,
      },
      data: validatedData,
    });

    // Send email notification if status changed to SHIPPED, OUT_FOR_DELIVERY or DELIVERED
    if (validatedData.status && validatedData.status !== order.status) {
      try {
        if (['SHIPPED', 'DELIVERED'].includes(validatedData.status)) {
          // Map OrderStatus enum to shipping update email status
          const statusMap: Record<string, 'shipped' | 'out_for_delivery' | 'delivered'> = {
            'SHIPPED': 'shipped',
            'DELIVERED': 'delivered'
          };
          
          const emailStatus = statusMap[validatedData.status];
          
          if (emailStatus) {
            // Example tracking info - in a real app, you'd store this in the database
            const trackingInfo = validatedData.status === 'SHIPPED' ? {
              trackingNumber: 'TRK' + Math.floor(100000000 + Math.random() * 900000000),
              trackingUrl: 'https://maps-and-memories.com/track',
              estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              carrier: 'USPS'
            } : undefined;
            
            // Send the shipping update email
            await sendShippingUpdateEmail({
              customerName: order.customerName,
              orderId: order.id,
              status: emailStatus,
              ...trackingInfo
            });
            
            console.log(`Shipping update email sent for order ${order.id} - New status: ${validatedData.status}`);
          }
        }
      } catch (error) {
        // Log the error but don't fail the request
        console.error('Error sending shipping update email:', error);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('[ORDER_PATCH]', error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    
    return new NextResponse('Internal error', { status: 500 });
  }
} 