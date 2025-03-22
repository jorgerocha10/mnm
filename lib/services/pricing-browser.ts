// Fallback prices for when API is unavailable
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
 * Get price for a specific frame size based on category from the API
 * @param frameSize The frame size to get price for
 * @param categoryName The product category name
 * @returns The price for the given frame size and category
 */
export async function getFrameSizePrice(frameSize: string, categoryName?: string | null): Promise<number> {
  try {
    // Default category if none provided
    const category = categoryName || 'City Maps';
    
    // Build API URL
    const url = `/api/pricing/frame-size?frameSize=${encodeURIComponent(frameSize)}&category=${encodeURIComponent(category)}`;
    
    // Fetch from API
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      return data.price;
    } else {
      console.warn('API failed to retrieve price, using fallback');
      
      // Use fallback if API fails
      if (categoryName === 'Key holders' && fallbackFrameSizePrices['KEY_HOLDERS'][frameSize]) {
        return fallbackFrameSizePrices['KEY_HOLDERS'][frameSize];
      }
      
      return fallbackFrameSizePrices['DEFAULT'][frameSize] || 0;
    }
  } catch (error) {
    console.error('Error fetching frame size price:', error);
    
    // Use fallback in case of error
    if (categoryName === 'Key holders' && fallbackFrameSizePrices['KEY_HOLDERS'][frameSize]) {
      return fallbackFrameSizePrices['KEY_HOLDERS'][frameSize];
    }
    
    return fallbackFrameSizePrices['DEFAULT'][frameSize] || 0;
  }
}

/**
 * Get the lowest price for a given category from the API
 * @param categoryName The product category name
 * @returns The lowest price available for the category
 */
export async function getLowestPriceByCategory(categoryName?: string | null): Promise<number> {
  try {
    // Default category if none provided
    const category = categoryName || 'City Maps';
    
    // Build API URL
    const url = `/api/pricing/lowest?category=${encodeURIComponent(category)}`;
    
    // Fetch from API
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      return data.price;
    } else {
      console.warn('API failed to retrieve lowest price, using fallback');
      
      // Use fallback if API fails
      let prices = fallbackFrameSizePrices['DEFAULT'];
      
      if (categoryName === 'Key holders') {
        prices = fallbackFrameSizePrices['KEY_HOLDERS'];
      }
      
      return Math.min(...Object.values(prices));
    }
  } catch (error) {
    console.error('Error fetching lowest price:', error);
    
    // Use fallback in case of error
    let prices = fallbackFrameSizePrices['DEFAULT'];
    
    if (categoryName === 'Key holders') {
      prices = fallbackFrameSizePrices['KEY_HOLDERS'];
    }
    
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