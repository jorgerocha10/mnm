'use client';

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onBack: () => void;
  onComplete: (paymentIntentId: string) => void;
}

export default function PaymentForm({ amount, onBack, onComplete }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'creating' | 'confirming' | 'idle'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe hasn't initialized yet. Please try again in a moment.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create a payment intent on the server
      setPaymentStep('creating');
      console.log('Creating payment intent for amount:', amount);
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Payment intent creation failed:', responseData);
        throw new Error(responseData.error || responseData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = responseData;
      
      if (!clientSecret) {
        throw new Error('No client secret returned from the server');
      }
      
      console.log('Payment intent created successfully');

      // Step 2: Confirm card payment with Stripe
      setPaymentStep('confirming');
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { paymentIntent, error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (paymentError) {
        console.error('Payment confirmation error:', paymentError);
        throw new Error(paymentError.message || 'Payment confirmation failed');
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        onComplete(paymentIntent.id);
      } else {
        console.error('Payment status not succeeded:', paymentIntent.status);
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('Payment process error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
      setPaymentStep('idle');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[#253946] mb-6">Payment</h2>
      
      <div className="mb-6">
        <h3 className="text-md font-medium text-[#253946] mb-2">Amount Due</h3>
        <p className="text-2xl font-semibold text-[#253946]">{formatCurrency(amount)}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border border-[#D2BDA2] rounded-md">
          <label className="block text-sm font-medium text-[#253946] mb-2">
            Card Details
          </label>
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#253946',
                  '::placeholder': {
                    color: '#95A7B5',
                  },
                },
              },
            }}
          />
        </div>
        
        {error && (
          <div className="flex items-center bg-red-50 text-red-700 p-3 rounded-md text-sm mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="border-[#95A7B5] text-[#253946]"
          >
            Back to Review
          </Button>
          
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="bg-[#A76825] hover:bg-[#8a561e] text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {paymentStep === 'creating' ? 'Preparing Payment...' : 'Processing Payment...'}
              </>
            ) : (
              `Pay ${formatCurrency(amount)}`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 