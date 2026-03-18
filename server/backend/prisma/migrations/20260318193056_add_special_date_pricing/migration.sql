-- CreateTable
CREATE TABLE "special_date_pricings" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "specificDate" DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "pricePerHour" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_date_pricings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "special_date_pricings" ADD CONSTRAINT "special_date_pricings_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
