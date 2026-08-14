import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

// La sesión es un JWT de 30 días que no sabe nada de la BD: `active` solo se
// comprueba al iniciar sesión (auth.ts). Sin revalidarlo aquí, desactivar una
// cuenta desde /admin no echa a nadie hasta que caduque su token, y la
// moderación queda en un gesto cosmético. Es el mismo criterio que ya aplica
// lib/admin.ts a los administradores, extendido a los usuarios normales.

// Por el mismo motivo se revisa aquí el cambio de contraseña: restablecerla
// tiene que cerrar las sesiones que ya estaban abiertas (si no, quien hubiera
// entrado con la contraseña vieja se queda dentro 30 días y restablecerla no
// sirve para lo que se restablece).
//
// Comparamos en SEGUNDOS truncados porque `iat` viene en segundos: si se compara
// contra los milisegundos de passwordChangedAt, la sesión que se abre justo
// después de cambiar la contraseña se invalida a sí misma por unos milisegundos.
export function sesionAnteriorAlCambio(
  tokenIssuedAt: number | null | undefined,
  passwordChangedAt: Date | null
): boolean {
  if (!passwordChangedAt) return false;
  // Sin `iat` no podemos fecharla; la damos por anterior (fail-closed): como
  // mucho obliga a volver a entrar, nunca deja pasar a quien no debe.
  if (typeof tokenIssuedAt !== "number") return true;
  return Math.floor(passwordChangedAt.getTime() / 1000) > tokenIssuedAt;
}

// Usuario de la sesión para PÁGINAS (server components), o null si no hay sesión,
// la cuenta está desactivada o la contraseña cambió después de iniciarla.
// No añade consultas: ya iba a la BD.
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { cleanerProfile: true, subscription: true },
  });
  if (!user?.active) return null;
  if (sesionAnteriorAlCambio(session.user.tokenIssuedAt, user.passwordChangedAt))
    return null;
  return user;
}

// Sesión para API ROUTES, o null si no vale (mismos motivos que arriba).
// La ruta debe responder 401 si recibe null.
export async function getActiveSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { active: true, passwordChangedAt: true },
  });
  if (!user?.active) return null;
  if (sesionAnteriorAlCambio(session.user.tokenIssuedAt, user.passwordChangedAt))
    return null;
  return session;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
