import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId, logAdmin } from "@/lib/admin";

// PATCH /api/admin/users/[id] — verificar/desverificar (limpiadora) o activar/desactivar.
// Body: { action: "verify" | "unverify" | "activate" | "deactivate" }
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");

  const target = await prisma.user.findUnique({
    where: { id },
    include: { cleanerProfile: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  // Salvaguarda: no se actúa sobre cuentas de administrador desde el panel.
  if (target.role === "ADMIN") {
    return NextResponse.json(
      { error: "No se puede modificar una cuenta de administrador." },
      { status: 400 }
    );
  }

  switch (action) {
    case "verify":
    case "unverify": {
      if (!target.cleanerProfile) {
        return NextResponse.json(
          { error: "Este usuario no es una limpiadora." },
          { status: 400 }
        );
      }
      const verified = action === "verify";
      await prisma.cleanerProfile.update({
        where: { userId: id },
        data: { verified },
      });
      await logAdmin({
        adminId,
        action: verified ? "VERIFY" : "UNVERIFY",
        targetType: "CLEANER",
        targetId: id,
        detail: target.email,
      });
      return NextResponse.json({ ok: true, verified });
    }
    case "activate":
    case "deactivate": {
      const active = action === "activate";
      await prisma.user.update({ where: { id }, data: { active } });
      await logAdmin({
        adminId,
        action: active ? "REACTIVATE" : "DEACTIVATE",
        targetType: "USER",
        targetId: id,
        detail: target.email,
      });
      return NextResponse.json({ ok: true, active });
    }
    default:
      return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }
}

// DELETE /api/admin/users/[id] — baja definitiva (cascade borra perfil, reservas,
// mensajes, suscripción, etc.). Se registra en AdminLog ANTES de borrar.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  if (target.role === "ADMIN") {
    return NextResponse.json(
      { error: "No se puede eliminar una cuenta de administrador." },
      { status: 400 }
    );
  }

  // Auditoría antes del borrado (después ya no existiría el target).
  await logAdmin({
    adminId,
    action: "DELETE_USER",
    targetType: target.role === "LIMPIADORA" ? "CLEANER" : "USER",
    targetId: id,
    detail: `${target.email} (${target.role ?? "sin rol"})`,
  });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
