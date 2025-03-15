-- First, update existing Product records
UPDATE "Product"
SET "frameSizes" = 'SIZE_8_5X8_5'
WHERE "frameSizes" = 'SMALL';

UPDATE "Product" 
SET "frameSizes" = 'SIZE_12X12'
WHERE "frameSizes" = 'LARGE';

-- Update OrderItem records
UPDATE "OrderItem"
SET "frameSize" = 'SIZE_8_5X8_5'
WHERE "frameSize" = 'SMALL';

UPDATE "OrderItem"
SET "frameSize" = 'SIZE_12X12'
WHERE "frameSize" = 'LARGE';

-- Update CartItem records
UPDATE "CartItem"
SET "frameSize" = 'SIZE_8_5X8_5'
WHERE "frameSize" = 'SMALL';

UPDATE "CartItem"
SET "frameSize" = 'SIZE_12X12'
WHERE "frameSize" = 'LARGE';

-- After updating all records, we can safely modify the enum
-- This will be handled by the Prisma migration 