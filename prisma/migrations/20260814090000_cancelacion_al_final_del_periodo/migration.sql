-- Baja al final del periodo pagado.
-- Cancelar llamaba a stripe.subscriptions.cancel() (baja inmediata, sin
-- prorrateo) y marcaba la fila como CANCELADA en el acto: quien cancelaba el
-- día 2 perdía los 28 días que ya había pagado. Ahora la baja se programa
-- (cancel_at_period_end) y esta columna refleja ese estado intermedio:
-- suscripción ACTIVA, con acceso hasta currentPeriodEnd, pero sin renovación.

ALTER TABLE "Subscription" ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

-- Sin backfill: false es la verdad para todas las filas existentes. Las que ya
-- estaban CANCELADA lo están de verdad (baja inmediata, ya consumada), y las
-- ACTIVA no tienen ninguna baja programada en Stripe que reflejar aquí.
