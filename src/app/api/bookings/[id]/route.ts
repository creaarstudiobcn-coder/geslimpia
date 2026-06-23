import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendBookingAcceptedEmail } from "@/lib/email";

const VALID = ["ACEPTADA", "RECHAZADA", "COMPLETADA"];

// Actualizar estado de una reserva (la limpiadora acepta/rechaza/completa)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "");
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }

  // La limpiadora puede aceptar/rechazar/completar; el hogar puede completar
  const isCleaner = booking.cleanerUserId === session.user.id;
  const isHome = booking.homeUserId === session.user.id;
  if (!isCleaner && !isHome) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  if ((status === "ACEPTADA" || status === "RECHAZADA") && !isCleaner) {
    return NextResponse.json(
      { error: "Solo la limpiadora puede aceptar o rechazar." },
      { status: 403 }
    );
  }

  await prisma.booking.update({
    where: { id: params.id },
    data: { status },
  });

  // Cuando la limpiadora acepta, avisamos al hogar por email (no bloquea la acción)
  if (status === "ACEPTADA" && isCleaner) {
    const [home, cleaner] = await Promise.all([
      prisma.user.findUnique({
        where: { id: booking.homeUserId },
        select: { email: true, name: true },
      }),
      prisma.user.findUnique({
        where: { id: booking.cleanerUserId },
        select: { name: true },
      }),
    ]);
    if (home?.email) {
      await sendBookingAcceptedEmail({
        to: home.email,
        homeName: home.name ?? "",
        cleanerName: cleaner?.name ?? "La limpiadora",
      });
    }
  }

  return NextResponse.json({ ok: true });
}
