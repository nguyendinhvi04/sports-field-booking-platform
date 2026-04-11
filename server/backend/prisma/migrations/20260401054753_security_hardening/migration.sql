-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "isRevoked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastLoginIp" TEXT,
ADD COLUMN     "lastPasswordChangeAt" TIMESTAMP(3),
ADD COLUMN     "lockoutUntil" TIMESTAMP(3);
