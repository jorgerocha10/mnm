import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { FramePricesManager } from "./components/FramePricesManager";
import { prisma } from "@/lib/prisma";

export default async function FramePricesPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/admin/signin");
  }

  // Fetch all categories for the form
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Frame Size Prices"
        description="Manage pricing for different frame sizes by category."
      />
      
      <FramePricesManager categories={categories} />
    </div>
  );
} 