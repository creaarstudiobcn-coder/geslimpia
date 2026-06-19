import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Crear una valoración a una limpiadora (solo HOGAR, requiere reserva completada)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "HOGAR") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const cleanerUserId = String(body.cleanerUserId ?? "");
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 0));
  const comment = String(body.comment ?? "").trim();

  if (!cleanerUserId || rating < 1) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  // Debe existir una reserva completada con esa limpiadora
  const done = await prisma.booking.findFirst({
    where: {
      homeUserId: session.user.id,
      cleanerUserId,
      status: "COMPLETADA",
    },
  });
  if (!done) {
    return NextResponse.json(
      { error: "Solo puedes valorar tras una limpieza completada." },
      { status: 403 }
    );
  }

  await prisma.review.create({
    data: { cleanerUserId, homeUserId: session.user.id, rating, comment },
  });

  // Recalcular media
  const agg = await prisma.review.aggregate({
    where: { cleanerUserId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.cleanerProfile.update({
    where: { userId: cleanerUserId },
    data: {
      ratingAvg: agg._avg.rating ?? 0,
      ratingCount: agg._count,
    },
  });

  return NextResponse.json({ ok: true });
}
