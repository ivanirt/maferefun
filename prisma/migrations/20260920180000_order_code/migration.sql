-- AlterTable
ALTER TABLE "Order" ADD COLUMN "code" TEXT;

UPDATE "Order" SET "code" = 'MF-' || UPPER(SUBSTRING("id" FROM 1 FOR 6)) WHERE "code" IS NULL;

ALTER TABLE "Order" ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "Order_code_key" ON "Order"("code");
