import { Suspense } from 'react';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdminHeader, PageHeader } from '@/components/admin/AdminHeader';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/admin/PaymentStatusBadge';
import { Download, Filter, Search } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Orders | Maps & Memories Admin',
  description: 'Manage customer orders',
};

const OrdersTableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  </div>
);

interface OrdersTableProps {
  searchParams: Promise<{
    status?: string;
    paymentStatus?: string;
    q?: string;
    page?: string;
  }>;
}

async function OrdersTable({ searchParams }: OrdersTableProps) {
  const resolvedParams = await searchParams;
  const { status, paymentStatus, q, page = '1' } = resolvedParams;
  const pageSize = 10;
  const skip = (parseInt(page) - 1) * pageSize || 0;
  
  const filters = {
    ...(status && status !== 'all' && { status: status }),
    ...(paymentStatus && paymentStatus !== 'all' && { paymentStatus: paymentStatus }),
    ...(q && {
      OR: [
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { id: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };

  // Get orders with filtering and pagination
  const orders = await prisma.order.findMany({
    where: filters,
    orderBy: {
      createdAt: 'desc',
    },
    take: pageSize,
    skip,
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  // Get total count for pagination
  const totalOrders = await prisma.order.count({
    where: filters,
  });

  const totalPages = Math.ceil(totalOrders / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {totalOrders} order{totalOrders !== 1 ? 's' : ''} found
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/orders/export?${new URLSearchParams({
            ...(status && status !== 'all' ? { status } : {}),
            ...(paymentStatus && paymentStatus !== 'all' ? { paymentStatus } : {}),
            ...(q ? { q } : {})
          }).toString()}`}>
            <Download className="h-4 w-4 mr-2" />
            Export Orders
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="w-[100px] text-right">Total</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[120px]">Payment</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                      {order.id.substring(0, 8)}...
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ${parseFloat(order.total.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={parseInt(page) <= 1}
              asChild
            >
              <Link
                href={`/admin/orders?${new URLSearchParams({
                  ...(status && status !== 'all' ? { status } : {}),
                  ...(paymentStatus && paymentStatus !== 'all' ? { paymentStatus } : {}),
                  ...(q ? { q } : {}),
                  page: String(parseInt(page) - 1),
                }).toString()}`}
              >
                Previous
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={parseInt(page) >= totalPages}
              asChild
            >
              <Link
                href={`/admin/orders?${new URLSearchParams({
                  ...(status && status !== 'all' ? { status } : {}),
                  ...(paymentStatus && paymentStatus !== 'all' ? { paymentStatus } : {}),
                  ...(q ? { q } : {}),
                  page: String(parseInt(page) + 1),
                }).toString()}`}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface OrderFiltersProps {
  searchParams: Promise<{
    status?: string;
    paymentStatus?: string;
    q?: string;
  }>;
}

function OrderFilters({ searchParams }: OrderFiltersProps) {
  const { status, paymentStatus, q } = searchParams as any;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          defaultValue={q}
          name="q"
          className="pl-8"
        />
      </div>
      <Select defaultValue={status || "all"} name="status">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="SHIPPED">Shipped</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={paymentStatus || "all"} name="paymentStatus">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Payment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PAID">Paid</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
          <SelectItem value="REFUNDED">Refunded</SelectItem>
        </SelectContent>
      </Select>
      <Button className="bg-[#A76825] hover:bg-[#8A571D]">
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
    </div>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<OrderFiltersProps['searchParams'] & OrdersTableProps['searchParams']>;
}) {
  const session = await auth();

  // If not authenticated, you'd typically handle this with middleware
  if (!session?.user) {
    return <div>Access denied. Please log in as an administrator.</div>;
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description="Manage and track customer orders"
      />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>
              View and manage all customer orders. Filter by status or search for specific orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/admin/orders" className="space-y-4">
              <OrderFilters searchParams={searchParams} />
            </form>
            <Separator className="my-6" />
            <Suspense fallback={<OrdersTableSkeleton />}>
              <OrdersTable searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 