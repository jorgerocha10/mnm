import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@prisma/client";
import { getLowestPriceByCategory, formatPrice } from "@/lib/services/pricing";

// Fetch featured products
async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 4,
      include: {
        category: true,
      },
    });

    // Convert Decimal values to strings to avoid serialization issues
    const serializedProducts = products.map((product: any) => ({
      ...product,
      price: product.price.toString(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return serializedProducts;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#253946] leading-tight">
              Turn Your Special Places into Lasting Memories
            </h1>
            <p className="text-lg text-[#253946] md:pr-12">
              Custom map frames featuring the locations that matter most to you.
              The perfect gift for weddings, anniversaries, new homes, or any special occasion.
            </p>
            <div className="pt-4">
              <Button
                asChild
                className="bg-[#A76825] hover:bg-[#8a561e] text-white px-8 py-6 text-lg rounded-md"
              >
                <Link href="/products">
                  Shop Now
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] w-full rounded-md overflow-hidden shadow-lg">
            <Image
              src="https://placehold.co/800x600/png"
              alt="Custom map frame"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-[#D2BDA2]/20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#253946] mb-4">Featured Products</h2>
            <p className="text-[#253946] max-w-2xl mx-auto">
              Our most popular map frames, chosen by customers like you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product: any) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group">
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={product.images[0] || "https://placehold.co/600x400/png"}
                      alt={product.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-[#253946] mb-2 group-hover:text-[#A76825] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-[#253946] font-medium">
                        {formatPrice(getLowestPriceByCategory(product.category?.name))}
                      </span>
                      <span className="text-[#95A7B5] text-sm">
                        {product.category?.name}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              className="border-[#95A7B5] text-[#253946] hover:bg-[#95A7B5]/10"
            >
              <Link href="/products">
                View All Products
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#253946] mb-4">How It Works</h2>
            <p className="text-[#253946] max-w-2xl mx-auto">
              Creating your personalized map frame is simple.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#D2BDA2]/30 rounded-full mb-6 flex items-center justify-center h-20 w-20 overflow-hidden">
                <Image
                  src="/images/MapPin.png"
                  alt="Choose Location"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#253946] mb-2">Choose Location</h3>
              <p className="text-[#253946]">
                Select a special place by entering an address or exact coordinates.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-[#D2BDA2]/30 rounded-full mb-6 flex items-center justify-center h-20 w-20 overflow-hidden">
                <Image
                  src="/images/map.png"
                  alt="Pick Your Style"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#253946] mb-2">Pick Your Style</h3>
              <p className="text-[#253946]">
                Choose a frame size and style that matches your decor.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-[#D2BDA2]/30 rounded-full mb-6 flex items-center justify-center h-20 w-20 overflow-hidden">
                <Image
                  src="/images/pen.png"
                  alt="Add Personal Touch"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#253946] mb-2">Add Personal Touch</h3>
              <p className="text-[#253946]">
                Include a custom engraving to commemorate the occasion.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-[#D2BDA2]/30 rounded-full mb-6 flex items-center justify-center h-20 w-20 overflow-hidden">
                <Image
                  src="/images/package.png"
                  alt="We Ship to You"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#253946] mb-2">We Ship to You</h3>
              <p className="text-[#253946]">
                Your finished frame is carefully packaged and delivered to your door.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button
              asChild
              className="bg-[#A76825] hover:bg-[#8a561e] text-white"
            >
              <Link href="/products">
                Shop Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 