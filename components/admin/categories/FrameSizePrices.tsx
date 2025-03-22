'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FrameSize } from '@prisma/client';
import { formatPrice } from '@/lib/utils';
import { Loader2, Plus, Trash } from 'lucide-react';

interface FrameSizePricesProps {
  categoryId: string;
}

type FrameSizePrice = {
  id: string;
  frameSize: FrameSize;
  price: number;
  categoryId: string;
};

// Map frame size enum values to display names
const frameSizeDisplayNames: Record<string, string> = {
  SMALL: 'Small',
  LARGE: 'Large',
  SIZE_6X6: '6" x 6"',
  SIZE_8_5X8_5: '8.5" x 8.5"',
  SIZE_8_5X12: '8.5" x 12"',
  SIZE_12X12: '12" x 12"',
  SIZE_12X16: '12" x 16"',
  SIZE_16X16: '16" x 16"',
  SIZE_16X20: '16" x 20"',
  SIZE_20X20: '20" x 20"',
  SIZE_20X28: '20" x 28"',
  SIZE_4_5X8_5: '4.5" x 8.5"',
  SIZE_6X12: '6" x 12"',
  SIZE_20X30: '20" x 30"',
  SIZE_24X24: '24" x 24"',
  SIZE_24X30: '24" x 30"',
  SIZE_28X28: '28" x 28"',
  SIZE_28X35: '28" x 35"',
  SIZE_35X35: '35" x 35"',
};

export function FrameSizePrices({ categoryId }: FrameSizePricesProps) {
  const [prices, setPrices] = useState<FrameSizePrice[]>([]);
  const [newFrameSize, setNewFrameSize] = useState<FrameSize | ''>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableFrameSizes, setAvailableFrameSizes] = useState<FrameSize[]>([]);

  // Fetch existing frame size prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/categories/${categoryId}/frame-prices`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch frame prices');
        }
        
        const data = await response.json();
        setPrices(data);
        
        // Calculate available frame sizes (those not already used)
        const usedSizes = new Set(data.map((price: FrameSizePrice) => price.frameSize));
        const availableSizes = Object.values(FrameSize).filter(size => !usedSizes.has(size));
        setAvailableFrameSizes(availableSizes);
      } catch (error) {
        console.error('Error fetching frame prices:', error);
        toast.error('Failed to load frame prices');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrices();
  }, [categoryId]);

  // Add new frame size price
  const handleAddPrice = async () => {
    if (!newFrameSize || !newPrice) {
      toast.error('Please select a frame size and enter a price');
      return;
    }

    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/categories/${categoryId}/frame-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frameSize: newFrameSize,
          price: priceValue,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save frame size price');
      }

      const { result } = await response.json();
      
      // Update state
      setPrices(prev => [...prev, result]);
      
      // Remove the used frame size from available options
      setAvailableFrameSizes(prev => prev.filter(size => size !== newFrameSize));
      
      // Reset form
      setNewFrameSize('');
      setNewPrice('');
      
      toast.success('Frame size price added successfully');
    } catch (error) {
      console.error('Error saving frame size price:', error);
      toast.error('Failed to save frame size price');
    } finally {
      setSubmitting(false);
    }
  };

  // Update existing price
  const handleUpdatePrice = async (price: FrameSizePrice, newPriceValue: number) => {
    if (isNaN(newPriceValue) || newPriceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/frame-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frameSize: price.frameSize,
          price: newPriceValue,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update frame size price');
      }

      const { result } = await response.json();
      
      // Update state
      setPrices(prev => 
        prev.map(p => p.id === result.id ? result : p)
      );
      
      toast.success('Frame size price updated successfully');
    } catch (error) {
      console.error('Error updating frame size price:', error);
      toast.error('Failed to update frame size price');
    }
  };

  // Delete frame size price
  const handleDeletePrice = async (priceId: string, frameSize: FrameSize) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/frame-prices?priceId=${priceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete frame size price');
      }
      
      // Update state
      setPrices(prev => prev.filter(p => p.id !== priceId));
      
      // Add the frame size back to available options
      setAvailableFrameSizes(prev => [...prev, frameSize].sort());
      
      toast.success('Frame size price deleted successfully');
    } catch (error) {
      console.error('Error deleting frame size price:', error);
      toast.error('Failed to delete frame size price');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Frame Size Prices</h3>
        <p className="text-sm text-gray-500 mb-6">
          Manage prices for different frame sizes for this category.
        </p>
      </div>

      {/* Current prices */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Current Prices</h4>
        
        {prices.length === 0 ? (
          <p className="text-sm text-gray-500">No frame size prices set for this category.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prices.map((price) => (
              <div 
                key={price.id} 
                className="flex items-center justify-between space-x-2 p-3 border rounded-md"
              >
                <div>
                  <p className="font-medium">{frameSizeDisplayNames[price.frameSize] || price.frameSize}</p>
                  <p className="text-sm text-gray-500">{price.frameSize}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Input
                    id={`price-${price.id}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    defaultValue={price.price}
                    className="w-24"
                    onBlur={(e) => {
                      const newPrice = parseFloat(e.target.value);
                      if (newPrice !== price.price) {
                        handleUpdatePrice(price, newPrice);
                      }
                    }}
                  />
                  
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeletePrice(price.id, price.frameSize)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new price */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="text-sm font-medium">Add New Price</h4>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="w-full sm:w-1/2">
            <Select 
              value={newFrameSize} 
              onValueChange={(value) => setNewFrameSize(value as FrameSize)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frame size" />
              </SelectTrigger>
              <SelectContent>
                {availableFrameSizes.length === 0 ? (
                  <SelectItem value="" disabled>All frame sizes already added</SelectItem>
                ) : (
                  availableFrameSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {frameSizeDisplayNames[size] || size} ({size})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative flex-1">
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleAddPrice} 
            disabled={submitting || !newFrameSize || !newPrice}
            className="whitespace-nowrap"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Price
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 