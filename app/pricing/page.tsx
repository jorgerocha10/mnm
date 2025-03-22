import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';
import { formatPrice } from '@/lib/services/pricing-browser';
import { getLowestPriceByCategory } from '@/lib/services/pricing';

export default async function PricingPage() {
  // Fetch all categories
  const categories = await prisma.category.findMany();
  
  // Pricing data from fallback
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

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-[#253946] mb-8">Frame Size Prices</h1>
      
      {categories.map((category: Category) => {
        const pricingKey = category.name === 'Key holders' ? 'KEY_HOLDERS' : 'DEFAULT';
        const prices = fallbackFrameSizePrices[pricingKey];
        
        return (
          <div key={category.id} className="mb-12">
            <h2 className="text-xl font-semibold text-[#253946] mb-4">
              {category.name}
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#D2BDA2] text-[#253946]">
                    <th className="px-4 py-2 text-left border">Frame Size</th>
                    <th className="px-4 py-2 text-left border">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(prices).map(([size, price]) => (
                    <tr key={`${category.id}-${size}`} className="border-b hover:bg-[#F7F5F6]">
                      <td className="px-4 py-2 border">{size.replace('SIZE_', '').replace('_', '.')}</td>
                      <td className="px-4 py-2 border">{formatPrice(price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      
      {categories.length === 0 && (
        <div className="bg-[#F7F5F6] p-8 rounded-md">
          <p className="text-center text-[#253946]">No categories found.</p>
        </div>
      )}
    </div>
  );
} 