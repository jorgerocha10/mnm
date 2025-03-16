'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormEvent } from 'react';
import { toast } from 'sonner';

// Sample shipping update data
const sampleShippingUpdate = {
  orderId: 'ORD-12345',
  customerName: 'John Doe',
  status: 'shipped',
  trackingNumber: 'TRK123456789',
  trackingUrl: 'https://example.com/track',
  estimatedDelivery: 'March 25, 2023',
  carrier: 'USPS'
};

export default function ShippingUpdatePreview() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [status, setStatus] = useState<'shipped' | 'out_for_delivery' | 'delivered'>('shipped');
  
  const generatePreview = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const shippingData = {
        ...sampleShippingUpdate,
        status
      };
      
      const response = await fetch('/api/email/preview/shipping-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingData),
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
        <h3 className="text-lg font-medium mb-4 text-[#253946]">Shipping Update Email</h3>
        <p className="text-[#95A7B5] mb-6">
          This email is sent to customers when their order shipping status changes.
        </p>
        
        <form onSubmit={generatePreview} className="space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" defaultValue={sampleShippingUpdate.customerName} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input id="orderId" defaultValue={sampleShippingUpdate.orderId} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value as any)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input id="tracking" defaultValue={sampleShippingUpdate.trackingNumber} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier</Label>
              <Input id="carrier" defaultValue={sampleShippingUpdate.carrier} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated">Estimated Delivery</Label>
              <Input id="estimated" defaultValue={sampleShippingUpdate.estimatedDelivery} disabled />
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