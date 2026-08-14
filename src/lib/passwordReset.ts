// Enlaces de "he olvidado mi contraseña".
//
// Criterios de seguridad:
//  · El token viaja SOLO en el email. En la BD guardamos su SHA-256, así que un
//    volcado de la tabla no permite entrar en ninguna cuenta.
//  · Caduca en 1 hora y es de un solo uso (marcado atómico).
//  · Usar un enlace invalida todos los demás enlaces pendientes de esa cuenta.
//  · Nunca revelamos si un email existe: eso lo garantiza la ruta /api/auth/forgot.

import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

// Vida del enlace. Corta: abre una cuenta y se queda en la bandeja de entrada.
export const TOKEN_TTL_MINUTOS = 60;

// Espera mínima entre dos enlaces para la misma cuenta. Sin esto, cualquiera
// puede llenar de correos el buzón de un tercero pulsando "enviar" en bucle.
const REENVIO_MINIMO_SEGUNDOS = 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Crea un enlace de restablecimiento y devuelve el token EN CLARO (lo único que
 * se envía por email). Devuelve null si se pidió otro hace menos de un minuto:
 * el que ya está en su buzón sigue siendo válido.
 */
export async function crearTokenDeReset(userId: string): Promise<string | null> {
  const ultimo = await prisma.passwordResetToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (
    ultimo &&
    Date.now() - ultimo.createdAt.getTime() < REENVIO_MINIMO_SEGUNDOS * 1000
  ) {
    return null;
  }

  // 32 bytes de aleatoriedad criptográfica: no se adivina por fuerza bruta.
  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTOS * 60_000),
    },
  });
  return token;
}

export type ResultadoToken =
  | { ok: true; userId: string }
  | { ok: false; motivo: "invalido" | "usado" | "caducado" };

/**
 * Valida y consume un token. El consumo es atómico: si el mismo enlace llega dos
 * veces a la vez (doble clic, prefetch del cliente de correo), solo una gana.
 */
export async function usarTokenDeReset(
  token: string
): Promise<ResultadoToken> {
  if (!token) return { ok: false, motivo: "invalido" };

  const fila = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!fila) return { ok: false, motivo: "invalido" };
  if (fila.usedAt) return { ok: false, motivo: "usado" };
  if (fila.expiresAt < new Date()) return { ok: false, motivo: "caducado" };

  // El where con usedAt: null es lo que hace de cerrojo: la segunda petición
  // actualiza 0 filas y se va con "usado" en vez de restablecer otra vez.
  const marcado = await prisma.passwordResetToken.updateMany({
    where: { id: fila.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (marcado.count !== 1) return { ok: false, motivo: "usado" };

  return { ok: true, userId: fila.userId };
}

/**
 * Comprueba si un token sigue siendo utilizable SIN consumirlo. Lo usa la página
 * del formulario para no enseñar campos de contraseña bajo un enlace muerto.
 */
export async function tokenSigueValido(token: string): Promise<boolean> {
  if (!token) return false;
  const fila = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { usedAt: true, expiresAt: true },
  });
  return !!fila && !fila.usedAt && fila.expiresAt > new Date();
}

/** Invalida los enlaces pendientes de una cuenta (tras cambiar la contraseña). */
export async function invalidarTokensDe(userId: string): Promise<void> {
  await prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
}
