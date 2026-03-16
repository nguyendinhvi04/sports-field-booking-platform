-- AddForeignKey
ALTER TABLE "club_customers" ADD CONSTRAINT "club_customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
