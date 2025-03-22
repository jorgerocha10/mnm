import { Metadata } from 'next';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
  TableFooter,
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

  // Debug location data availability
  console.log('Order location data:', {
    orderLatitude: order.latitude,
    orderLongitude: order.longitude,
    orderMapAddress: order.mapAddress,
    firstItemLocation: order.orderItems?.[0]?.location,
    firstItemMapZoom: order.orderItems?.[0]?.mapZoom,
    firstItemMapOrientation: order.orderItems?.[0]?.mapOrientation,
  });

  // Calculate totals
  const orderSubtotal = order.orderItems.reduce(
    (sum: number, item: any) => sum + Number(item.price) * item.quantity,
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
              {/* Map Location Section - Enhanced */}
              {((order.latitude && order.longitude) || 
                order.mapAddress || 
                order.orderItems?.some((item: any) => item.location)) && (
                <div>
                  <h3 className="font-medium mb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Map Location
                  </h3>
                  <div className="space-y-1 text-sm">
                    {/* Show coordinates if available directly on order */}
                    {(order.latitude && order.longitude) ? (
                      <p>
                        <span className="inline-block w-24 font-medium">Coordinates:</span> 
                        {order.latitude}, {order.longitude}
                      </p>
                    ) : (
                      /* Check if there's location in first order item */
                      order.orderItems?.[0]?.location?.includes?.(',') && (
                        <p>
                          <span className="inline-block w-24 font-medium">Coordinates:</span> 
                          {order.orderItems[0].location}
                        </p>
                      )
                    )}

                    {/* Show map address if available */}
                    {order.mapAddress ? (
                      <p>
                        <span className="inline-block w-24 font-medium">Address:</span> 
                        {order.mapAddress}
                      </p>
                    ) : (
                      /* Check if there's address in first order item */
                      order.orderItems?.[0]?.location && 
                      typeof order.orderItems[0].location === 'string' &&
                      !order.orderItems[0].location.includes(',') && (
                        <p>
                          <span className="inline-block w-24 font-medium">Address:</span> 
                          {order.orderItems[0].location}
                        </p>
                      )
                    )}
                    
                    {/* Show map zoom if available */}
                    {order.orderItems.some((item: any) => item.mapZoom) && (
                      <p>
                        <span className="inline-block w-24 font-medium">Zoom Level:</span> 
                        {order.orderItems[0].mapZoom || "Default"}
                      </p>
                    )}
                    
                    {/* Show map orientation if available */}
                    {order.orderItems.some((item: any) => item.mapOrientation) && (
                      <p>
                        <span className="inline-block w-24 font-medium">Orientation:</span> 
                        {order.orderItems[0].mapOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
                      </p>
                    )}
                  </div>
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
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Options</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItems.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.product.images[0] && (
                        <div className="h-12 w-12 rounded-md overflow-hidden relative">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.product.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {item.frameType && <div>Frame: {item.frameType === 'PINE' ? 'Pine Wood' : 'Dark Wood'}</div>}
                    {item.frameSize && (
                      <div>
                        Size: {
                          item.frameSize === 'SMALL' ? 'SMALL (8.5x8.5")' :
                          item.frameSize === 'LARGE' ? 'LARGE (12x16")' :
                          `${item.frameSize} (${item.frameSize.replace('SIZE_', '').replace('_', '.').replace('X', 'x') + '"'})`
                        }
                      </div>
                    )}
                    {item.engravingText && <div>Engraving: "{item.engravingText}"</div>}
                    {item.mapZoom && <div>Map Zoom: {item.mapZoom}</div>}
                    {item.mapOrientation && <div>Orientation: {item.mapOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</div>}
                    {item.location && typeof item.location === 'string' && (
                      <div>
                        Location: {item.location.includes(',') 
                          ? 'Coordinates' 
                          : 'Address'
                        }
                        <span className="text-xs ml-1 block text-muted-foreground truncate max-w-[200px]">
                          {item.location}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">${(Number(item.price) * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>Subtotal</TableCell>
                <TableCell className="text-right">${orderSubtotal.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>Shipping</TableCell>
                <TableCell className="text-right">${shippingCost.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>Total</TableCell>
                <TableCell className="text-right font-medium">${orderTotal.toFixed(2)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </>
  );
} 