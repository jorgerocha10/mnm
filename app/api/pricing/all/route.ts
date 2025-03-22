import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Category, FrameSizePrice } from '@prisma/client';

export async function GET() {
  try {
    // Get all categories
    const categories = await prisma.category.findMany({
      include: {
        frameSizePrices: true
      }
    });

    // Format the data for display
    const formattedData = categories.map((category: Category & { frameSizePrices: FrameSizePrice[] }) => ({
      categoryName: category.name,
      categorySlug: category.slug,
      prices: category.frameSizePrices.map((price: FrameSizePrice) => ({
        frameSize: price.frameSize,
        price: parseFloat(price.price.toString())
      }))
    }));

    return NextResponse.json({ 
      data: formattedData,
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching frame size prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices from database' },
      { status: 500 }
    );
  }
} 