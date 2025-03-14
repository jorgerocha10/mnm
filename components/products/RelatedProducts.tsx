'use client';

import { Product, Category } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface ProductWithCategory extends Product {
  category: Category | null;
}

interface RelatedProductsProps {
  products: ProductWithCategory[];
  categoryName: string;
}

export default function RelatedProducts({ products, categoryName }: RelatedProductsProps) {
  if (products.length === 0) return null;
  
  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold text-[#253946] mb-6">More from {categoryName}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group">
            <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={product.images[0] || "https://placehold.co/600x400/png"}
                  alt={product.name}
                  fill
                  style={{ objectFit: "cover" }}
                  className="group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-[#253946] mb-2 group-hover:text-[#A76825] transition-colors">
                  {product.name}
                </h3>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-[#253946] font-medium">
                    ${product.price.toString()}
                  </span>
                  <span className="text-[#95A7B5] text-sm">
                    {product.category?.name}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
} 