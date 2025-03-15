import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

// Schema for product update validation
const productUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(0.01).optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).min(1).optional(),
  categoryId: z.string().optional().nullable(),
  frameTypes: z.enum(['PINE', 'DARK']).optional(),
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
  ]).optional().nullable(),
  slug: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
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
    const validatedData = productUpdateSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // If slug is being updated, check if it's unique
    if (validatedData.slug && validatedData.slug !== product.slug) {
      const existingProduct = await prisma.product.findUnique({
        where: {
          slug: validatedData.slug,
        },
      });

      if (existingProduct && existingProduct.id !== params.id) {
        return new NextResponse('Product with this slug already exists', { status: 400 });
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: {
        id: params.id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // Delete product
    await prisma.product.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Error' }), { status: 500 });
  }
} 