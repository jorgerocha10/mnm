'use client';

import { useState, useEffect } from 'react';
import { Category } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { frameSizeLabels } from '@/lib/constants';

interface FramePricesManagerProps {
  categories: Category[];
}

export function FramePricesManager({ categories }: FramePricesManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('default');
  const [frameSizePrices, setFrameSizePrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Fetch prices on component mount and when selected category changes
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true);
      try {
        const url = selectedCategory === 'default' 
          ? '/api/products/frame-prices' 
          : `/api/products/frame-prices?category=${categories.find(c => c.id === selectedCategory)?.name}`;
          
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch frame prices');
        }
        
        const data = await response.json();
        // If default is selected, use the DEFAULT prices, otherwise use the category-specific prices
        const prices = selectedCategory === 'default' ? data.DEFAULT : data;
        setFrameSizePrices(prices);
      } catch (error) {
        console.error('Error fetching frame prices:', error);
        toast.error('Failed to load frame prices');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrices();
  }, [selectedCategory, categories]);
  
  // Handle price changes
  const handlePriceChange = (frameSize: string, price: string) => {
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      setFrameSizePrices(prev => ({
        ...prev,
        [frameSize]: numericPrice
      }));
    }
  };
  
  // Save updated prices
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        category: selectedCategory === 'default' ? undefined : categories.find(c => c.id === selectedCategory)?.name,
        frameSizePrices
      };
      
      const response = await fetch('/api/products/frame-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update frame prices');
      }
      
      toast.success('Frame prices updated successfully');
    } catch (error) {
      console.error('Error saving frame prices:', error);
      toast.error('Failed to update frame prices');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Format price for display
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(price);
  };
  
  // Get available frame sizes based on selected category
  const getAvailableFrameSizes = (): string[] => {
    // Key holders have special sizes
    if (selectedCategory !== 'default' && 
        categories.find(c => c.id === selectedCategory)?.name === 'Key holders') {
      return ['SIZE_4_5X8_5', 'SIZE_6X12'];
    }
    
    // All other categories use standard sizes
    return [
      'SIZE_6X6',
      'SIZE_8_5X8_5',
      'SIZE_8_5X12',
      'SIZE_12X12',
      'SIZE_12X16',
      'SIZE_16X16',
      'SIZE_16X20',
      'SIZE_20X20',
      'SIZE_20X28'
    ];
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frame Size Pricing</CardTitle>
        <CardDescription>
          Set prices for different frame sizes by category
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs 
          value={selectedCategory} 
          onValueChange={setSelectedCategory}
          className="w-full"
        >
          <TabsList className="mb-4 w-full flex overflow-x-auto">
            <TabsTrigger value="default">Default</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#A76825]" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getAvailableFrameSizes().map((frameSize) => (
                    <div key={frameSize} className="space-y-2">
                      <Label htmlFor={`price-${frameSize}`}>
                        {frameSizeLabels[frameSize]}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id={`price-${frameSize}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={frameSizePrices[frameSize] || 0}
                          onChange={(e) => handlePriceChange(frameSize, e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground w-24">
                          {formatPrice(frameSizePrices[frameSize] || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    className="bg-[#A76825] hover:bg-[#8a561e]"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Save Prices'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 