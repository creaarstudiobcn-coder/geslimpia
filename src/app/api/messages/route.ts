import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Obtener los mensajes de un hilo (para el polling del chat)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId") ?? "";
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (
    !booking ||
    (booking.homeUserId !== session.user.id &&
      booking.cleanerUserId !== session.user.id)
  ) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  const messages = await prisma.message.findMany({
    where: { bookingId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

// Enviar un mensaje dentro de un hilo de reserva
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const bookingId = String(body.bookingId ?? "");
  const text = String(body.body ?? "").trim();
  if (!bookingId || !text) {
    return NextResponse.json({ error: "Mensaje vacío." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (
    !booking ||
    (booking.homeUserId !== session.user.id &&
      booking.cleanerUserId !== session.user.id)
  ) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: { bookingId, senderId: session.user.id, body: text },
  });

  return NextResponse.json({ ok: true, message });
}
