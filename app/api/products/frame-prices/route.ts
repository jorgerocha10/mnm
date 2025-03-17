import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import * as z from 'zod';

// Schema for price updates
const priceUpdateSchema = z.object({
  productId: z.string().optional(),
  category: z.string().optional(),
  frameSizePrices: z.record(z.string(), z.number().min(0)),
});

// In-memory store for frame size prices
// In a production environment, this would be stored in a database
const frameSizePricesStore: {
  [key: string]: { [frameSize: string]: number }
} = {
  // Key holder maps
  'KEY_HOLDERS': {
    'SIZE_4_5X8_5': 104.34,
    'SIZE_6X12': 184.43,
  },
  // Regular maps
  'DEFAULT': {
    'SIZE_6X6': 179.00,
    'SIZE_8_5X8_5': 224.33,
    'SIZE_8_5X12': 254.44,
    'SIZE_12X12': 299.61,
    'SIZE_12X16': 359.83,
    'SIZE_16X16': 405.00,
    'SIZE_16X20': 450.17,
    'SIZE_20X20': 510.39,
    'SIZE_20X28': 600.72,
    'SIZE_28X28': 751.28,
    'SIZE_28X35': 1007.23,
    'SIZE_35X35': 1172.84,
  }
};

/**
 * GET handler for retrieving frame size prices
 */
export async function GET(request: Request) {
  try {
    // Get URL search params
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const category = searchParams.get('category');
    
    // Return appropriate prices based on query params
    if (productId) {
      // In a real app, look up the product's category based on productId
      // For now, we'll return default prices
      return NextResponse.json(frameSizePricesStore['DEFAULT']);
    } else if (category) {
      // Handle category-specific pricing
      if (category.toLowerCase() === 'key holders') {
        return NextResponse.json(frameSizePricesStore['KEY_HOLDERS']);
      }
      return NextResponse.json(frameSizePricesStore['DEFAULT']);
    }
    
    // Return all prices if no specific query
    return NextResponse.json(frameSizePricesStore);
  } catch (error) {
    console.error('[FRAME_PRICES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

/**
 * POST handler for updating frame size prices
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validatedData = priceUpdateSchema.parse(body);
    
    // Update prices based on provided data
    if (validatedData.productId) {
      // In a real app, look up the product's category and update its specific pricing
      // For simplicity, we'll just update the DEFAULT prices for now
      frameSizePricesStore['DEFAULT'] = {
        ...frameSizePricesStore['DEFAULT'],
        ...validatedData.frameSizePrices
      };
    } else if (validatedData.category) {
      const storeKey = validatedData.category.toUpperCase() === 'KEY HOLDERS' ? 'KEY_HOLDERS' : 'DEFAULT';
      frameSizePricesStore[storeKey] = {
        ...frameSizePricesStore[storeKey],
        ...validatedData.frameSizePrices
      };
    } else {
      // Update default prices if no specific category or product
      frameSizePricesStore['DEFAULT'] = {
        ...frameSizePricesStore['DEFAULT'],
        ...validatedData.frameSizePrices
      };
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FRAME_PRICES_POST]', error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    
    return new NextResponse('Internal error', { status: 500 });
  }
} 