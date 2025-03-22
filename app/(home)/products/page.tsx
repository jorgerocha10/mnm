import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilter from "@/components/products/ProductFilter";
import ProductSearch from "@/components/products/ProductSearch";

// Fetch products with filters
async function getProducts(searchParams: {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  frameType?: string;
  frameSize?: string;
  search?: string;
  sort?: string;
  page?: string;
}) {
  try {
    const page = searchParams.page ? parseInt(searchParams.page) : 1;
    const pageSize = 12;
    
    // Build filter conditions
    const where: any = {};
    
    // Category filter
    if (searchParams.category) {
      where.category = {
        slug: searchParams.category
      };
    }
    
    // Price range filter
    if (searchParams.minPrice || searchParams.maxPrice) {
      where.price = {};
      
      if (searchParams.minPrice) {
        where.price.gte = parseFloat(searchParams.minPrice);
      }
      
      if (searchParams.maxPrice) {
        where.price.lte = parseFloat(searchParams.maxPrice);
      }
    }
    
    // Frame type filter
    if (searchParams.frameType) {
      where.frameTypes = searchParams.frameType;
    }
    
    // Frame size filter
    if (searchParams.frameSize) {
      where.frameSizes = searchParams.frameSize;
    }
    
    // Search filter
    if (searchParams.search) {
      where.OR = [
        { name: { contains: searchParams.search, mode: 'insensitive' } },
        { description: { contains: searchParams.search, mode: 'insensitive' } },
      ];
    }
    
    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    
    if (searchParams.sort) {
      switch (searchParams.sort) {
        case 'price-asc':
          orderBy = { price: 'asc' };
          break;
        case 'price-desc':
          orderBy = { price: 'desc' };
          break;
        case 'name-asc':
          orderBy = { name: 'asc' };
          break;
        case 'name-desc':
          orderBy = { name: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }
    
    // Fetch products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        Category: true,
      },
    });
    
    // Convert Decimal objects to strings
    const serializedProducts = products.map(product => ({
      ...product,
      price: product.price.toString(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
    
    // Count total products for pagination
    const totalProducts = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalProducts / pageSize);
    
    return {
      products: serializedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
      }
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
      }
    };
  }
}

// Fetch all categories for filter sidebar
async function getCategories() {
  try {
    const categories = await prisma.category.findMany();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

interface PageProps {
  searchParams: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    frameType?: string;
    frameSize?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default async function ProductsPage({
  searchParams,
}: PageProps) {
  // Await the searchParams before using them
  const params = await searchParams;
  
  const { products, pagination } = await getProducts(params);
  const categories = await getCategories();
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-[#253946] mb-8">Our Products</h1>
      
      {/* Search Bar */}
      <div className="mb-8">
        <ProductSearch initialQuery={params.search} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilter 
            categories={categories}
            selectedCategory={params.category}
            minPrice={params.minPrice}
            maxPrice={params.maxPrice}
            selectedFrameType={params.frameType}
            selectedFrameSize={params.frameSize}
          />
        </div>
        
        {/* Product Grid */}
        <div className="lg:col-span-3">
          <ProductGrid 
            products={products}
            pagination={pagination}
            currentSort={params.sort || 'newest'}
          />
        </div>
      </div>
    </div>
  );
} 