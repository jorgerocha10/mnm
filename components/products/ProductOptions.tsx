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
    Category?: {
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
    if (product.Category?.name === 'Key holders') {
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
  
  // Initialize map and location search
  const initializeMapTool = () => {
    // For now, just set up basic state
    // This would typically initialize a mapping tool or service
    console.log('Map initialization for product:', product.id);
    
    // In a real implementation, this would:
    // 1. Initialize a map library (like Mapbox, Google Maps, etc.)
    // 2. Set up location search functionality
    // 3. Handle user interaction with the map
  };
  
  // Load frame size prices
  const loadFrameSizePrices = async () => {
    try {
      const prices: Record<string, number> = {};
      
      for (const size of availableFrameSizes) {
        const price = await getFrameSizePrice(size, product.Category?.name);
        prices[size] = price;
      }
      
      setFrameSizePrices(prices);
    } catch (error) {
      console.error('Error loading frame size prices:', error);
    }
  };
  
  // Fetch price on initial load
  useEffect(() => {
    const fetchInitialPrice = async () => {
      try {
        const price = await getFrameSizePrice(frameSize, product.Category?.name);
        setCurrentPrice(price);
        setPricingLoaded(true);
      } catch (error) {
        console.error('Error fetching initial price:', error);
        setCurrentPrice(0);
        setPricingLoaded(true);
      }
    };
    
    fetchInitialPrice();
  }, [frameSize, product.Category?.name]);
  
  // Fetch prices for all available frame sizes
  useEffect(() => {
    const fetchAllPrices = async () => {
      try {
        const prices: Record<string, number> = {};
        
        for (const size of availableFrameSizes) {
          const price = await getFrameSizePrice(size, product.Category?.name);
          prices[size] = price;
        }
        
        setFrameSizePrices(prices);
      } catch (error) {
        console.error('Error fetching all prices:', error);
      }
    };
    
    fetchAllPrices();
  }, [availableFrameSizes, product.Category?.name]);
  
  // Check if product is in Multi layers or Bas relief category
  const allowRotation = product.Category?.name === 'Multi layers' || product.Category?.name === 'Bas Relief';
  
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
          const price = await getFrameSizePrice(size, product.Category?.name);
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
  
  // Handle frame type change
  const handleFrameTypeChange = (type: string) => {
    setFrameType(type);
  };
  
  // Handle location type change
  const handleLocationTypeChange = (type: 'address' | 'coordinates') => {
    setLocationType(type);
  };
  
  // Handle orientation change
  const handleOrientationChange = (newOrientation: 'horizontal' | 'vertical') => {
    setMapOrientation(newOrientation);
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
  
  // Only initialize mapTool for products that need a map
  useEffect(() => {
    // Hide map for key holders since they don't need a map
    if (product.Category?.name === 'Key holders') {
      return;
    }
    
    // Initialize map and location search
    initializeMapTool();
  }, [product.id]);

  // Load frame size prices when component mounts
  useEffect(() => {
    loadFrameSizePrices();
  }, [frameSize, product.Category?.name]);

  return (
    <div className="space-y-6">
      {/* Price Display */}
      <div className="text-2xl font-semibold text-[#253946]">
        {pricingLoaded ? formatPrice(currentPrice) : 'Loading price...'}
      </div>
      
      {/* Frame Size Selection */}
      <div>
        <Label htmlFor="frame-size" className="text-[#253946] font-medium block mb-2">
          Frame Size
        </Label>
        <Select value={frameSize} onValueChange={handleFrameSizeChange}>
          <SelectTrigger id="frame-size" className="w-full">
            <SelectValue placeholder="Select frame size" />
          </SelectTrigger>
          <SelectContent>
            {availableFrameSizes.map(size => (
              <SelectItem key={size} value={size}>
                {frameSizeLabels[size as FrameSize] || size}
                {frameSizePrices[size] ? ` - ${formatPrice(frameSizePrices[size])}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Frame Type Selection */}
      <div>
        <Label htmlFor="frame-type" className="text-[#253946] font-medium block mb-2">
          Frame Type
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {allFrameTypes.map(type => (
            <Button
              key={type}
              type="button"
              variant={frameType === type ? "default" : "outline"}
              onClick={() => handleFrameTypeChange(type)}
              className={`h-auto py-3 px-4 ${
                frameType === type ? 'bg-[#A76825] text-white hover:bg-[#8c571e]' : 'border-[#95A7B5]'
              }`}
            >
              {frameTypeLabels[type as FrameType] || type}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Map Location */}
      {product.Category?.name !== 'Key holders' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-[#253946] font-medium">Location</Label>
            <Tabs
              defaultValue="address"
              value={locationType}
              onValueChange={(value) => handleLocationTypeChange(value as 'address' | 'coordinates')}
              className="w-auto"
            >
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="space-y-4">
            {locationType === 'address' ? (
              <div>
                <Input
                  id="address"
                  placeholder="Enter address or location name"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full"
                />
                <div className="mt-2 text-xs text-[#95A7B5]">
                  Example: "Paris, France" or "1234 Main St, Toronto, ON"
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-sm text-[#253946] block mb-1">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    placeholder="Latitude (e.g. 43.65107)"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-sm text-[#253946] block mb-1">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    placeholder="Longitude (e.g. -79.347015)"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {/* Replace placeholder with actual InteractiveMap */}
            <div className="mt-4">
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
            
            {/* Map Orientation - Only for non-square frames */}
            {!isSquare && allowRotation && (
              <div>
                <Label className="text-sm text-[#253946] block mb-1">
                  Map Orientation
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={mapOrientation === 'horizontal' ? "default" : "outline"}
                    onClick={() => handleOrientationChange('horizontal')}
                    className={`h-auto py-2 ${
                      mapOrientation === 'horizontal' ? 'bg-[#A76825] text-white hover:bg-[#8c571e]' : 'border-[#95A7B5]'
                    }`}
                  >
                    Horizontal
                  </Button>
                  <Button
                    type="button"
                    variant={mapOrientation === 'vertical' ? "default" : "outline"}
                    onClick={() => handleOrientationChange('vertical')}
                    className={`h-auto py-2 ${
                      mapOrientation === 'vertical' ? 'bg-[#A76825] text-white hover:bg-[#8c571e]' : 'border-[#95A7B5]'
                    }`}
                  >
                    Vertical
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Custom Engraving */}
      <div>
        <Label htmlFor="engraving" className="text-[#253946] font-medium block mb-2">
          Custom Engraving (Optional)
        </Label>
        <Textarea
          id="engraving"
          placeholder="Add a custom message (max 100 characters)"
          value={engravingText}
          onChange={(e) => setEngravingText(e.target.value.substring(0, 100))}
          maxLength={100}
          className="resize-none"
        />
        <div className="flex justify-between mt-1 text-xs text-[#95A7B5]">
          <span>
            <PenLine className="w-3 h-3 inline-block mr-1" />
            Optional custom text engraved on the frame
          </span>
          <span>{engravingText.length}/100 characters</span>
        </div>
      </div>
      
      {/* Quantity */}
      <div>
        <Label htmlFor="quantity" className="text-[#253946] font-medium block mb-2">
          Quantity
        </Label>
        <div className="flex items-center">
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={quantity <= 1}
            className="rounded-r-none"
          >
            <span className="text-lg">-</span>
          </Button>
          <Input
            id="quantity"
            type="number"
            min="1"
            max="10"
            value={quantity}
            onChange={(e) => updateQuantity(parseInt(e.target.value))}
            className="w-16 text-center rounded-none"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={quantity >= 10}
            className="rounded-l-none"
          >
            <span className="text-lg">+</span>
          </Button>
        </div>
      </div>
      
      {/* Add to Cart and Buy Now Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddToCart}
          disabled={!pricingLoaded}
          className="border-[#A76825] text-[#A76825] hover:bg-[#A76825] hover:text-white transition-colors"
        >
          Add to Cart
        </Button>
        <Button
          type="button"
          onClick={handleBuyNow}
          disabled={!pricingLoaded}
          className="bg-[#A76825] text-white hover:bg-[#8c571e]"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
} 