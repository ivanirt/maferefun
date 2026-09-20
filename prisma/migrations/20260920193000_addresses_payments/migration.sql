ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethodId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "addressId" TEXT;

CREATE TABLE IF NOT EXISTS "Address" (
    "id" TEXT NOT NULL,
    "devoteeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PaymentMethod" (
    "id" TEXT NOT NULL,
    "devoteeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "expMonth" INTEGER NOT NULL,
    "expYear" INTEGER NOT NULL,
    "holder" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "Address" ADD CONSTRAINT "Address_devoteeId_fkey" FOREIGN KEY ("devoteeId") REFERENCES "Devotee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_devoteeId_fkey" FOREIGN KEY ("devoteeId") REFERENCES "Devotee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
