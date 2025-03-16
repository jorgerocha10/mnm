'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormEvent } from 'react';
import { toast } from 'sonner';

// Sample order data
const sampleOrder = {
  id: 'ORD-12345',
  customerName: 'John Doe',
  customerEmail: 'john.doe@example.com',
  orderDate: new Date().toISOString(),
  total: 129.99,
  items: [
    {
      productId: 'prod_123',
      name: 'Custom Map Frame',
      price: 129.99,
      image: 'https://placehold.co/600x400/png',
      quantity: 1,
      frameSize: '8x8',
      frameType: 'Dark Wood',
      engravingText: 'Our First Home'
    }
  ],
  shippingAddress: {
    address: '123 Main Street',
    city: 'New York',
    postalCode: '10001',
    country: 'United States'
  }
};

export default function OrderConfirmationPreview() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  
  const generatePreview = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/email/preview/order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleOrder),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }
      
      const data = await response.json();
      setPreviewHtml(data.html);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4 text-[#253946]">Order Confirmation Email</h3>
        <p className="text-[#95A7B5] mb-6">
          This email is sent to customers when they complete an order.
        </p>
        
        <form onSubmit={generatePreview} className="space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" defaultValue={sampleOrder.customerName} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input id="orderId" defaultValue={sampleOrder.id} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">Total</Label>
              <Input id="total" defaultValue={`$${sampleOrder.total}`} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Order Date</Label>
              <Input id="date" defaultValue={new Date().toLocaleDateString()} disabled />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="bg-[#A76825] hover:bg-[#8a561e]" 
            disabled={isLoading}
          >
            {isLoading ? 'Generating Preview...' : 'Generate Preview'}
          </Button>
        </form>
      </Card>
      
      {previewHtml && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4 text-[#253946]">Email Preview</h3>
          <div className="border rounded-md p-4 bg-white mt-4">
            <iframe
              srcDoc={previewHtml}
              title="Email Preview"
              className="w-full min-h-[600px] border-0"
            />
          </div>
        </Card>
      )}
    </div>
  );
} 