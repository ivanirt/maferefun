ALTER TABLE "Consulta" ADD COLUMN IF NOT EXISTS "modality" TEXT;
ALTER TABLE "Consulta" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "ConsultaSlot" (
    "id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "modality" TEXT NOT NULL DEFAULT 'ambas',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ConsultaSlot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ConsultaSlot_weekday_startTime_key" ON "ConsultaSlot"("weekday", "startTime");
CREATE INDEX IF NOT EXISTS "Consulta_scheduledAt_idx" ON "Consulta"("scheduledAt");
