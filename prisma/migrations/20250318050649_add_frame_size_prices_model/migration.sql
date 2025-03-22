-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FrameSize" ADD VALUE 'SMALL';
ALTER TYPE "FrameSize" ADD VALUE 'LARGE';
ALTER TYPE "FrameSize" ADD VALUE 'SIZE_4_5X8_5';
ALTER TYPE "FrameSize" ADD VALUE 'SIZE_6X12';

-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "frameSize" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "mapOrientation" TEXT DEFAULT 'horizontal',
ALTER COLUMN "frameSize" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "frameSizes" DROP NOT NULL,
ALTER COLUMN "frameSizes" DROP DEFAULT;

-- CreateTable
CREATE TABLE "FrameSizePrice" (
    "id" TEXT NOT NULL,
    "frameSize" "FrameSize" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrameSizePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FrameSizePrice_categoryId_frameSize_key" ON "FrameSizePrice"("categoryId", "frameSize");

-- AddForeignKey
ALTER TABLE "FrameSizePrice" ADD CONSTRAINT "FrameSizePrice_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
