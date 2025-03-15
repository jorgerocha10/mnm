-- Step 1: Create a new enum type with all the values
CREATE TYPE "FrameSize_new" AS ENUM (
  'SMALL',
  'LARGE',
  'SIZE_6X6',
  'SIZE_8_5X8_5',
  'SIZE_8_5X12',
  'SIZE_12X12',
  'SIZE_12X16',
  'SIZE_16X16',
  'SIZE_16X20',
  'SIZE_20X20',
  'SIZE_20X28'
);

-- Step 2: Update the tables to use the new enum type
-- First, create temporary columns
ALTER TABLE "Product" ADD COLUMN "frameSizes_new" "FrameSize_new";
ALTER TABLE "OrderItem" ADD COLUMN "frameSize_new" "FrameSize_new";
ALTER TABLE "CartItem" ADD COLUMN "frameSize_new" "FrameSize_new";

-- Step 3: Copy data from old columns to new columns
UPDATE "Product" SET "frameSizes_new" = "frameSizes"::text::"FrameSize_new";
UPDATE "OrderItem" SET "frameSize_new" = "frameSize"::text::"FrameSize_new";
UPDATE "CartItem" SET "frameSize_new" = "frameSize"::text::"FrameSize_new";

-- Step 4: Drop old columns and rename new columns
ALTER TABLE "Product" DROP COLUMN "frameSizes";
ALTER TABLE "OrderItem" DROP COLUMN "frameSize";
ALTER TABLE "CartItem" DROP COLUMN "frameSize";

ALTER TABLE "Product" RENAME COLUMN "frameSizes_new" TO "frameSizes";
ALTER TABLE "OrderItem" RENAME COLUMN "frameSize_new" TO "frameSize";
ALTER TABLE "CartItem" RENAME COLUMN "frameSize_new" TO "frameSize";

-- Step 5: Drop the old enum type and rename the new one
DROP TYPE "FrameSize";
ALTER TYPE "FrameSize_new" RENAME TO "FrameSize";

-- Step 6: Update existing records to use the new enum values
UPDATE "Product" SET "frameSizes" = 'SIZE_8_5X8_5' WHERE "frameSizes" = 'SMALL';
UPDATE "Product" SET "frameSizes" = 'SIZE_12X12' WHERE "frameSizes" = 'LARGE';

UPDATE "OrderItem" SET "frameSize" = 'SIZE_8_5X8_5' WHERE "frameSize" = 'SMALL';
UPDATE "OrderItem" SET "frameSize" = 'SIZE_12X12' WHERE "frameSize" = 'LARGE';

UPDATE "CartItem" SET "frameSize" = 'SIZE_8_5X8_5' WHERE "frameSize" = 'SMALL';
UPDATE "CartItem" SET "frameSize" = 'SIZE_12X12' WHERE "frameSize" = 'LARGE'; 