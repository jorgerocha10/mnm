import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FrameSize } from '@prisma/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const frameSizeParam = searchParams.get('frameSize');
  const categoryName = searchParams.get('category');
  
  if (!frameSizeParam || !categoryName) {
    return NextResponse.json(
      { error: 'Missing required parameters: frameSize and category' },
      { status: 400 }
    );
  }
  
  try {
    // Convert frameSize to enum
    const frameSize = getFrameSizeEnum(frameSizeParam);
    
    if (!frameSize) {
      return NextResponse.json(
        { error: 'Invalid frame size parameter' },
        { status: 400 }
      );
    }
    
    // Find the category by name
    const category = await prisma.category.findFirst({
      where: { name: categoryName },
      include: {
        frameSizePrices: {
          where: { frameSize }
        }
      }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: `Category not found: ${categoryName}` },
        { status: 404 }
      );
    }
    
    // Get price from the database
    if (category.frameSizePrices.length > 0) {
      return NextResponse.json({ 
        price: Number(category.frameSizePrices[0].price),
        source: 'database'
      });
    }
    
    return NextResponse.json(
      { error: `Price not found for frame size: ${frameSize} in category: ${categoryName}` },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching frame size price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price from database' },
      { status: 500 }
    );
  }
}

function getFrameSizeEnum(frameSizeStr: string): FrameSize | null {
  try {
    return frameSizeStr as FrameSize;
  } catch (e) {
    console.error(`Invalid frame size: ${frameSizeStr}`);
    return null;
  }
} 