/*
  Warnings:

  - Added the required column `propertySize` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quoteDescription` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urgency` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'PENDING_QUOTE';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "propertySize" TEXT NOT NULL,
ADD COLUMN     "quoteDescription" TEXT NOT NULL,
ADD COLUMN     "quotedPrice" DOUBLE PRECISION,
ADD COLUMN     "urgency" TEXT NOT NULL,
ALTER COLUMN "totalPrice" DROP NOT NULL;
