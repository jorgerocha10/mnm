import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { OrderStatus, PaymentStatus, FrameSize, FrameType } from '@prisma/client';

// Flag to indicate if we're in testing/development mode
const USE_TEST_DATA = process.env.NODE_ENV === 'development';

// Initialize Stripe with the updated environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Schema for validating the request body
const orderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      productId: z.string(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      frameSize: z.string(),
      frameType: z.string(),
      engravingText: z.string().optional(),
      location: z
        .object({
          address: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        })
        .optional(),
    })
  ),
  shippingInfo: z.object({
    fullName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  paymentIntentId: z.string(),
});

export async function POST(req: NextRequest) {
  console.log('Order creation request received');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    console.log('Order request body received (partial):', { 
      items: body.items?.length || 0,
      email: body.shippingInfo?.email,
      paymentIntentId: body.paymentIntentId?.substring(0, 10) + '...'
    });
    
    const validatedData = orderSchema.parse(body);
    
    // Verify payment intent with Stripe
    console.log('Verifying payment intent:', validatedData.paymentIntentId);
    const paymentIntent = await stripe.paymentIntents.retrieve(
      validatedData.paymentIntentId
    );
    
    if (paymentIntent.status !== 'succeeded') {
      console.error('Payment not completed:', paymentIntent.status);
      return NextResponse.json(
        { error: 'Payment has not been completed' },
        { status: 400 }
      );
    }
    
    // Calculate order total
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = 12.99; // Fixed shipping cost
    const total = subtotal + shipping;
    
    console.log('Creating order in database');
    
    // Map frameSize and frameType from string to enum values
    const mapFrameSize = (size: string): FrameSize => {
      // Check if the size is already a valid FrameSize enum value
      if (Object.values(FrameSize).includes(size as FrameSize)) {
        return size as FrameSize;
      }
      
      // For legacy handling or mapping from display names
      if (size.includes('8.5x8.5') || size === '8.5x8.5"') {
        return FrameSize.SIZE_8_5X8_5;
      } else if (size.includes('6x6') || size === '6x6"') {
        return FrameSize.SIZE_6X6;
      } else if (size.includes('8.5x12') || size === '8.5x12"') {
        return FrameSize.SIZE_8_5X12;
      } else if (size.includes('12x12') || size === '12x12"') {
        return FrameSize.SIZE_12X12;
      } else if (size.includes('12x16') || size === '12x16"') {
        return FrameSize.SIZE_12X16;
      } else if (size.includes('16x16') || size === '16x16"') {
        return FrameSize.SIZE_16X16;
      } else if (size.includes('16x20') || size === '16x20"') {
        return FrameSize.SIZE_16X20;
      } else if (size.includes('20x20') || size === '20x20"') {
        return FrameSize.SIZE_20X20;
      } else if (size.includes('20x28') || size === '20x28"') {
        return FrameSize.SIZE_20X28;
      } else if (size.includes('4.5x8.5') || size === '4.5x8.5"') {
        return FrameSize.SIZE_4_5X8_5;
      } else if (size.includes('6x12') || size === '6x12"') {
        return FrameSize.SIZE_6X12;
      }
      
      // Default fallbacks for legacy values
      return size.includes('10') ? FrameSize.LARGE : FrameSize.SMALL;
    };
    
    const mapFrameType = (type: string): FrameType => {
      return type.toLowerCase().includes('dark') ? FrameType.DARK : FrameType.PINE;
    };
    
    try {
      // Get map coordinates from the first item for the order
      const firstItemWithLocation = validatedData.items.find(item => item.location);
      
      // Create order in database with proper type casting
      const order = await prisma.order.create({
        data: {
          customerName: validatedData.shippingInfo.fullName,
          customerEmail: validatedData.shippingInfo.email,
          shippingAddress: validatedData.shippingInfo.address,
          city: validatedData.shippingInfo.city,
          country: validatedData.shippingInfo.country,
          postalCode: validatedData.shippingInfo.postalCode,
          // Add map location data to the order if available
          latitude: firstItemWithLocation?.location?.latitude || null,
          longitude: firstItemWithLocation?.location?.longitude || null,
          mapAddress: firstItemWithLocation?.location?.address || null,
          total: total,
          status: OrderStatus.PROCESSING,
          paymentIntentId: validatedData.paymentIntentId,
          paymentStatus: PaymentStatus.PAID,
        },
      });
      
      console.log('Order created successfully:', order.id);
      
      // Create dummy products for testing if needed
      if (USE_TEST_DATA) {
        // Create a map of product IDs to check if they exist
        const existingProducts = new Map();
        
        // Check for each product ID if it exists
        for (const item of validatedData.items) {
          try {
            // Check if product exists
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
            });
            
            if (!product) {
              console.log('Creating test product for:', item.productId);
              // Create a test product if it doesn't exist
              const newProduct = await prisma.product.create({
                data: {
                  id: item.productId,
                  name: item.name,
                  slug: `test-product-${item.id}`,
                  description: 'Test product created for order processing',
                  price: item.price,
                  images: [],
                  stock: 10,
                  frameTypes: mapFrameType(item.frameType),
                  frameSizes: mapFrameSize(item.frameSize),
                },
              });
              
              existingProducts.set(item.productId, newProduct);
              console.log('Test product created:', newProduct.id);
            } else {
              existingProducts.set(item.productId, product);
            }
          } catch (e) {
            console.error('Error checking/creating product:', e);
          }
        }
      }
      
      // Create order items
      for (const item of validatedData.items) {
        // Log the productId for debugging
        console.log('Creating order item for product:', item.productId);
        
        try {
          await prisma.orderItem.create({
            data: {
              order: {
                connect: { id: order.id },
              },
              product: {
                connect: { id: item.productId },
              },
              quantity: item.quantity,
              price: item.price,
              frameSize: mapFrameSize(item.frameSize),
              frameType: mapFrameType(item.frameType),
              engravingText: item.engravingText || null,
            },
          });
        } catch (itemError) {
          console.error('Error creating order item:', itemError);
          console.error('Item data:', {
            productId: item.productId,
            name: item.name,
            price: item.price
          });
          
          if (USE_TEST_DATA) {
            console.log('Attempting to handle the error in test mode');
            // In test mode, continue processing the rest of the order items
            continue;
          } else {
            throw itemError;
          }
        }
      }
      
      console.log('All order items created successfully');
      
      // Return the created order
      return NextResponse.json({
        id: order.id,
        status: 'success',
        message: 'Order created successfully',
      });
    } catch (dbError) {
      console.error('Database error creating order:', dbError);
      
      // Return detailed error information for debugging
      return NextResponse.json({
        error: 'Failed to create order in database',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        code: (dbError as any)?.code,
        meta: (dbError as any)?.meta,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle different error types
    if (error instanceof z.ZodError) {
      console.error('Validation error:', JSON.stringify(error.errors));
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error:', (error as any).message);
      return NextResponse.json(
        { error: 'Payment verification error', message: (error as any).message },
        { status: 400 }
      );
    }
    
    // For Prisma errors
    if ((error as any).code && (error as any).meta) {
      console.error('Database error:', {
        code: (error as any).code,
        meta: (error as any).meta
      });
      return NextResponse.json(
        { 
          error: 'Database error',
          message: `Error: ${(error as any).code}. Please contact support.` 
        },
        { status: 500 }
      );
    }
    
    // Generic error handler
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        message: (error as any)?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 