import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId, logAdmin } from "@/lib/admin";
import { stripe, demoMode } from "@/lib/stripe";
import { cancelarSiSigueViva } from "@/lib/suscripcionStripe";

// Antes de desactivar o borrar una cuenta hay que cancelar su suscripción en
// Stripe. Borrar la fila no le dice nada a Stripe, que seguía cobrando la cuota
// cada mes a alguien que ya no podía ni entrar: cobro sin servicio.
// Devuelve una respuesta de error si NO se ha podido cancelar (y entonces no se
// toca la cuenta), o null si se puede seguir.
async function cancelarSuscripcionDe(userId: string): Promise<NextResponse | null> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub?.stripeSubscriptionId) return null;

  if (!stripe && !demoMode) {
    // En producción, sin clave no podemos garantizar que se deje de cobrar:
    // mejor no tocar la cuenta. (En local/demo no hay Stripe al que avisar.)
    return NextResponse.json(
      {
        error:
          "No se puede cancelar su suscripción en Stripe ahora mismo (Stripe no está configurado). No se ha cambiado nada.",
      },
      { status: 503 }
    );
  }
  try {
    if (stripe) await cancelarSiSigueViva(sub.stripeSubscriptionId);
  } catch (err) {
    console.error("admin: error cancelando suscripción en Stripe", err);
    return NextResponse.json(
      {
        error:
          "No se pudo cancelar su suscripción en Stripe. No se ha cambiado nada: inténtalo de nuevo o cancélala desde el panel de Stripe.",
      },
      { status: 502 }
    );
  }
  await prisma.subscription.update({
    where: { userId },
    data: { status: "CANCELADA", cancelAtPeriodEnd: false },
  });
  return null;
}

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
      // Desactivar deja a la cuenta sin poder entrar: no se le puede seguir
      // cobrando. Reactivar NO reabre la suscripción; tendrá que suscribirse.
      if (!active) {
        const fallo = await cancelarSuscripcionDe(id);
        if (fallo) return fallo;
      }
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

  // Primero Stripe: si no se puede cancelar el cobro, no se borra nada (después
  // ya no tendríamos el id de la suscripción para cancelarla).
  const fallo = await cancelarSuscripcionDe(id);
  if (fallo) return fallo;

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
