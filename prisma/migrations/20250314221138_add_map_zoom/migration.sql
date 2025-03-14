-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "mapZoom" INTEGER DEFAULT 13;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "mapZoom" INTEGER DEFAULT 13;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "mapZoom" INTEGER DEFAULT 13;
