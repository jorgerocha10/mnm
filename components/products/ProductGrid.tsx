'use client';

import { Product, Category } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLowestPriceByCategory, formatPrice } from '@/lib/services/pricing';

interface ProductWithCategory extends Product {
  category: Category | null;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

interface ProductGridProps {
  products: ProductWithCategory[];
  pagination: PaginationProps;
  currentSort: string;
}

export default function ProductGrid({
  products,
  pagination,
  currentSort,
}: ProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    
    // Keep the current page
    router.push(`/products?${params.toString()}`);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    
    router.push(`/products?${params.toString()}`);
  };
  
  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const { currentPage, totalPages } = pagination;
    
    // Always show first page
    items.push(
      <Button
        key="first"
        variant={currentPage === 1 ? "default" : "outline"}
        className={currentPage === 1 ? "bg-[#A76825] hover:bg-[#8a561e]" : ""}
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        1
      </Button>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <span key="ellipsis-1" className="px-2">
          ...
        </span>
      );
    }
    
    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      
      items.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          className={i === currentPage ? "bg-[#A76825] hover:bg-[#8a561e]" : ""}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <span key="ellipsis-2" className="px-2">
          ...
        </span>
      );
    }
    
    // Always show last page if there are more than 1 page
    if (totalPages > 1) {
      items.push(
        <Button
          key="last"
          variant={currentPage === totalPages ? "default" : "outline"}
          className={currentPage === totalPages ? "bg-[#A76825] hover:bg-[#8a561e]" : ""}
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          {totalPages}
        </Button>
      );
    }
    
    return items;
  };
  
  return (
    <div className="space-y-6">
      {/* Product Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-[#253946]">
          Showing <span className="font-medium">{products.length}</span> of{' '}
          <span className="font-medium">{pagination.totalProducts}</span> products
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-[#253946]">Sort by:</span>
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-[#253946]/70 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-[#253946] font-medium">
                      {formatPrice(getLowestPriceByCategory(product.category?.name))}
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
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-[#253946] mb-2">No products found</h3>
          <p className="text-[#95A7B5]">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="w-10 h-10 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            {generatePaginationItems()}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="w-10 h-10 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 