/*
  Warnings:

  - The values [SIZE_20X30,SIZE_24X24,SIZE_24X30,SIZE_28X28,SIZE_28X35,SIZE_35X35] on the enum `FrameSize` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `FrameSizePrice` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `frameSize` on the `FrameSizePrice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FrameSize_new" AS ENUM ('SMALL', 'LARGE', 'SIZE_6X6', 'SIZE_8_5X8_5', 'SIZE_8_5X12', 'SIZE_12X12', 'SIZE_12X16', 'SIZE_16X16', 'SIZE_16X20', 'SIZE_20X20', 'SIZE_20X28', 'SIZE_4_5X8_5', 'SIZE_6X12');
ALTER TABLE "Product" ALTER COLUMN "frameSizes" TYPE "FrameSize_new" USING ("frameSizes"::text::"FrameSize_new");
ALTER TABLE "OrderItem" ALTER COLUMN "frameSize" TYPE "FrameSize_new" USING ("frameSize"::text::"FrameSize_new");
ALTER TABLE "CartItem" ALTER COLUMN "frameSize" TYPE "FrameSize_new" USING ("frameSize"::text::"FrameSize_new");
ALTER TYPE "FrameSize" RENAME TO "FrameSize_old";
ALTER TYPE "FrameSize_new" RENAME TO "FrameSize";
DROP TYPE "FrameSize_old";
COMMIT;

-- DropIndex
DROP INDEX "FrameSizePrice_categoryId_frameSize_key";

-- AlterTable
ALTER TABLE "FrameSizePrice" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "frameSize",
ADD COLUMN     "frameSize" TEXT NOT NULL;
