import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@prisma/client";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

// Map payment status to color and label
const statusConfig: Record<PaymentStatus, { color: string; label: string }> = {
  PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
  PAID: { color: "bg-green-100 text-green-800 border-green-200", label: "Paid" },
  FAILED: { color: "bg-red-100 text-red-800 border-red-200", label: "Failed" },
  REFUNDED: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Refunded" },
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
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