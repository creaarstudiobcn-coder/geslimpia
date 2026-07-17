-- Cupo de contactos por periodo de facturación.
-- Hasta ahora el límite del plan se contaba sobre TODAS las reservas históricas
-- del hogar, así que quien renovaba el mes siguiente seguía bloqueado pese a
-- haber pagado. Guardamos el inicio del periodo que reporta Stripe para saber
-- qué contactos consumen el cupo del mes en curso.

ALTER TABLE "Subscription" ADD COLUMN "currentPeriodStart" TIMESTAMP(3);

-- Backfill de las suscripciones que ya existen: Stripe factura mensualmente, así
-- que el periodo en curso empezó un mes antes de su vencimiento. Las filas sin
-- vencimiento las resuelve el código cayendo a la fecha de alta.
UPDATE "Subscription"
SET "currentPeriodStart" = "currentPeriodEnd" - INTERVAL '1 month'
WHERE "currentPeriodEnd" IS NOT NULL;

-- El cupo se calcula recorriendo las reservas del hogar por fecha de creación.
CREATE INDEX "Booking_homeUserId_createdAt_idx" ON "Booking"("homeUserId", "createdAt");
