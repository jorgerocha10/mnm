import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PageHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteCategoryButton } from "./components/DeleteCategoryButton";

// Define the type for category with count
type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  _count: {
    products: number;
  };
};

async function getCategories(): Promise<CategoryWithCount[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return categories as CategoryWithCount[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/signin');
  }
  
  const categories = await getCategories();

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <PageHeader 
          title="Categories" 
          description="Manage your product categories"
        />
        <Button asChild className="bg-[#A76825] hover:bg-[#8a561e] w-full md:w-auto">
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-md p-8 text-center">
          <h3 className="text-lg font-medium text-[#253946] mb-2">No categories found</h3>
          <p className="text-[#95A7B5] mb-6">Create your first category to organize your products</p>
          <Button asChild className="bg-[#A76825] hover:bg-[#8a561e]">
            <Link href="/admin/categories/new">
              <Plus className="h-4 w-4 mr-2" />
              Create your first category
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div className="relative h-40 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="text-[#95A7B5]">No image</div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-[#253946]">{category.name}</h3>
                  <span className="text-sm text-[#95A7B5]">
                    {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
                  </span>
                </div>
                <p className="text-sm text-[#95A7B5] mb-4 truncate">
                  Slug: {category.slug}
                </p>
                <div className="flex justify-between mt-4">
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm" 
                    className="text-[#253946]"
                  >
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteCategoryButton 
                    id={category.id}
                    name={category.name}
                    disabled={category._count.products > 0}
                    disabledMessage="Cannot delete category with products"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 