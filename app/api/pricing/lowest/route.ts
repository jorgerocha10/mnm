import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categorySlug = searchParams.get('category');
  
  if (!categorySlug) {
    return NextResponse.json(
      { error: 'Missing required parameter: category' },
      { status: 400 }
    );
  }
  
  try {
    // Find the category by slug
    const category = await prisma.category.findFirst({
      where: { slug: categorySlug }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Get appropriate pricing table based on category
    const pricingKey = category.name === 'Key holders' ? 'KEY_HOLDERS' : 'DEFAULT';
    const prices = Object.values(fallbackFrameSizePrices[pricingKey]);
    
    // Find the lowest price
    let lowestPrice = Math.min(...prices);
    
    return NextResponse.json({ 
      lowestPrice,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      }
    });
  } catch (error) {
    console.error('Error fetching lowest price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lowest price' },
      { status: 500 }
    );
  }
} 