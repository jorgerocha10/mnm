'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderCompleteProps {
  orderId: string;
  customerEmail: string;
}

export default function OrderComplete({ orderId, customerEmail }: OrderCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
      <div className="h-24 w-24 rounded-full bg-[#D2BDA2]/20 flex items-center justify-center">
        <Check className="h-12 w-12 text-[#A76825]" />
      </div>
      
      <h1 className="text-2xl font-semibold text-[#253946]">Thank You For Your Order!</h1>
      
      <p className="text-[#95A7B5] max-w-md">
        Your order <span className="font-medium text-[#253946]">#{orderId}</span> has been placed successfully.
      </p>
      
      <div className="flex items-center justify-center bg-[#D2BDA2]/20 p-3 rounded-md w-full max-w-md">
        <Check className="h-5 w-5 text-[#A76825] mr-2" />
        <p className="text-[#253946]">
          Order confirmation email sent to <span className="font-medium">{customerEmail}</span>
        </p>
      </div>
      
      <div className="bg-[#F7F5F6] p-6 rounded-lg w-full max-w-md">
        <h2 className="font-medium text-[#253946] mb-4">What's Next?</h2>
        
        <ol className="space-y-3 text-left">
          <li className="flex items-start">
            <span className="h-5 w-5 rounded-full bg-[#A76825] text-white flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
            <span className="text-[#253946]">Your order will be processed within 1-2 business days.</span>
          </li>
          
          <li className="flex items-start">
            <span className="h-5 w-5 rounded-full bg-[#A76825] text-white flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
            <span className="text-[#253946]">We'll create your custom map with the specifications you've chosen.</span>
          </li>
          
          <li className="flex items-start">
            <span className="h-5 w-5 rounded-full bg-[#A76825] text-white flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
            <span className="text-[#253946]">You'll receive a shipping confirmation when your order is on its way.</span>
          </li>
        </ol>
      </div>
      
      <div className="pt-4">
        <Link href="/products">
          <Button className="bg-[#A76825] hover:bg-[#8a561e] text-white">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
} 