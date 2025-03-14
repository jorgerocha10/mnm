'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, CartItem as StoreCartItem } from '@/lib/store/cart-store';
import { CartItem as ReviewCartItem } from '@/types/cart';
import ShippingForm from '@/components/checkout/ShippingForm';
import OrderReview from '@/components/checkout/OrderReview';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderComplete from '@/components/checkout/OrderComplete';
import StripeProvider from '@/components/checkout/StripeProvider';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

type CheckoutStep = 'shipping' | 'review' | 'payment' | 'complete';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotal } = useCartStore();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    saveInfo: false,
  });
  const [orderId, setOrderId] = useState('');
  
  // Calculate the total amount
  const subtotal = getTotal();
  
  // Fixed shipping cost
  const shipping = 12.99;
  const total = subtotal + shipping;

  // Convert cart items from store format to the format expected by OrderReview component
  const adaptedCartItems = items.map(item => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    frameSize: item.options.frameSize,
    frameType: item.options.frameType,
    engravingText: item.options.engravingText,
    location: item.options.locationType === 'coordinates' 
      ? { latitude: parseFloat(item.options.location.split(',')[0]), longitude: parseFloat(item.options.location.split(',')[1]) }
      : { address: item.options.location }
  }));
  
  useEffect(() => {
    // If cart is empty and not on complete step, redirect to cart page
    if (items.length === 0 && currentStep !== 'complete') {
      router.push('/cart');
    }
    
    // Load saved shipping info from localStorage if available
    const savedInfo = localStorage.getItem('shippingInfo');
    if (savedInfo) {
      setShippingInfo(JSON.parse(savedInfo));
    }
  }, [items.length, currentStep, router]);
  
  const handleShippingSubmit = () => {
    // Save shipping info to localStorage if selected
    if (shippingInfo.saveInfo) {
      localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
    }
    
    setCurrentStep('review');
  };
  
  const handleReviewComplete = () => {
    setCurrentStep('payment');
  };
  
  const handlePaymentComplete = async (paymentIntentId: string) => {
    try {
      // Log cart items for debugging
      console.log('Sending order items to API:', 
        adaptedCartItems.map(item => ({ 
          id: item.id,
          productId: item.productId,
          name: item.name.substring(0, 20) + '...'
        }))
      );
      
      // Create the order on the server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: adaptedCartItems,
          shippingInfo,
          paymentIntentId,
        }),
      });
      
      // Handle error responses from the server
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to create order');
      }
      
      const { id } = await response.json();
      setOrderId(id);
      
      // Clear the cart
      clearCart();
      
      // Show success message
      toast({
        title: 'Order Completed!',
        description: 'Your order has been successfully placed.',
      });
      
      // Move to complete step
      setCurrentStep('complete');
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: 'Error',
        description: 'There was a problem creating your order. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Progress header */}
      {currentStep !== 'complete' && (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#253946] mb-6">Checkout</h1>
          
          <div className="flex items-center justify-between max-w-xl mx-auto">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-medium ${
                currentStep === 'shipping' ? 'bg-[#A76825] text-white' : 'bg-[#D2BDA2] text-white'
              }`}>
                1
              </div>
              <span className="text-sm mt-1 text-[#253946]">Shipping</span>
            </div>
            
            <div className="h-0.5 flex-1 bg-[#D2BDA2]" />
            
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-medium ${
                currentStep === 'review' ? 'bg-[#A76825] text-white' : 
                (currentStep === 'payment' || currentStep === 'complete') ? 'bg-[#D2BDA2] text-white' : 'bg-[#F7F5F6] text-[#95A7B5]'
              }`}>
                2
              </div>
              <span className="text-sm mt-1 text-[#253946]">Review</span>
            </div>
            
            <div className="h-0.5 flex-1 bg-[#D2BDA2]" />
            
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-medium ${
                currentStep === 'payment' ? 'bg-[#A76825] text-white' : 
                currentStep === 'complete' ? 'bg-[#D2BDA2] text-white' : 'bg-[#F7F5F6] text-[#95A7B5]'
              }`}>
                3
              </div>
              <span className="text-sm mt-1 text-[#253946]">Payment</span>
            </div>
          </div>
          
          <Separator className="my-8 bg-[#D2BDA2]/30" />
        </div>
      )}
      
      {/* Checkout steps */}
      <div>
        {currentStep === 'shipping' && (
          <ShippingForm 
            data={shippingInfo} 
            setData={setShippingInfo} 
            onSubmit={handleShippingSubmit} 
          />
        )}
        
        {currentStep === 'review' && (
          <OrderReview 
            cartItems={adaptedCartItems} 
            shippingInfo={shippingInfo}
            onBack={() => setCurrentStep('shipping')}
            onCheckout={handleReviewComplete}
          />
        )}
        
        {currentStep === 'payment' && (
          <StripeProvider>
            <PaymentForm 
              amount={total}
              onBack={() => setCurrentStep('review')}
              onComplete={handlePaymentComplete}
            />
          </StripeProvider>
        )}
        
        {currentStep === 'complete' && (
          <OrderComplete 
            orderId={orderId} 
            customerEmail={shippingInfo.email} 
          />
        )}
      </div>
    </div>
  );
} 