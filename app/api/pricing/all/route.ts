import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Category, FrameSize } from '@prisma/client';

// Fallback pricing data
const fallbackFrameSizePrices: Record<string, Record<string, number>> = {
  'DEFAULT': {
    'SMALL': 39.99,
    'LARGE': 49.99,
    'SIZE_6X6': 39.99,
    'SIZE_8_5X8_5': 44.99,
    'SIZE_8_5X12': 49.99,
    'SIZE_12X12': 54.99,
    'SIZE_12X16': 59.99,
    'SIZE_16X16': 64.99,
    'SIZE_16X20': 69.99,
    'SIZE_20X20': 74.99,
    'SIZE_20X28': 79.99,
    'SIZE_4_5X8_5': 34.99,
    'SIZE_6X12': 44.99
  },
  'KEY_HOLDERS': {
    'SIZE_4_5X8_5': 29.99,
    'SIZE_6X12': 34.99
  }
};

export async function GET() {
  try {
    // Get all categories
    const categories = await prisma.category.findMany();

    // Format the data for the frontend
    const formattedData = categories.map((category: Category) => {
      const pricingKey = category.name === 'Key holders' ? 'KEY_HOLDERS' : 'DEFAULT';
      const prices = fallbackFrameSizePrices[pricingKey];
      
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        frameSizePrices: Object.entries(prices).map(([frameSize, price]) => ({
          id: `${category.id}-${frameSize}`,
          frameSize: frameSize as FrameSize,
          price: Number(price)
        }))
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing data' },
      { status: 500 }
    );
  }
} 