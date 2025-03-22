// Pricing service for frame size prices

import { PrismaClient, FrameSize } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Fallback prices - used when DB access fails or for products without prices
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
    
    // Convert frameSize string to FrameSize enum value if possible
    let frameSizeEnum: FrameSize;
    try {
      frameSizeEnum = frameSize as FrameSize;
    } catch (e) {
      console.warn(`Invalid frame size: ${frameSize}, using fallback price`);
      // Return fallback price for invalid frame sizes
      if (categoryName === 'Key holders' && fallbackFrameSizePrices['KEY_HOLDERS'][frameSize]) {
        return fallbackFrameSizePrices['KEY_HOLDERS'][frameSize];
      }
      return fallbackFrameSizePrices['DEFAULT'][frameSize] || 0;
    }
    
    // Find the category
    const category = await prisma.category.findFirst({
      where: { name: catName }
    });
    
    if (!category) {
      console.warn(`Category not found: ${catName}, using fallback price`);
      // If category not found, use fallback
      if (categoryName === 'Key holders' && fallbackFrameSizePrices['KEY_HOLDERS'][frameSize]) {
        return fallbackFrameSizePrices['KEY_HOLDERS'][frameSize];
      }
      return fallbackFrameSizePrices['DEFAULT'][frameSize] || 0;
    }
    
    // Use the appropriate pricing table based on category
    const pricingKey = category.name === 'Key holders' ? 'KEY_HOLDERS' : 'DEFAULT';
    return fallbackFrameSizePrices[pricingKey][frameSize] || 0;
  } catch (error) {
    console.error('Error fetching frame size price:', error);
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
export async function getLowestPriceByCategory(categoryName: string): Promise<number> {
  try {
    // Find the category
    const category = await prisma.category.findFirst({
      where: { name: categoryName }
    });
    
    if (!category) {
      console.warn(`Category not found: ${categoryName}, using fallback lowest price`);
      // If category not found, use fallback
      if (categoryName === 'Key holders') {
        let prices = Object.values(fallbackFrameSizePrices['KEY_HOLDERS']);
        return Math.min(...prices);
      }
      
      let prices = Object.values(fallbackFrameSizePrices['DEFAULT']);
      return Math.min(...prices);
    }
    
    // Use the appropriate pricing table based on category
    const pricingKey = category.name === 'Key holders' ? 'KEY_HOLDERS' : 'DEFAULT';
    const prices = Object.values(fallbackFrameSizePrices[pricingKey]);
    
    return Math.min(...prices);
  } catch (error) {
    console.error('Error fetching lowest price:', error);
    // Use fallback in case of database error
    if (categoryName === 'Key holders') {
      let prices = Object.values(fallbackFrameSizePrices['KEY_HOLDERS']);
      return Math.min(...prices);
    }
    
    let prices = Object.values(fallbackFrameSizePrices['DEFAULT']);
    return Math.min(...prices);
  }
}

/**
 * Format price for display
 * @param price The price to format
 * @returns Formatted price string in CAD
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
} 