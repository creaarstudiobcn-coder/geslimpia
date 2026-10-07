import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/session";
import { sendNewContactEmail } from "@/lib/email";
import { crearReservaConCupo, subscriptionIsActive } from "@/lib/suscripcion";
import { HORAS_MAX, HORAS_MIN } from "@/lib/constants";
import { diaYMes } from "@/lib/fechas";

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
  // Horas: se rechaza lo que se sale del rango en vez de recortarlo en
  // silencio (antes 30 h se guardaban como 24 sin decir nada).
  const hours = body.hours === undefined || body.hours === "" ? 2 : Number(body.hours);
  if (!Number.isFinite(hours) || hours < HORAS_MIN || hours > HORAS_MAX) {
    return NextResponse.json(
      { error: `Las horas tienen que estar entre ${HORAS_MIN} y ${HORAS_MAX}.` },
      { status: 400 }
    );
  }
  const notes = String(body.notes ?? "").trim().slice(0, 500);

  // La fecha llega en ISO con zona (el navegador convierte su hora local con
  // toISOString). Antes llegaba "2026-10-10T10:00" sin zona y el servidor, en
  // UTC, la guardaba dos horas más tarde de lo que la persona había elegido.
  const dateStr = String(body.date ?? "");
  const date = new Date(dateStr);
  if (!dateStr || isNaN(date.getTime())) {
    return NextResponse.json(
      { error: "Indica el día y la hora de la limpieza." },
      { status: 400 }
    );
  }
  if (date.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "La fecha elegida ya ha pasado. Elige un día y una hora futuros." },
      { status: 400 }
    );
  }

  // Solo limpiadoras que pueden recibir trabajo: cuenta activa y perfil
  // completado (las mismas que salen en la búsqueda). Antes bastaba con el id
  // para reservar con una cuenta desactivada por el admin.
  const cleaner = await prisma.user.findFirst({
    where: {
      id: cleanerUserId,
      role: "LIMPIADORA",
      active: true,
      cleanerProfile: { is: { onboarded: true } },
    },
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
      ? ` Tu cupo se renueva el ${diaYMes(sub.currentPeriodEnd)}.`
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
