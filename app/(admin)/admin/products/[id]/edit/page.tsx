import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '../../components/ProductForm';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/signin');
  }

  // Fetch product data
  const product = await prisma.product.findUnique({
    where: {
      id: params.id,
    },
  });

  // If product not found, return 404
  if (!product) {
    notFound();
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
        <h1 className="text-2xl font-bold text-[#253946]">Edit Product</h1>
        <p className="text-[#95A7B5]">
          Update product details
        </p>
      </div>

      <div className="bg-white rounded-md p-6 shadow">
        <ProductForm 
          initialData={product} 
          categories={categories} 
        />
      </div>
    </div>
  );
} 