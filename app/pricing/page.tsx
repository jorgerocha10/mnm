import { prisma } from '@/lib/prisma';
import { FrameSizePrice, Category } from '@prisma/client';
import { formatPrice } from '@/lib/services/pricing-browser';

interface CategoryWithPrices extends Category {
  frameSizePrices: FrameSizePrice[];
}

export default async function PricingPage() {
  // Fetch all categories with frame size prices
  const categories = await prisma.category.findMany({
    include: {
      frameSizePrices: true
    }
  }) as CategoryWithPrices[];

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-[#253946] mb-8">Frame Size Prices (Database Values)</h1>
      
      {categories.map((category: CategoryWithPrices) => (
        <div key={category.id} className="mb-12">
          <h2 className="text-xl font-semibold text-[#253946] mb-4">
            {category.name}
          </h2>
          
          {category.frameSizePrices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#D2BDA2] text-[#253946]">
                    <th className="px-4 py-2 text-left border">Frame Size</th>
                    <th className="px-4 py-2 text-left border">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {category.frameSizePrices.map((price: FrameSizePrice) => (
                    <tr key={`${category.id}-${price.frameSize}`} className="border-b hover:bg-[#F7F5F6]">
                      <td className="px-4 py-2 border">{price.frameSize}</td>
                      <td className="px-4 py-2 border">{formatPrice(parseFloat(price.price.toString()))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#95A7B5]">No frame size prices found for this category.</p>
          )}
        </div>
      ))}
      
      {categories.length === 0 && (
        <div className="bg-[#F7F5F6] p-8 rounded-md">
          <p className="text-center text-[#253946]">No frame size prices found in the database.</p>
        </div>
      )}
    </div>
  );
} 