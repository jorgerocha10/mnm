import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@prisma/client";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

// Map status to color and label
const statusConfig: Record<OrderStatus, { color: string; label: string }> = {
  PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
  PROCESSING: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Processing" },
  SHIPPED: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Shipped" },
  DELIVERED: { color: "bg-green-100 text-green-800 border-green-200", label: "Delivered" },
  CANCELLED: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { color, label } = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    label: status,
  };

  return (
    <Badge variant="outline" className={`${color} font-medium`}>
      {label}
    </Badge>
  );
} 