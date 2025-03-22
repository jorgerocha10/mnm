-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FrameSize" ADD VALUE 'SIZE_20X30';
ALTER TYPE "FrameSize" ADD VALUE 'SIZE_24X24';
ALTER TYPE "FrameSize" ADD VALUE 'SIZE_24X30';
ALTER TYPE "FrameSize" ADD VALUE 'SIZE_28X28';
ALTER TYPE "FrameSize" ADD VALUE 'SIZE_28X35';
ALTER TYPE "FrameSize" ADD VALUE 'SIZE_35X35';
