import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '../components/ProductForm';

export default async function NewProductPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/signin');
  }

  // Fetch categories for the form
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#253946]">New Product</h1>
        <p className="text-[#95A7B5]">
          Create a new product to add to your store
        </p>
      </div>

      <div className="bg-white rounded-md p-6 shadow">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
} 