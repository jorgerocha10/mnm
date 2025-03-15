import { Metadata } from 'next';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/admin/AdminHeader';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/admin/PaymentStatusBadge';
import UpdateOrderStatusForm from '@/components/admin/UpdateOrderStatusForm';
import { ArrowLeft, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Order Details | Maps & Memories Admin',
  description: 'View and manage order details',
};

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getOrderDetails(id: string) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await auth();
  const { id } = await params;

  // If not authenticated, you'd typically handle this with middleware
  if (!session?.user) {
    return <div>Access denied. Please log in as an administrator.</div>;
  }

  const order = await getOrderDetails(id);

  if (!order) {
    notFound();
  }

  // Calculate totals
  const orderSubtotal = order.orderItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  
  // Shipping cost (if applicable)
  const shippingCost = 0; // You'd calculate this based on your business logic
  
  // Total
  const orderTotal = Number(order.total);

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Order #${order.id.slice(0, 8)}`}
        description={`Placed on ${format(new Date(order.createdAt), 'MMMM d, yyyy')}`}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Contact Details</h3>
                <p>{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Shipping Address</h3>
                <p>{order.shippingAddress}</p>
                <p>{order.city}, {order.postalCode}</p>
                <p>{order.country}</p>
              </div>
              {(order.latitude && order.longitude) && (
                <div>
                  <h3 className="font-medium mb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Map Location
                  </h3>
                  <p className="text-sm">
                    Latitude: {order.latitude}, Longitude: {order.longitude}
                  </p>
                  {order.mapAddress && (
                    <p className="text-sm mt-1">{order.mapAddress}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Order Status</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Status</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              {order.paymentIntentId && (
                <div className="flex items-center justify-between">
                  <span>Payment ID</span>
                  <span className="text-sm font-mono">{order.paymentIntentId}</span>
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${orderSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <Separator />
              <UpdateOrderStatusForm
                orderId={order.id}
                currentStatus={order.status}
                currentPaymentStatus={order.paymentStatus}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''} purchased
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Options</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.product.images[0] && (
                        <div className="h-16 w-16 rounded overflow-hidden bg-gray-100">
                          {/* Image would go here, but we'll need to ensure next/image is configured */}
                          <div 
                            className="h-full w-full bg-cover bg-center" 
                            style={{ 
                              backgroundImage: `url(${item.product.images[0]})`,
                              backgroundSize: 'cover'
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">SKU: {item.product.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>Frame: {item.frameType === 'PINE' ? 'Pine Wood' : 'Dark Wood'}</div>
                      {item.frameSize && (
                        <div>Size: {item.frameSize.replace('SIZE_', '').replace('_', '.').replace('X', 'x')}"</div>
                      )}
                      {item.mapOrientation && (
                        <div>Orientation: {item.mapOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</div>
                      )}
                      {item.engravingText && (
                        <div className="text-xs truncate max-w-[200px]">
                          Engraving: "{item.engravingText}"
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">${Number(item.price).toFixed(2)}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
} 