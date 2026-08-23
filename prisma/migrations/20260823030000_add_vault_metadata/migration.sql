-- AlterTable
ALTER TABLE "VaultDocument" ADD COLUMN "reviewedById" TEXT;
ALTER TABLE "VaultDocument" ADD COLUMN "mimeType" TEXT;
ALTER TABLE "VaultDocument" ADD COLUMN "fileSize" INTEGER;
ALTER TABLE "VaultDocument" ADD COLUMN "checksum" TEXT;
ALTER TABLE "VaultDocument" ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "VaultDocument_reviewedById_idx" ON "VaultDocument"("reviewedById");
CREATE INDEX "VaultDocument_checksum_idx" ON "VaultDocument"("checksum");

-- AddForeignKey
ALTER TABLE "VaultDocument" ADD CONSTRAINT "VaultDocument_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
