import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  return NextResponse.json({ ok: true });
}
