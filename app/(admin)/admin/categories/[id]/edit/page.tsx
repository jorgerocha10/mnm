import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CategoryForm } from '../../components/CategoryForm';
import { PageHeader } from '@/components/admin/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FrameSizePrices } from '@/components/admin/categories/FrameSizePrices';

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect('/admin/signin');
  }

  // Fetch category data
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  // If category not found, return 404
  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Edit Category" 
        description="Update category details"
      />

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="prices">Frame Size Prices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <div className="bg-white rounded-md p-6 shadow">
            <CategoryForm initialData={category} />
          </div>
        </TabsContent>
        
        <TabsContent value="prices" className="mt-6">
          <div className="bg-white rounded-md p-6 shadow">       
            <FrameSizePrices categoryId={id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 