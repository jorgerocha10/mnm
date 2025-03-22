import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryName = searchParams.get('category');
  
  if (!categoryName) {
    return NextResponse.json(
      { error: 'Missing required parameter: category' },
      { status: 400 }
    );
  }
  
  try {
    // Find the category by name
    const category = await prisma.category.findFirst({
      where: { name: categoryName },
      include: {
        frameSizePrices: true
      }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: `Category not found: ${categoryName}` },
        { status: 404 }
      );
    }
    
    // Get lowest price from the database
    if (category.frameSizePrices.length > 0) {
      const prices = category.frameSizePrices.map((fsp: any) => Number(fsp.price));
      const lowestPrice = Math.min(...prices);
      
      return NextResponse.json({ 
        price: lowestPrice,
        source: 'database'
      });
    }
    
    return NextResponse.json(
      { error: `No prices found for category: ${categoryName}` },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching lowest price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price from database' },
      { status: 500 }
    );
  }
} 