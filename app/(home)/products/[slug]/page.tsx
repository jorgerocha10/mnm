import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import ProductOptions from '@/components/products/ProductOptions';
import RelatedProducts from '@/components/products/RelatedProducts';
import ProductReviews from '@/components/products/ProductReviews';
import { Separator } from '@/components/ui/separator';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for the product page
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }
  
  return {
    title: `${product.name} | Maps & Memories`,
    description: product.description,
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

// Fetch product by slug
async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        Category: true,
        Review: true,
      },
    });
    
    if (!product) return null;
    
    // Convert Decimal values to strings to avoid serialization issues
    const serializedProduct = {
      ...product,
      price: product.price.toString(),
      createdAt: typeof product.createdAt === 'object' && product.createdAt !== null && 'toISOString' in product.createdAt 
        ? product.createdAt.toISOString() 
        : product.createdAt,
      updatedAt: typeof product.updatedAt === 'object' && product.updatedAt !== null && 'toISOString' in product.updatedAt
        ? product.updatedAt.toISOString()
        : product.updatedAt,
      category: product.Category ? {
        ...product.Category,
        createdAt: typeof product.Category.createdAt === 'object' && product.Category.createdAt !== null && 'toISOString' in product.Category.createdAt
          ? product.Category.createdAt.toISOString()
          : product.Category.createdAt,
        updatedAt: typeof product.Category.updatedAt === 'object' && product.Category.updatedAt !== null && 'toISOString' in product.Category.updatedAt
          ? product.Category.updatedAt.toISOString()
          : product.Category.updatedAt,
      } : null,
      reviews: product.Review.map((review: any) => ({
        ...review,
        createdAt: typeof review.createdAt === 'object' && review.createdAt !== null && 'toISOString' in review.createdAt
          ? review.createdAt.toISOString()
          : review.createdAt,
      }))
    };
    
    return serializedProduct;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Fetch related products
async function getRelatedProducts(categoryId: string | null, currentProductId: string) {
  try {
    if (!categoryId) {
      return [];
    }
    
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: currentProductId },
      },
      take: 4,
      include: {
        Category: true,
      },
    });
    
    // Convert Decimal values to strings to avoid serialization issues
    const serializedProducts = relatedProducts.map((product: any) => ({
      ...product,
      price: product.price.toString(),
      createdAt: typeof product.createdAt === 'object' && product.createdAt !== null && 'toISOString' in product.createdAt
        ? product.createdAt.toISOString()
        : product.createdAt,
      updatedAt: typeof product.updatedAt === 'object' && product.updatedAt !== null && 'toISOString' in product.updatedAt
        ? product.updatedAt.toISOString()
        : product.updatedAt,
      category: product.Category ? {
        ...product.Category,
        createdAt: typeof product.Category.createdAt === 'object' && product.Category.createdAt !== null && 'toISOString' in product.Category.createdAt
          ? product.Category.createdAt.toISOString()
          : product.Category.createdAt,
        updatedAt: typeof product.Category.updatedAt === 'object' && product.Category.updatedAt !== null && 'toISOString' in product.Category.updatedAt
          ? product.Category.updatedAt.toISOString()
          : product.Category.updatedAt,
      } : null,
    }));
    
    return serializedProducts;
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    notFound();
  }
  
  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);
  
  // Calculate average rating
  const avgRating = product.Review.length > 0
    ? product.Review.reduce((sum: number, review: any) => sum + review.rating, 0) / product.Review.length
    : 0;
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="relative h-[400px] sm:h-[500px] rounded-md overflow-hidden">
          <Image
            src={product.images[0] || "https://placehold.co/800x600/png"}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            priority
            className="rounded-md"
          />
        </div>
        
        {/* Product Details */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <span className="text-[#95A7B5]">{product.Category?.name}</span>
              <span className="w-1 h-1 rounded-full bg-[#95A7B5]"></span>
              <span className="text-[#95A7B5]">
                {product.Review.length} {product.Review.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#253946] mb-2">
              {product.name}
            </h1>
            <p className="text-[#253946] mb-6">
              {product.description}
            </p>
          </div>
          
          {/* Product Options Form */}
          <ProductOptions product={product} />
        </div>
      </div>
      
      <Separator className="my-16 bg-[#D2BDA2]/30" />
      
      {/* Reviews Section */}
      <ProductReviews 
        productId={product.id} 
        reviews={product.Review} 
        averageRating={avgRating} 
      />
      
      <Separator className="my-16 bg-[#D2BDA2]/30" />
      
      {/* Related Products */}
      <RelatedProducts 
        products={relatedProducts} 
        categoryName={product.Category?.name || 'Similar Products'} 
      />
    </div>
  );
} 