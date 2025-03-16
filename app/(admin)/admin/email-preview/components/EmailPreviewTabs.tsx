'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import OrderConfirmationPreview from './OrderConfirmationPreview';
import ShippingUpdatePreview from './ShippingUpdatePreview';
import PasswordResetPreview from './PasswordResetPreview';

export default function EmailPreviewTabs() {
  const [activeTab, setActiveTab] = useState('order-confirmation');
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Function to send a test email
  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsSending(true);

    try {
      // Choose the appropriate API endpoint based on the active tab
      let endpoint = '';
      let payload = {};

      if (activeTab === 'order-confirmation') {
        endpoint = '/api/email/order-confirmation';
        payload = {
          id: 'TEST-123456',
          customerName: 'Test Customer',
          customerEmail: testEmail,
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
            address: '123 Test Street',
            city: 'Test City',
            postalCode: '12345',
            country: 'United States'
          }
        };
      } else if (activeTab === 'shipping-update') {
        endpoint = '/api/email/shipping-update';
        payload = {
          orderId: 'TEST-123456',
          customerName: 'Test Customer',
          status: 'shipped',
          trackingNumber: 'TRK12345678',
          trackingUrl: 'https://example.com/track',
          estimatedDelivery: 'March 20, 2023',
          carrier: 'USPS'
        };
      } else if (activeTab === 'password-reset') {
        endpoint = '/api/email/password-reset';
        payload = {
          email: testEmail,
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      toast.success(`Test email sent to ${testEmail}`);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="order-confirmation" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-xl mx-auto">
          <TabsTrigger value="order-confirmation">Order Confirmation</TabsTrigger>
          <TabsTrigger value="shipping-update">Shipping Update</TabsTrigger>
          <TabsTrigger value="password-reset">Password Reset</TabsTrigger>
        </TabsList>

        <div className="my-8">
          <TabsContent value="order-confirmation">
            <OrderConfirmationPreview />
          </TabsContent>
          <TabsContent value="shipping-update">
            <ShippingUpdatePreview />
          </TabsContent>
          <TabsContent value="password-reset">
            <PasswordResetPreview />
          </TabsContent>
        </div>
      </Tabs>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-medium mb-4 text-[#253946]">Send Test Email</h3>
        <div className="flex gap-4 items-center">
          <Input
            type="email"
            placeholder="Enter test email address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="max-w-md"
          />
          <Button 
            onClick={sendTestEmail} 
            disabled={isSending} 
            className="bg-[#A76825] hover:bg-[#8a561e]"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Test Email'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
} 