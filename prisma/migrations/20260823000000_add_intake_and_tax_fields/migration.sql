-- NyayLink customer-flow fields: transparent tax totals and state-aware intake.
ALTER TABLE "Order" ADD COLUMN "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "intakeData" JSONB;
ALTER TABLE "Lead" ADD COLUMN "state" TEXT;
