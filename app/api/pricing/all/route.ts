import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Category, FrameSize, FrameSizePrice } from '@prisma/client';

export async function GET() {
  try {
    // Get all categories with their frame size prices
    const categories = await prisma.category.findMany({
      include: {
        frameSizePrices: true
      }
    });

    // Format the data for the frontend
    const formattedData = categories.map((category: Category & { frameSizePrices: FrameSizePrice[] }) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      frameSizePrices: category.frameSizePrices.map((pricing: FrameSizePrice) => ({
        id: pricing.id,
        frameSize: pricing.frameSize,
        price: Number(pricing.price) // Convert Decimal to number
      }))
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing data' },
      { status: 500 }
    );
  }
} 