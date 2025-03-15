import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

// Schema for product creation validation
const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0.01),
  stock: z.number().int().min(0),
  images: z.array(z.string()).min(1),
  categoryId: z.string().optional(),
  frameTypes: z.enum(['PINE', 'DARK']),
  frameSizes: z.enum([
    'SIZE_4_5X8_5',
    'SIZE_6X6',
    'SIZE_6X12',
    'SIZE_8_5X8_5',
    'SIZE_8_5X12',
    'SIZE_12X12',
    'SIZE_12X16',
    'SIZE_16X16',
    'SIZE_16X20',
    'SIZE_20X20',
    'SIZE_20X28'
  ]).optional(),
  slug: z.string(),
});

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

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
    const validatedData = productSchema.parse(body);

    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: {
        slug: validatedData.slug,
      },
    });

    if (existingProduct) {
      return new NextResponse('Product with this slug already exists', { status: 400 });
    }

    // Create product
    const product = await prisma.product.create({
      data: validatedData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    
    return new NextResponse('Internal error', { status: 500 });
  }
} 