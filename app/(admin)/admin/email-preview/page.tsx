import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderConfirmationPreview from './components/OrderConfirmationPreview';
import ShippingUpdatePreview from './components/ShippingUpdatePreview';
import PasswordResetPreview from './components/PasswordResetPreview';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/admin/AdminHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default async function EmailPreviewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/signin');
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Email Templates Preview" 
        description="Preview and test email templates before sending them to customers"
      />

      <Alert className="bg-[#D2BDA2]/20 border-[#A76825]">
        <InfoIcon className="h-4 w-4 text-[#A76825]" />
        <AlertTitle className="text-[#253946] font-medium">Email System Operational</AlertTitle>
        <AlertDescription className="text-[#253946]">
          Automatic emails are now enabled for order confirmations and shipping updates. Emails will be sent to customers 
          when orders are created and when order status changes.
        </AlertDescription>
      </Alert>

      <div className="bg-white rounded-md p-6 shadow">
        <Tabs defaultValue="order-confirmation" className="w-full">
          <TabsList className="mb-6 bg-[#F7F5F6] border">
            <TabsTrigger value="order-confirmation" className="data-[state=active]:bg-white data-[state=active]:text-[#253946]">
              Order Confirmation
            </TabsTrigger>
            <TabsTrigger value="shipping-update" className="data-[state=active]:bg-white data-[state=active]:text-[#253946]">
              Shipping Update
            </TabsTrigger>
            <TabsTrigger value="password-reset" className="data-[state=active]:bg-white data-[state=active]:text-[#253946]">
              Password Reset
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="order-confirmation">
            <OrderConfirmationPreview />
          </TabsContent>
          
          <TabsContent value="shipping-update">
            <ShippingUpdatePreview />
          </TabsContent>
          
          <TabsContent value="password-reset">
            <PasswordResetPreview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 