// Pricing service for frame size prices

import { PrismaClient, FrameSize } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Fallback prices only used when database access fails
const fallbackFrameSizePrices: Record<string, Record<string, number>> = {
  'KEY_HOLDERS': {
    'SIZE_4_5X8_5': 104.34,
    'SIZE_6X12': 184.43,
  },
  'DEFAULT': {
    'SIZE_6X6': 179.00,
    'SIZE_8_5X8_5': 224.33,
    'SIZE_8_5X12': 239.58,
    'SIZE_12X12': 268.92,
    'SIZE_12X16': 299.24,
    'SIZE_16X16': 388.21,
    'SIZE_16X20': 445.62,
    'SIZE_20X20': 564.22,
    'SIZE_20X30': 674.46,
    'SIZE_24X24': 694.80,
    'SIZE_24X30': 751.28,
    'SIZE_28X28': 751.28,
    'SIZE_28X35': 934.27,
    'SIZE_35X35': 1172.84,
    'SMALL': 224.33,
    'LARGE': 299.61,
  }
};

/**
 * Get price for a specific frame size based on category from the database
 * @param frameSize The frame size to get price for
 * @param categoryName The product category name
 * @returns The price for the given frame size and category
 */
export async function getFrameSizePrice(frameSize: string, categoryName?: string | null): Promise<number> {
  try {
    // Convert category name to slug format for database query
    let catName = 'City Maps'; // Default category
    if (categoryName) {
      catName = categoryName;
    }
    
    // Find the category and related frame size price
    const category = await prisma.category.findFirst({
      where: { name: catName },
      include: {
        frameSizePrices: {
          where: { frameSize: frameSize as any }
        }
      }
    });
    
    if (category && category.frameSizePrices.length > 0) {
      // Return the price from database
      return Number(category.frameSizePrices[0].price);
    }
    
    // If price not found in database, use fallback
    console.warn(`Price not found in database for ${frameSize} in ${categoryName}, using fallback.`);
    if (categoryName === 'Key holders' && fallbackFrameSizePrices['KEY_HOLDERS'][frameSize]) {
      return fallbackFrameSizePrices['KEY_HOLDERS'][frameSize];
    }
    
    return fallbackFrameSizePrices['DEFAULT'][frameSize] || 0;
  } catch (error) {
    console.error('Error fetching frame size price from database:', error);
    // Use fallback in case of database error
    if (categoryName === 'Key holders' && fallbackFrameSizePrices['KEY_HOLDERS'][frameSize]) {
      return fallbackFrameSizePrices['KEY_HOLDERS'][frameSize];
    }
    
    return fallbackFrameSizePrices['DEFAULT'][frameSize] || 0;
  }
}

/**
 * Get the lowest price for a given category from the database
 * @param categoryName The product category name
 * @returns The lowest price available for the category
 */
export async function getLowestPriceByCategory(categoryName?: string | null): Promise<number> {
  try {
    // Convert category name for database query
    let catName = 'City Maps'; // Default category
    if (categoryName) {
      catName = categoryName;
    }
    
    // Find the category and all related frame size prices
    const category = await prisma.category.findFirst({
      where: { name: catName },
      include: {
        frameSizePrices: true
      }
    });
    
    if (category && category.frameSizePrices.length > 0) {
      // Get all prices and find the lowest one
      const prices = category.frameSizePrices.map((fsp: any) => Number(fsp.price));
      return Math.min(...prices);
    }
    
    // If prices not found in database, use fallback
    console.warn(`Prices not found in database for ${categoryName}, using fallback.`);
    let prices = fallbackFrameSizePrices['DEFAULT'];
    
    if (categoryName === 'Key holders') {
      prices = fallbackFrameSizePrices['KEY_HOLDERS'];
    }
    
    // Find the lowest price in the fallback price map
    return Math.min(...Object.values(prices));
  } catch (error) {
    console.error('Error fetching lowest price from database:', error);
    // Use fallback in case of database error
    let prices = fallbackFrameSizePrices['DEFAULT'];
    
    if (categoryName === 'Key holders') {
      prices = fallbackFrameSizePrices['KEY_HOLDERS'];
    }
    
    // Find the lowest price in the fallback price map
    return Math.min(...Object.values(prices));
  }
}

/**
 * Format price for display
 * @param price The price to format
 * @returns Formatted price string in CAD
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2
  }).format(price);
} 