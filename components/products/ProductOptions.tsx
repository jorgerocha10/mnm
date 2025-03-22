'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, FrameSize, FrameType } from '@prisma/client';
import { MapPin, Map, PenLine, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCartStore } from '@/lib/store/cart-store';
import InteractiveMap from './InteractiveMap';
import { getFrameSizePrice, formatPrice } from '@/lib/services/pricing-browser';
import { frameSizeLabels, frameTypeLabels } from '@/lib/constants';

// All available frame types
const allFrameTypes = ['PINE', 'DARK'];

// Get all available frame sizes for the dropdown
const allFrameSizes = [
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

interface ProductOptionsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    images: string[];
    stock: number;
    frameTypes: string | string[];
    frameSizes: string | string[];
    createdAt: string;
    updatedAt: string;
    categoryId: string | null;
    category?: {
      id: string;
      name: string;
      slug: string;
      image: string | null;
      createdAt: string;
      updatedAt: string;
    } | null;
    reviews: {
      id: string;
      rating: number;
      comment: string;
      customerName: string;
      productId: string;
      createdAt: string;
    }[];
  };
}

export default function ProductOptions({ product }: ProductOptionsProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  // Get available frame sizes based on category
  const getAvailableFrameSizes = () => {
    if (product.category?.name === 'Key holders') {
      return ['SIZE_4_5X8_5', 'SIZE_6X12'];
    }
    return allFrameSizes;
  };

  // Frame type and size options
  const availableFrameSizes = getAvailableFrameSizes();
  const [frameSize, setFrameSize] = useState<string>(availableFrameSizes[0]);
  const [frameType, setFrameType] = useState<string>(
    Array.isArray(product.frameTypes) ? product.frameTypes[0] : product.frameTypes
  );
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [pricingLoaded, setPricingLoaded] = useState<boolean>(false);
  const [frameSizePrices, setFrameSizePrices] = useState<Record<string, number>>({});
  const [locationType, setLocationType] = useState<'address' | 'coordinates'>('address');
  const [address, setAddress] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [engravingText, setEngravingText] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapOrientation, setMapOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  
  // Fetch price on initial load
  useEffect(() => {
    const fetchInitialPrice = async () => {
      try {
        const price = await getFrameSizePrice(frameSize, product.category?.name);
        setCurrentPrice(price);
        setPricingLoaded(true);
      } catch (error) {
        console.error('Error fetching initial price:', error);
        setCurrentPrice(0);
        setPricingLoaded(true);
      }
    };
    
    fetchInitialPrice();
  }, [frameSize, product.category?.name]);
  
  // Fetch prices for all available frame sizes
  useEffect(() => {
    const fetchAllPrices = async () => {
      try {
        const prices: Record<string, number> = {};
        
        for (const size of availableFrameSizes) {
          const price = await getFrameSizePrice(size, product.category?.name);
          prices[size] = price;
        }
        
        setFrameSizePrices(prices);
      } catch (error) {
        console.error('Error fetching all prices:', error);
      }
    };
    
    fetchAllPrices();
  }, [availableFrameSizes, product.category?.name]);
  
  // Check if product is in Multi layers or Bas relief category
  const allowRotation = product.category?.name === 'Multi layers' || product.category?.name === 'Bas Relief';
  
  // Determine if the current frame size is square
  const isSquare = [
    'SIZE_6X6', 
    'SIZE_8_5X8_5', 
    'SIZE_12X12', 
    'SIZE_16X16', 
    'SIZE_20X20'
  ].includes(frameSize);
  
  // Handle frame size change
  const handleFrameSizeChange = (size: string) => {
    setFrameSize(size);
    
    // Update price asynchronously
    const updatePrice = async () => {
      try {
        if (frameSizePrices[size]) {
          setCurrentPrice(frameSizePrices[size]);
        } else {
          const price = await getFrameSizePrice(size, product.category?.name);
          setCurrentPrice(price);
          
          // Update the prices map
          setFrameSizePrices(prev => ({
            ...prev,
            [size]: price
          }));
        }
      } catch (error) {
        console.error('Error updating price:', error);
      }
    };
    
    updatePrice();
  };
  
  // Handle location selection from map
  const handleLocationSelect = (location: {
    address?: string;
    coordinates: { lat: number; lng: number };
    zoom: number;
  }) => {
    if (location.address) {
      setAddress(location.address);
      setLocationType('address');
    }
    
    setLatitude(location.coordinates.lat.toString());
    setLongitude(location.coordinates.lng.toString());
    setMapZoom(location.zoom);
  };
  
  // Handle orientation change
  const handleOrientationChange = (newOrientation: 'horizontal' | 'vertical') => {
    setMapOrientation(newOrientation);
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    // Validate location
    if (locationType === 'address' && !address) {
      toast.error('Please enter a location address.');
      return;
    }
    
    if (locationType === 'coordinates' && (!latitude || !longitude)) {
      toast.error('Please enter both latitude and longitude.');
      return;
    }
    
    // Create cart item
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: currentPrice,
      image: product.images[0] || '',
      quantity,
      options: {
        frameSize,
        frameType,
        location: locationType === 'address' ? address : `${latitude},${longitude}`,
        locationType,
        engravingText,
        mapZoom,
        mapOrientation: !isSquare && allowRotation ? mapOrientation : undefined,
      }
    };
    
    // Add to cart
    addItem(cartItem);
    
    // Show confirmation toast
    toast.success(`${product.name} has been added to your cart.`);
  };
  
  // Handle buy now
  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };
  
  // Handle quantity change
  const updateQuantity = (value: number) => {
    if (value < 1) return;
    if (value > 10) return;
    setQuantity(value);
  };
  
  return (
    <div className="space-y-6">
      {/* Price Display */}
      <div className="text-2xl font-semibold text-[#253946]">
        {pricingLoaded ? formatPrice(currentPrice) : 'Loading price...'}
      </div>
      
      {/* Frame Size Selection */}
      <div>
        <h3 className="text-sm font-medium text-[#253946] mb-2">Frame Size</h3>
        <Select 
          value={frameSize} 
          onValueChange={handleFrameSizeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a frame size" />
          </SelectTrigger>
          <SelectContent>
            {availableFrameSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {frameSizeLabels[size]} 
                {frameSizePrices[size] ? ` - ${formatPrice(frameSizePrices[size])}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Frame Type Selection */}
      <div>
        <h3 className="text-sm font-medium text-[#253946] mb-2">Frame Style</h3>
        <Select 
          value={frameType} 
          onValueChange={setFrameType}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a frame style" />
          </SelectTrigger>
          <SelectContent>
            {allFrameTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {frameTypeLabels[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Location Input */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="w-4 h-4 text-[#A76825]" />
          <h3 className="text-sm font-medium text-[#253946]">Location</h3>
        </div>
        
        {/* Interactive Map */}
        <div className="mb-6">
          <InteractiveMap
            frameType={frameType}
            frameSize={frameSize}
            initialAddress={address}
            initialCoordinates={latitude && longitude ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : undefined}
            onLocationSelect={handleLocationSelect}
            showRotate={allowRotation}
            orientation={mapOrientation}
            onOrientationChange={handleOrientationChange}
          />
        </div>
        
        <Tabs 
          value={locationType} 
          onValueChange={(value) => setLocationType(value as 'address' | 'coordinates')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="address" className="space-y-4">
            <div>
              <Label htmlFor="address">Enter Location Address</Label>
              <Input
                id="address"
                placeholder="e.g. 123 Main St, City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="coordinates" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  placeholder="e.g. 40.7128"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="e.g. -74.0060"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Engraving Text */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <PenLine className="w-4 h-4 text-[#A76825]" />
          <h3 className="text-sm font-medium text-[#253946]">Personalization (Optional)</h3>
        </div>
        
        <Textarea
          placeholder="Add custom engraving text (max 50 characters)"
          value={engravingText}
          onChange={(e) => setEngravingText(e.target.value.slice(0, 50))}
          maxLength={50}
          className="resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-[#95A7B5]">
            {engravingText.length}/50 characters
          </span>
        </div>
      </div>
      
      <Separator className="my-4 bg-[#D2BDA2]/30" />
      
      {/* Quantity and Add to Cart */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center border border-[#95A7B5] rounded-md">
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-2"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <Input
            type="number"
            min="1"
            max="10"
            value={quantity}
            onChange={(e) => updateQuantity(parseInt(e.target.value))}
            className="h-9 w-12 text-center border-0"
          />
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-2"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={quantity >= 10}
          >
            +
          </Button>
        </div>
        
        <div className="flex flex-1 gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-[#95A7B5] text-[#253946] hover:bg-[#95A7B5]/10"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
          <Button
            type="button"
            className="flex-1 bg-[#A76825] hover:bg-[#8a561e] text-white"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
} 