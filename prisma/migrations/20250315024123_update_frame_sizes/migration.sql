/*
  Warnings:

  - The values [SMALL,LARGE] on the enum `FrameSize` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FrameSize_new" AS ENUM ('SIZE_6X6', 'SIZE_8_5X8_5', 'SIZE_8_5X12', 'SIZE_12X12', 'SIZE_12X16', 'SIZE_16X16', 'SIZE_16X20', 'SIZE_20X20', 'SIZE_20X28');
ALTER TABLE "Product" ALTER COLUMN "frameSizes" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "frameSizes" TYPE "FrameSize_new" USING ("frameSizes"::text::"FrameSize_new");
ALTER TABLE "OrderItem" ALTER COLUMN "frameSize" TYPE "FrameSize_new" USING ("frameSize"::text::"FrameSize_new");
ALTER TABLE "CartItem" ALTER COLUMN "frameSize" TYPE "FrameSize_new" USING ("frameSize"::text::"FrameSize_new");
ALTER TYPE "FrameSize" RENAME TO "FrameSize_old";
ALTER TYPE "FrameSize_new" RENAME TO "FrameSize";
DROP TYPE "FrameSize_old";
ALTER TABLE "Product" ALTER COLUMN "frameSizes" SET DEFAULT 'SIZE_8_5X8_5';
COMMIT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "frameSizes" SET DEFAULT 'SIZE_8_5X8_5';
