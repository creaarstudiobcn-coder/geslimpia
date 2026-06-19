import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANES, type PlanId } from "@/lib/constants";

// Crear una reserva / contacto (solo HOGAR con suscripción activa)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "HOGAR") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (!sub || sub.status !== "ACTIVA") {
    return NextResponse.json(
      { error: "Necesitas una suscripción activa para contactar limpiadoras." },
      { status: 402 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const cleanerUserId = String(body.cleanerUserId ?? "");
  const hours = Math.max(1, Number(body.hours) || 2);
  const notes = String(body.notes ?? "").trim();
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

  // Límite de contactos según plan: contamos limpiadoras distintas ya contactadas
  const contactedCleaners = await prisma.booking.findMany({
    where: { homeUserId: session.user.id },
    select: { cleanerUserId: true },
    distinct: ["cleanerUserId"],
  });
  const contactedIds = new Set(contactedCleaners.map((b) => b.cleanerUserId));
  const isNewContact = !contactedIds.has(cleanerUserId);
  const limit = PLANES[sub.plan as PlanId].contactos;

  if (isNewContact && contactedIds.size >= limit) {
    return NextResponse.json(
      {
        error: "limit",
        message: `Has alcanzado el máximo de ${limit} limpiadoras de tu plan. Mejora tu plan para contactar más.`,
      },
      { status: 403 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      homeUserId: session.user.id,
      cleanerUserId,
      date,
      hours,
      notes,
      status: "PENDIENTE",
    },
  });

  // Primer mensaje del hogar (si escribió algo)
  if (notes) {
    await prisma.message.create({
      data: { bookingId: booking.id, senderId: session.user.id, body: notes },
    });
  }

  if (isNewContact) {
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: { contactsUsed: contactedIds.size + 1 },
    });
  }

  return NextResponse.json({ ok: true, bookingId: booking.id });
}
