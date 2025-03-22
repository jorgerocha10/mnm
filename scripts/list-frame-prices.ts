const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listFrameSizePrices() {
  try {
    // Get all categories with frame size prices
    const categories = await prisma.category.findMany({
      include: {
        FrameSizePrice: true
      }
    });

    console.log('=========================================');
    console.log('FRAME SIZE PRICES FROM DATABASE');
    console.log('=========================================');
    
    if (categories.length === 0) {
      console.log('No categories found in the database.');
      return;
    }

    // Display each category with its prices
    for (const category of categories) {
      console.log(`\n[Category: ${category.name}]`);
      
      if (category.FrameSizePrice.length === 0) {
        console.log('  No frame size prices found for this category.');
        continue;
      }
      
      // Display prices sorted by frame size
      const sortedPrices = [...category.FrameSizePrice].sort((a, b) => 
        a.frameSize.localeCompare(b.frameSize)
      );
      
      for (const price of sortedPrices) {
        console.log(`  ${price.frameSize}: $${price.price}`);
      }
    }
    
    console.log('\n=========================================');
  } catch (error) {
    console.error('Error fetching frame size prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
listFrameSizePrices(); 