import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CategoryForm } from '../../components/CategoryForm';
import { PageHeader } from '@/components/admin/AdminHeader';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/signin');
  }

  // Fetch category data
  const category = await prisma.category.findUnique({
    where: {
      id: params.id,
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

      <div className="bg-white rounded-md p-6 shadow">
        <CategoryForm initialData={category} />
      </div>
    </div>
  );
} 