'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, MapPin, ShoppingBag, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  const {
    items,
    updateItem,
    removeItem,
    clearCart,
    getTotal,
  } = useCartStore((state) => state);
  
  // Handle hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Handle quantity updates
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    if (quantity > 10) return;
    updateItem(id, { quantity });
  };
  
  // Handle remove item
  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success('Item removed from cart');
  };
  
  // Handle proceed to checkout
  const handleCheckout = () => {
    router.push('/checkout');
  };
  
  // If component is not mounted yet, show skeleton
  if (!isMounted) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-[#253946] mb-8">Shopping Cart</h1>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded-md"></div>
        </div>
      </div>
    );
  }
  
  // If cart is empty, show empty state
  if (items.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-[#253946] mb-8">Shopping Cart</h1>
        <div className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-16 w-16 text-[#95A7B5] mb-6" />
          <h2 className="text-xl font-semibold text-[#253946] mb-2">Your cart is empty</h2>
          <p className="text-[#95A7B5] mb-8 text-center max-w-md">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button
            asChild
            className="bg-[#A76825] hover:bg-[#8a561e] text-white"
          >
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-[#253946] mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#F7F5F6] border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-7 font-medium text-[#253946]">Product</div>
                <div className="col-span-2 font-medium text-[#253946] text-center">Quantity</div>
                <div className="col-span-2 font-medium text-[#253946] text-right">Price</div>
                <div className="col-span-1"></div>
              </div>
            </div>
            
            {/* Items */}
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Product */}
                    <div className="col-span-7">
                      <div className="flex gap-4">
                        <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image || "https://placehold.co/200x200/png"}
                            alt={item.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="font-medium text-[#253946]">{item.name}</h3>
                          <div className="text-sm text-[#95A7B5] mt-1">
                            <div>Size: {item.options.frameSize === '8x8' ? '8" x 8"' : '10" x 10"'}</div>
                            <div>Frame: {item.options.frameType === 'pine' ? 'Pine Wood' : 'Dark Wood'}</div>
                            {item.options.engravingText && (
                              <div className="truncate max-w-[220px]">
                                Engraving: {item.options.engravingText}
                              </div>
                            )}
                            <div className="flex items-center mt-1">
                              <MapPin className="h-3 w-3 text-[#A76825] mr-1" />
                              <span className="truncate max-w-[220px]">
                                {item.options.locationType === 'address' 
                                  ? item.options.location 
                                  : `Lat,Long: ${item.options.location}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center justify-center px-3 py-2 bg-[#F7F5F6] rounded-md">
                        <span className="font-medium text-[#253946]">
                          {item.quantity}
                        </span>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="col-span-2 text-right font-medium text-[#253946]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    
                    {/* Remove */}
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-[#95A7B5] hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Cart Actions */}
            <div className="px-6 py-4 bg-[#F7F5F6] border-t border-gray-200 flex justify-between">
              <Button
                variant="ghost"
                className="text-[#253946]"
                asChild
              >
                <Link href="/products" className="flex items-center">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
              
              <Button
                variant="outline"
                className="text-[#A76825] border-[#A76825]"
                onClick={() => clearCart()}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#253946] mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[#253946]">Subtotal</span>
                <span className="font-medium text-[#253946]">{formatPrice(getTotal())}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#253946]">Shipping</span>
                <span className="text-[#253946]">Calculated at checkout</span>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between">
                <span className="font-semibold text-[#253946]">Total</span>
                <span className="font-semibold text-[#253946]">{formatPrice(getTotal())}</span>
              </div>
              
              <Button
                className="w-full bg-[#A76825] hover:bg-[#8a561e] text-white mt-6"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              
              <div className="text-center text-sm text-[#95A7B5] mt-4">
                Shipping and taxes calculated at checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 