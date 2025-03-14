const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  console.log('Cleaning database...');
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.admin.create({
    data: {
      name: 'Admin User',
      email: 'admin@mapsandmemories.com',
      password: hashedPassword,
    },
  });

  // Create categories
  console.log('Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'City Maps',
        slug: 'city-maps',
        image: 'https://placehold.co/600x400/png',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Nature Locations',
        slug: 'nature-locations',
        image: 'https://placehold.co/600x400/png',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Special Moments',
        slug: 'special-moments',
        image: 'https://placehold.co/600x400/png',
      },
    }),
  ]);

  // Create products
  console.log('Creating sample products...');
  
  const productsData = [
    {
      name: 'City Map Memory Frame',
      slug: 'city-map-memory-frame',
      description: 'A beautiful framed map of your favorite city, perfect for remembering special locations.',
      price: 49.99,
      images: ['https://placehold.co/600x400/png', 'https://placehold.co/600x400/png'],
      stock: 25,
      category: categories[0],
    },
    {
      name: 'Mountain Trail Memory',
      slug: 'mountain-trail-memory',
      description: 'Capture your favorite hiking trail or mountain view in an elegant frame.',
      price: 54.99,
      images: ['https://placehold.co/600x400/png', 'https://placehold.co/600x400/png'],
      stock: 15,
      category: categories[1],
    },
    {
      name: 'Wedding Venue Map',
      slug: 'wedding-venue-map',
      description: 'Commemorate your wedding day with a beautifully framed map of your venue.',
      price: 59.99,
      images: ['https://placehold.co/600x400/png', 'https://placehold.co/600x400/png'],
      stock: 20,
      category: categories[2],
    },
    {
      name: 'First Home Location',
      slug: 'first-home-location',
      description: 'Remember your first home with this customized map frame.',
      price: 49.99,
      images: ['https://placehold.co/600x400/png', 'https://placehold.co/600x400/png'],
      stock: 30,
      category: categories[2],
    },
  ];

  for (const productData of productsData) {
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        images: productData.images,
        stock: productData.stock,
        categoryId: productData.category.id,
      },
    });

    // Add a sample review for each product
    await prisma.review.create({
      data: {
        rating: 5,
        comment: 'Absolutely love this product! The quality is amazing and it looks beautiful on my wall.',
        customerName: 'Happy Customer',
        productId: product.id,
      },
    });
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 