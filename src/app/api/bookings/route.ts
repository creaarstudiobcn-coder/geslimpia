import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewContactEmail } from "@/lib/email";
import { contactUsage, subscriptionIsActive } from "@/lib/suscripcion";

// Crear una reserva / contacto (solo HOGAR con suscripción activa)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
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

  // Cupo de contactos del periodo en curso. Contactar de nuevo a una limpiadora
  // que ya conocías no gasta cupo.
  const usage = await contactUsage(session.user.id, sub);
  const isNewContact = !usage.yaContactadas.has(cleanerUserId);

  if (isNewContact && usage.usados >= usage.limite) {
    const renovacion = sub.currentPeriodEnd
      ? ` Tu cupo se renueva el ${sub.currentPeriodEnd.toLocaleDateString(
          "es-ES",
          { day: "numeric", month: "long" }
        )}.`
      : "";
    return NextResponse.json(
      {
        error: "limit",
        message: `Has contactado ${usage.limite} limpiadoras nuevas este mes, el máximo de tu plan.${renovacion} Si necesitas más, puedes mejorar tu plan.`,
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
      data: { contactsUsed: usage.usados + 1 },
    });
  }

  // Aviso por email a la limpiadora (no bloquea la reserva si falla)
  await sendNewContactEmail({
    to: cleaner.email,
    cleanerName: cleaner.name,
    homeName: session.user.name ?? "Una familia",
    date,
    hours,
    notes,
  });

  return NextResponse.json({ ok: true, bookingId: booking.id });
}
