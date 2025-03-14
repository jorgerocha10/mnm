'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types/cart';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';

interface OrderReviewProps {
  cartItems: CartItem[];
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  onBack: () => void;
  onCheckout: () => void;
}

export default function OrderReview({ 
  cartItems, 
  shippingInfo, 
  onBack, 
  onCheckout 
}: OrderReviewProps) {
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Set fixed shipping cost
  const shipping = 12.99;
  
  // Calculate total
  const total = subtotal + shipping;
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[#253946] mb-6">Review Your Order</h2>
      
      {/* Items section */}
      <div className="space-y-4">
        <h3 className="font-medium text-[#253946]">Items ({cartItems.length})</h3>
        
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex space-x-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                <Image
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h4 className="font-medium text-[#253946]">{item.name}</h4>
                  <p className="text-sm text-[#95A7B5]">
                    {item.frameSize} • {item.frameType} {item.engravingText && `• Engraved`}
                  </p>
                  <p className="text-sm text-[#95A7B5]">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-[#253946]">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Separator className="bg-[#D2BDA2]/30" />
      
      {/* Shipping info section */}
      <div className="space-y-4">
        <h3 className="font-medium text-[#253946]">Shipping Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#95A7B5]">Name</p>
            <p className="font-medium text-[#253946]">{shippingInfo.fullName}</p>
          </div>
          
          <div>
            <p className="text-[#95A7B5]">Email</p>
            <p className="font-medium text-[#253946]">{shippingInfo.email}</p>
          </div>
          
          <div>
            <p className="text-[#95A7B5]">Phone</p>
            <p className="font-medium text-[#253946]">{shippingInfo.phone}</p>
          </div>
          
          <div>
            <p className="text-[#95A7B5]">Address</p>
            <p className="font-medium text-[#253946]">
              {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.country}
            </p>
          </div>
        </div>
      </div>
      
      <Separator className="bg-[#D2BDA2]/30" />
      
      {/* Order summary section */}
      <div className="space-y-4">
        <h3 className="font-medium text-[#253946]">Order Summary</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#95A7B5]">Subtotal</span>
            <span className="font-medium text-[#253946]">{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-[#95A7B5]">Shipping</span>
            <span className="font-medium text-[#253946]">{formatCurrency(shipping)}</span>
          </div>
          
          <Separator className="my-2 bg-[#D2BDA2]/30" />
          
          <div className="flex justify-between">
            <span className="font-medium text-[#253946]">Total</span>
            <span className="font-semibold text-lg text-[#253946]">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-[#95A7B5] text-[#253946]"
        >
          Back to Shipping
        </Button>
        
        <Button
          onClick={onCheckout}
          className="bg-[#A76825] hover:bg-[#8a561e] text-white"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
} 