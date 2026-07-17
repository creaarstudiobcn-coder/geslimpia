import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/session";
import { sendNewContactEmail } from "@/lib/email";
import { crearReservaConCupo, subscriptionIsActive } from "@/lib/suscripcion";

// Crear una reserva / contacto (solo HOGAR con suscripción activa)
export async function POST(req: Request) {
  const session = await getActiveSession();
  if (!session?.user?.id || session.user.role !== "HOGAR") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (!sub || !subscriptionIsActive(sub)) {
    return NextResponse.json(
      { error: "Necesitas una suscripción activa para contactar limpiadoras." },
      { status: 402 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const cleanerUserId = String(body.cleanerUserId ?? "");
  const hours = Math.min(24, Math.max(1, Number(body.hours) || 2));
  const notes = String(body.notes ?? "").trim().slice(0, 500);
  const dateStr = String(body.date ?? "");
  const date = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Fecha no válida." }, { status: 400 });
  }

  const cleaner = await prisma.user.findFirst({
    where: { id: cleanerUserId, role: "LIMPIADORA" },
  });
  if (!cleaner) {
    return NextResponse.json(
      { error: "Limpiadora no encontrada." },
      { status: 404 }
    );
  }

  let resultado;
  try {
    resultado = await crearReservaConCupo(
      {
        homeUserId: session.user.id,
        cleanerUserId,
        date,
        hours,
        notes,
      },
      sub
    );
  } catch (err) {
    console.error("booking transaction error", err);
    return NextResponse.json(
      { error: "No se pudo crear la reserva. Inténtalo de nuevo." },
      { status: 500 }
    );
  }

  if (resultado.agotado) {
    const renovacion = sub.currentPeriodEnd
      ? ` Tu cupo se renueva el ${sub.currentPeriodEnd.toLocaleDateString(
          "es-ES",
          { day: "numeric", month: "long" }
        )}.`
      : "";
    return NextResponse.json(
      {
        error: "limit",
        message: `Has contactado ${resultado.limite} limpiadoras nuevas este mes, el máximo de tu plan.${renovacion} Si necesitas más, puedes mejorar tu plan.`,
      },
      { status: 403 }
    );
  }

  // Aviso por email a la limpiadora. Fuera de la transacción: es lento, puede
  // fallar y no debe reintentarse si la transacción se repite.
  await sendNewContactEmail({
    to: cleaner.email,
    cleanerName: cleaner.name,
    homeName: session.user.name ?? "Una familia",
    date,
    hours,
    notes,
  });

  return NextResponse.json({ ok: true, bookingId: resultado.bookingId });
}
