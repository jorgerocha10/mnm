import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { FrameSize } from '@prisma/client';

interface Params {
  id: string;
}

// Validation schema for frame price data
const framePriceSchema = z.object({
  frameSize: z.nativeEnum(FrameSize),
  price: z.number().positive()
});

export async function POST(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  try {
    const params = await paramsPromise;
    const { id } = params;
    
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = framePriceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { frameSize, price } = validation.data;

    // Check if the category exists
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if a price for this frame size already exists
    const existingPrice = await prisma.frameSizePrice.findFirst({
      where: {
        categoryId: id,
        frameSize
      }
    });

    let result;
    
    if (existingPrice) {
      // Update existing price
      result = await prisma.frameSizePrice.update({
        where: { id: existingPrice.id },
        data: { price }
      });
    } else {
      // Create new price
      result = await prisma.frameSizePrice.create({
        data: {
          categoryId: id,
          frameSize,
          price
        }
      });
    }

    return NextResponse.json({
      message: 'Frame size price saved successfully',
      result
    });
  } catch (error) {
    console.error('Error adding frame size price:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  try {
    const params = await paramsPromise;
    const { id } = params;

    // Check if the category exists
    const category = await prisma.category.findUnique({ 
      where: { id }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get all frame size prices for this category
    const frameSizePrices = await prisma.frameSizePrice.findMany({
      where: { categoryId: id }
    });

    return NextResponse.json(frameSizePrices);
  } catch (error) {
    console.error('Error fetching frame prices:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  try {
    const params = await paramsPromise;
    const { id } = params;
    
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const framePriceId = searchParams.get('priceId');

    if (!framePriceId) {
      return NextResponse.json(
        { error: 'Frame price ID is required' },
        { status: 400 }
      );
    }

    // Verify that this price belongs to the category
    const existingPrice = await prisma.frameSizePrice.findFirst({
      where: {
        id: framePriceId,
        categoryId: id
      }
    });

    if (!existingPrice) {
      return NextResponse.json(
        { error: 'Frame price not found for this category' },
        { status: 404 }
      );
    }

    // Delete the frame size price
    await prisma.frameSizePrice.delete({
      where: { id: framePriceId }
    });

    return NextResponse.json({
      message: 'Frame size price deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting frame price:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 