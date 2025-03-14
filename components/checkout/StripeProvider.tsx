'use client';

import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';

// Use the environment variable from .env
// Next.js automatically exposes environment variables prefixed with NEXT_PUBLIC_ to the browser
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// For debugging purposes
console.log('Stripe env vars available:', {
  hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  keyStart: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) + '...'
});

interface StripeProviderProps {
  children: React.ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const setupStripe = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
          throw new Error('Missing Stripe publishable key');
        }
        
        const stripe = await stripePromise;
        
        if (!stripe) {
          throw new Error('Failed to initialize Stripe');
        }
        
        setStripeInstance(stripe);
        console.log('Stripe initialized successfully');
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        setError((error as Error).message || 'Failed to initialize payment system');
      } finally {
        setIsLoading(false);
      }
    };
    
    setupStripe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#A76825]" />
        <span className="ml-2">Loading payment system...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-700">
        <h3 className="font-semibold mb-2">Payment System Error</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm">Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
} 