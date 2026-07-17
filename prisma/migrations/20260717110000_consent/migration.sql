-- Prueba del consentimiento (RGPD arts. 5.2 y 7.1).
-- El registro no recogía ni guardaba la aceptación de la Política de Privacidad
-- y los Términos, así que no había forma de demostrarla. Guardamos cuándo se
-- aceptó y qué versión de los textos estaba vigente en ese momento.

ALTER TABLE "User" ADD COLUMN "consentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "consentVersion" TEXT;

-- Sin backfill a propósito: las cuentas anteriores nunca aceptaron nada, y
-- rellenar estas columnas sería fabricar una prueba de consentimiento que no
-- existe. Quedan en NULL, que es la verdad: consentimiento no acreditado.
