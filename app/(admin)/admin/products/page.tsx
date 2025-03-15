import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { 
  Search, 
  PlusCircle, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  ArrowUpDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/utils';

interface ProductsPageProps {
  searchParams: {
    query?: string;
    sort?: string;
    category?: string;
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/signin');
  }

  const { query, sort, category, page = '1' } = searchParams;
  const pageSize = 10;
  const skip = (parseInt(page) - 1) * pageSize;
  
  // Build query filters
  const where: Prisma.ProductWhereInput = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = {
      slug: category,
    };
  }

  // Get sorting configuration
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  
  if (sort === 'price-asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price-desc') {
    orderBy = { price: 'desc' };
  } else if (sort === 'name-asc') {
    orderBy = { name: 'asc' };
  } else if (sort === 'name-desc') {
    orderBy = { name: 'desc' };
  }

  // Fetch products
  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
    include: {
      category: true,
    },
  });

  // Get total count for pagination
  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalProducts / pageSize);

  // Fetch categories for filter
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#253946]">Products</h1>
        <Button className="bg-[#A76825] hover:bg-[#8a561e]">
          <PlusCircle className="mr-2 h-4 w-4" />
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#95A7B5]" size={18} />
          <form>
            <Input
              name="query"
              placeholder="Search products..."
              className="pl-10"
              defaultValue={query || ''}
            />
          </form>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="px-2 py-1.5 text-sm font-semibold">Categories</p>
                <form>
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat.id} asChild>
                      <Link 
                        href={`/admin/products?category=${cat.slug}`}
                        className="flex items-center gap-2"
                      >
                        <Checkbox 
                          id={`category-${cat.slug}`} 
                          checked={category === cat.slug}
                          className="data-[state=checked]:bg-[#A76825]"
                        />
                        <span>{cat.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </form>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowUpDown size={16} />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href="/admin/products?sort=name-asc">
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
              </Link>
              <Link href="/admin/products?sort=name-desc">
                <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
              </Link>
              <Link href="/admin/products?sort=price-asc">
                <DropdownMenuItem>Price (Low to High)</DropdownMenuItem>
              </Link>
              <Link href="/admin/products?sort=price-desc">
                <DropdownMenuItem>Price (High to Low)</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  id="select-all"
                  className="data-[state=checked]:bg-[#A76825]"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Frame Options</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox 
                      id={`select-${product.id}`}
                      className="data-[state=checked]:bg-[#A76825]"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-[#F7F5F6] flex items-center justify-center text-[#95A7B5]">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-[#95A7B5]">{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="outline">{product.category.name}</Badge>
                    ) : (
                      <span className="text-[#95A7B5] text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        product.stock > 10 
                          ? "bg-green-100 text-green-800" 
                          : product.stock > 0 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {product.stock > 10 
                        ? "In Stock" 
                        : product.stock > 0 
                          ? "Low Stock" 
                          : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-[#95A7B5]">
                        Frame: {product.frameTypes}
                      </span>
                      <span className="text-xs text-[#95A7B5]">
                        Size: {product.frameSizes || 'Not set'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link 
              key={p} 
              href={`/admin/products?page=${p}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}${category ? `&category=${category}` : ''}`}
            >
              <Button 
                variant={p.toString() === page ? "default" : "outline"}
                size="sm"
                className={p.toString() === page ? "bg-[#A76825]" : ""}
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 