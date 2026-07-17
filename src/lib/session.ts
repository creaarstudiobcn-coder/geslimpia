import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

// La sesión es un JWT de 30 días que no sabe nada de la BD: `active` solo se
// comprueba al iniciar sesión (auth.ts). Sin revalidarlo aquí, desactivar una
// cuenta desde /admin no echa a nadie hasta que caduque su token, y la
// moderación queda en un gesto cosmético. Es el mismo criterio que ya aplica
// lib/admin.ts a los administradores, extendido a los usuarios normales.

// Usuario de la sesión para PÁGINAS (server components), o null si no hay sesión
// o la cuenta está desactivada. No añade consultas: ya iba a la BD.
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { cleanerProfile: true, subscription: true },
  });
  if (!user?.active) return null;
  return user;
}

// Sesión para API ROUTES, o null si no hay sesión o la cuenta está desactivada.
// La ruta debe responder 401 si recibe null.
export async function getActiveSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { active: true },
  });
  if (!user?.active) return null;
  return session;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
