import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  BarChart3,
  ShoppingBag,
  Users,
  DollarSign,
  CreditCard,
  Package,
  RefreshCcw
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Order } from '@prisma/client';

// Function to format status badges
function OrderStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { color: string; label: string }> = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    PROCESSING: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
    SHIPPED: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
    DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
    CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  };

  const { color, label } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };

  return <Badge className={color}>{label}</Badge>;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/signin');
  }

  // Fetch analytics data
  const ordersCount = await prisma.order.count();
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  // Calculate revenue
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'PAID',
    },
    select: {
      total: true,
    },
  });
  
  const totalRevenue = orders.reduce(
    (acc: number, order) => acc + Number(order.total),
    0
  );

  // Calculate average order value
  const averageOrderValue = orders.length ? totalRevenue / orders.length : 0;

  // Count products and customer emails
  const productsCount = await prisma.product.count();
  const customersCount = await prisma.order.groupBy({
    by: ['customerEmail'],
    _count: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#253946] mb-1">
          Welcome, {session.user.name}
        </h1>
        <p className="text-[#95A7B5]">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#95A7B5]">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#A76825]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#253946]">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-[#95A7B5] mt-1">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#95A7B5]">
              Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#A76825]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#253946]">
              {ordersCount}
            </div>
            <p className="text-xs text-[#95A7B5] mt-1">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#95A7B5]">
              Customers
            </CardTitle>
            <Users className="h-4 w-4 text-[#A76825]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#253946]">
              {customersCount.length}
            </div>
            <p className="text-xs text-[#95A7B5] mt-1">
              +3.7% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#95A7B5]">
              Average Order
            </CardTitle>
            <CreditCard className="h-4 w-4 text-[#A76825]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#253946]">
              {formatCurrency(averageOrderValue)}
            </div>
            <p className="text-xs text-[#95A7B5] mt-1">
              +1.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#253946]">Recent Orders</h2>
          <Button variant="outline" size="sm" className="text-[#95A7B5]">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(Number(order.total))}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <a href={`/admin/orders/${order.id}`}>View</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <CardFooter className="flex justify-end border-t p-4">
            <Button asChild variant="outline">
              <a href="/admin/orders">View All Orders</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 