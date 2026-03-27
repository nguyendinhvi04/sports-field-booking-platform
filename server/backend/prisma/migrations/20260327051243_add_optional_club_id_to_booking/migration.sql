-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_courtId_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "clubId" TEXT,
ALTER COLUMN "courtId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
