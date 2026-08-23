-- AlterTable
ALTER TABLE "Service" ADD COLUMN "description" TEXT;
ALTER TABLE "Service" ADD COLUMN "intakeSchema" JSONB;
ALTER TABLE "Service" ADD COLUMN "documentChecklist" JSONB;
ALTER TABLE "Service" ADD COLUMN "recommendationTags" JSONB;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "assignedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "assignmentNote" TEXT;
ALTER TABLE "Order" ADD COLUMN "professionalType" TEXT;
ALTER TABLE "Order" ADD COLUMN "completedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CaseEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "actorId" TEXT,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseMessage" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "senderId" TEXT,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceReminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "reminderType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDelivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "documentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseEvent_orderId_createdAt_idx" ON "CaseEvent"("orderId", "createdAt");
CREATE INDEX "CaseEvent_actorId_idx" ON "CaseEvent"("actorId");
CREATE INDEX "CaseMessage_orderId_createdAt_idx" ON "CaseMessage"("orderId", "createdAt");
CREATE INDEX "CaseMessage_senderId_idx" ON "CaseMessage"("senderId");
CREATE INDEX "ComplianceReminder_userId_dueAt_idx" ON "ComplianceReminder"("userId", "dueAt");
CREATE INDEX "ComplianceReminder_orderId_idx" ON "ComplianceReminder"("orderId");
CREATE INDEX "ComplianceReminder_status_dueAt_idx" ON "ComplianceReminder"("status", "dueAt");
CREATE UNIQUE INDEX "CaseDelivery_orderId_key" ON "CaseDelivery"("orderId");
CREATE INDEX "CaseDelivery_status_deliveredAt_idx" ON "CaseDelivery"("status", "deliveredAt");

-- AddForeignKey
ALTER TABLE "CaseEvent" ADD CONSTRAINT "CaseEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CaseEvent" ADD CONSTRAINT "CaseEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseMessage" ADD CONSTRAINT "CaseMessage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CaseMessage" ADD CONSTRAINT "CaseMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ComplianceReminder" ADD CONSTRAINT "ComplianceReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ComplianceReminder" ADD CONSTRAINT "ComplianceReminder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseDelivery" ADD CONSTRAINT "CaseDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
