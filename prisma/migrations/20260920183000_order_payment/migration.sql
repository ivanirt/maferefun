-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentId" TEXT;
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'pendiente_pago';
