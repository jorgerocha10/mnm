import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CategoryForm } from '../components/CategoryForm';
import { PageHeader } from '@/components/admin/AdminHeader';

export default async function NewCategoryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/signin');
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Add Category" 
        description="Create a new product category"
      />

      <div className="bg-white rounded-md p-6 shadow">
        <CategoryForm />
      </div>
    </div>
  );
} 