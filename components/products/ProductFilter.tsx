'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Category } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { FilterIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ProductFilterProps {
  categories: Category[];
  selectedCategory?: string;
}

export default function ProductFilter({
  categories,
  selectedCategory,
}: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Apply filters function
  const applyFilters = (params: URLSearchParams) => {
    // Reset to page 1 when filters change
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };
  
  // Handle category change
  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (categorySlug === selectedCategory) {
      params.delete('category');
    } else {
      params.set('category', categorySlug);
    }
    
    applyFilters(params);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    params.delete('category');
    params.delete('page');
    
    // Keep search query if exists
    const searchQuery = params.get('search');
    const sortValue = params.get('sort');
    
    params.delete('search');
    params.delete('sort');
    
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    if (sortValue) {
      params.set('sort', sortValue);
    }
    
    router.push(`/products?${params.toString()}`);
  };
  
  // Calculate if any filters are active
  const hasActiveFilters = Boolean(selectedCategory);
  
  // Desktop filter component
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg text-[#253946]">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            className="text-[#95A7B5] hover:text-[#A76825]"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        )}
      </div>
      
      <Separator />
      
      {/* Categories */}
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-2 text-[#253946]">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <Checkbox
                    id={`category-${category.slug}`}
                    checked={category.slug === selectedCategory}
                    onCheckedChange={() => handleCategoryChange(category.slug)}
                    className="text-[#A76825] border-[#95A7B5]"
                  />
                  <Label
                    htmlFor={`category-${category.slug}`}
                    className="ml-2 text-[#253946] cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
  
  return (
    <>
      {/* Desktop Filter */}
      <div className="hidden lg:block sticky top-24">
        <FilterContent />
      </div>
      
      {/* Mobile Filter */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <FilterIcon className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 px-4 pb-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
} 