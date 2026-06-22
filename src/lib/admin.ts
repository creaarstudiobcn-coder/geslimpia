import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

// Verificación de ADMIN para PÁGINAS (server components). Si no es admin, devuelve
// notFound() (404) para no revelar la existencia del panel. Devuelve el usuario admin.
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    notFound();
  }
  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  // Doble comprobación contra la BD (el token podría estar desfasado).
  if (!admin || admin.role !== "ADMIN" || !admin.active) {
    notFound();
  }
  return admin;
}

// Verificación de ADMIN para API ROUTES. Devuelve el id del admin o null.
// La ruta debe responder 403 si recibe null. NUNCA confiar solo en el cliente.
export async function getAdminId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, active: true },
  });
  if (!admin || admin.role !== "ADMIN" || !admin.active) return null;
  return admin.id;
}

// Registra una acción del admin en la tabla de auditoría (quién, qué, a quién, cuándo).
export async function logAdmin(params: {
  adminId: string;
  action:
    | "VERIFY"
    | "UNVERIFY"
    | "DEACTIVATE"
    | "REACTIVATE"
    | "DELETE_USER"
    | "HIDE_REVIEW"
    | "SHOW_REVIEW"
    | "DELETE_REVIEW";
  targetType: "USER" | "CLEANER" | "REVIEW";
  targetId: string;
  detail?: string;
}) {
  await prisma.adminLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      detail: params.detail ?? "",
    },
  });
}
