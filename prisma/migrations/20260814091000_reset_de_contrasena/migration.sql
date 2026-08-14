-- Recuperación de contraseña.
-- No existía ninguna forma de recuperar el acceso: un hogar que paga 29,99 €/mes
-- y olvida su contraseña se quedaba fuera de su propia suscripción.

-- Fecha del último cambio de contraseña. La sesión es un JWT de 30 días que no
-- consulta la BD: sin esta marca, restablecer la contraseña no expulsaba a quien
-- ya tuviera la sesión abierta, que es justo para lo que se restablece.
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

-- Sin backfill: NULL significa "nunca se ha cambiado", y ninguna sesión viva
-- debe caducar por desplegar esto.

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    -- SHA-256 del token, nunca el token en claro (ver schema.prisma).
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- Único: el hash es la clave de búsqueda al abrir el enlace, y además impide de
-- raíz que dos filas compartan token.
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- Por usuario: al usar un enlace se invalidan todos los demás de esa cuenta.
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- Por caducidad: para poder barrer los vencidos sin recorrer la tabla entera.
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- Borrar la cuenta se lleva por delante sus enlaces pendientes.
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
