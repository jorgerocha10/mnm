'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@prisma/client';
import { MapPin, Map, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { toast } from "sonner";
import { useCartStore } from '@/lib/store/cart-store';
import InteractiveMap from './InteractiveMap';

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
  
  // Frame type and size options
  const frameSizes = Array.isArray(product.frameSizes) 
    ? product.frameSizes 
    : [product.frameSizes];
  
  const frameTypes = Array.isArray(product.frameTypes)
    ? product.frameTypes
    : [product.frameTypes];
  
  // Form state
  const [frameSize, setFrameSize] = useState<string>(frameSizes[0]);
  const [frameType, setFrameType] = useState<string>(frameTypes[0]);
  const [locationType, setLocationType] = useState<'address' | 'coordinates'>('address');
  const [address, setAddress] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [engravingText, setEngravingText] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [mapZoom, setMapZoom] = useState(13);
  
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
      price: Number(product.price),
      image: product.images[0] || '',
      quantity,
      options: {
        frameSize,
        frameType,
        location: locationType === 'address' ? address : `${latitude},${longitude}`,
        locationType,
        engravingText,
        mapZoom,
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
      {/* Frame Size Selection */}
      <div>
        <h3 className="text-sm font-medium text-[#253946] mb-2">Frame Size</h3>
        <RadioGroup 
          value={frameSize} 
          onValueChange={setFrameSize} 
          className="flex flex-wrap gap-4"
        >
          {frameSizes.map((size: string) => (
            <div key={size} className="flex items-start">
              <RadioGroupItem 
                value={size} 
                id={`size-${size}`} 
                className="peer sr-only" 
              />
              <Label
                htmlFor={`size-${size}`}
                className="flex items-center justify-center px-4 py-2 border border-[#95A7B5] rounded-md text-[#253946] cursor-pointer peer-data-[state=checked]:bg-[#A76825] peer-data-[state=checked]:text-white peer-data-[state=checked]:border-[#A76825] hover:bg-[#D2BDA2]/10"
              >
                {size === '8x8' ? '8" x 8"' : '10" x 10"'}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {/* Frame Type Selection */}
      <div>
        <h3 className="text-sm font-medium text-[#253946] mb-2">Frame Style</h3>
        <RadioGroup 
          value={frameType} 
          onValueChange={setFrameType} 
          className="flex flex-wrap gap-4"
        >
          {frameTypes.map((type: string) => (
            <div key={type} className="flex items-start">
              <RadioGroupItem 
                value={type} 
                id={`type-${type}`} 
                className="peer sr-only" 
              />
              <Label
                htmlFor={`type-${type}`}
                className="flex items-center justify-center px-4 py-2 border border-[#95A7B5] rounded-md text-[#253946] cursor-pointer peer-data-[state=checked]:bg-[#A76825] peer-data-[state=checked]:text-white peer-data-[state=checked]:border-[#A76825] hover:bg-[#D2BDA2]/10"
              >
                {type === 'pine' ? 'Pine Wood' : 'Dark Wood'}
              </Label>
            </div>
          ))}
        </RadioGroup>
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