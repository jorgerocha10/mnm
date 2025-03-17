// Pricing service for frame size prices

// Default prices for each frame size by category
export const frameSizePrices: Record<string, Record<string, number>> = {
  // Key holder maps
  'KEY_HOLDERS': {
    'SIZE_4_5X8_5': 104.34,
    'SIZE_6X12': 184.43,
  },
  // Regular maps
  'DEFAULT': {
    'SIZE_6X6': 179.00,
    'SIZE_8_5X8_5': 224.33,
    'SIZE_8_5X12': 254.44,
    'SIZE_12X12': 299.61,
    'SIZE_12X16': 359.83,
    'SIZE_16X16': 405.00,
    'SIZE_16X20': 450.17,
    'SIZE_20X20': 510.39,
    'SIZE_20X28': 600.72,
    'SIZE_28X28': 751.28,
    'SIZE_28X35': 1007.23,
    'SIZE_35X35': 1172.84,
    // Legacy mappings
    'SMALL': 224.33,
    'LARGE': 299.61,
  }
};

/**
 * Get price for a specific frame size based on category
 * @param frameSize The frame size to get price for
 * @param categoryName The product category name
 * @returns The price for the given frame size and category
 */
export function getFrameSizePrice(frameSize: string, categoryName?: string | null): number {
  if (categoryName === 'Key holders' && frameSizePrices['KEY_HOLDERS'][frameSize]) {
    return frameSizePrices['KEY_HOLDERS'][frameSize];
  }
  
  return frameSizePrices['DEFAULT'][frameSize] || 0;
}

/**
 * Get the lowest price for a given category
 * @param categoryName The product category name
 * @returns The lowest price available for the category
 */
export function getLowestPriceByCategory(categoryName?: string | null): number {
  let prices: Record<string, number> = frameSizePrices['DEFAULT'];
  
  if (categoryName === 'Key holders') {
    prices = frameSizePrices['KEY_HOLDERS'];
  }
  
  // Find the lowest price in the price map
  return Math.min(...Object.values(prices));
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