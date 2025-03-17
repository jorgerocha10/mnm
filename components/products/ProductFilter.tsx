'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Category } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, FilterIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const FRAME_TYPES = [
  { value: 'pine', label: 'Pine Wood' },
  { value: 'dark', label: 'Dark Wood' },
];

const FRAME_SIZES = [
  { value: '8x8', label: '8" x 8"' },
  { value: '10x10', label: '10" x 10"' },
];

interface ProductFilterProps {
  categories: Category[];
  selectedCategory?: string;
  minPrice?: string;
  maxPrice?: string;
  selectedFrameType?: string;
  selectedFrameSize?: string;
}

export default function ProductFilter({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  selectedFrameType,
  selectedFrameSize,
}: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Price range state
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 200,
  ]);
  
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
  
  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };
  
  // Apply price range after slider interaction ends
  const handlePriceRangeApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    params.set('minPrice', priceRange[0].toString());
    params.set('maxPrice', priceRange[1].toString());
    
    applyFilters(params);
  };
  
  // Handle frame type change
  const handleFrameTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === selectedFrameType) {
      params.delete('frameType');
    } else {
      params.set('frameType', value);
    }
    
    applyFilters(params);
  };
  
  // Handle frame size change
  const handleFrameSizeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === selectedFrameSize) {
      params.delete('frameSize');
    } else {
      params.set('frameSize', value);
    }
    
    applyFilters(params);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    params.delete('category');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('frameType');
    params.delete('frameSize');
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
    
    // Reset price range state
    setPriceRange([0, 200]);
  };
  
  // Calculate if any filters are active
  const hasActiveFilters = Boolean(
    selectedCategory || 
    minPrice || 
    maxPrice || 
    selectedFrameType || 
    selectedFrameSize
  );
  
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
      
      <Separator />
      
      {/* Price Range */}
      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2 text-[#253946]">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={priceRange}
                min={0}
                max={200}
                step={5}
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                onValueCommit={handlePriceRangeApply}
                className="my-6"
              />
              <div className="flex justify-between items-center">
                <span className="text-[#253946]">${priceRange[0]}</span>
                <ArrowRight className="h-4 w-4 text-[#95A7B5]" />
                <span className="text-[#253946]">${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Separator />
      
      {/* Frame Type */}
      <Accordion type="single" collapsible defaultValue="frameType">
        <AccordionItem value="frameType" className="border-none">
          <AccordionTrigger className="py-2 text-[#253946]">Frame Type</AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={selectedFrameType}
              onValueChange={handleFrameTypeChange}
              className="space-y-2"
            >
              {FRAME_TYPES.map((type) => (
                <div key={type.value} className="flex items-center">
                  <RadioGroupItem
                    value={type.value}
                    id={`frame-type-${type.value}`}
                    className="text-[#A76825]"
                  />
                  <Label
                    htmlFor={`frame-type-${type.value}`}
                    className="ml-2 text-[#253946] cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Separator />
      
      {/* Frame Size */}
      <Accordion type="single" collapsible defaultValue="frameSize">
        <AccordionItem value="frameSize" className="border-none">
          <AccordionTrigger className="py-2 text-[#253946]">Frame Size</AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={selectedFrameSize}
              onValueChange={handleFrameSizeChange}
              className="space-y-2"
            >
              {FRAME_SIZES.map((size) => (
                <div key={size.value} className="flex items-center">
                  <RadioGroupItem
                    value={size.value}
                    id={`frame-size-${size.value}`}
                    className="text-[#A76825]"
                  />
                  <Label
                    htmlFor={`frame-size-${size.value}`}
                    className="ml-2 text-[#253946] cursor-pointer"
                  >
                    {size.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
} 