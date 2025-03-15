-- Add mapOrientation column to OrderItem table
ALTER TABLE "OrderItem" ADD COLUMN "mapOrientation" TEXT DEFAULT 'horizontal';

-- Add mapOrientation column to CartItem table (to maintain consistency)
ALTER TABLE "CartItem" ADD COLUMN "mapOrientation" TEXT DEFAULT 'horizontal'; 