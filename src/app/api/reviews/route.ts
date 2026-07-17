import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeCleanerRating } from "@/lib/reviews";
import { sendNewReviewEmail } from "@/lib/email";

// Leer las reseñas (visibles) de una limpiadora — para que los hogares las vean.
// Excluye las ocultadas por el admin.
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cleanerUserId = String(searchParams.get("cleanerUserId") ?? "");
  if (!cleanerUserId) {
    return NextResponse.json({ error: "Falta cleanerUserId." }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { cleanerUserId, hidden: false },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { homeUser: { select: { name: true } } },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      author: r.homeUser.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

// Crear una valoración a una limpiadora (solo HOGAR, requiere reserva completada)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "HOGAR") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const bookingId = String(body.bookingId ?? "");
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 0));
  const comment = String(body.comment ?? "").trim().slice(0, 1000);

  if (!bookingId || rating < 1) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  // Se valora una reserva concreta, no a una limpiadora en abstracto: es lo que
  // ata cada reseña a un servicio realmente prestado.
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, homeUserId: true, cleanerUserId: true, status: true },
  });
  if (!booking || booking.homeUserId !== session.user.id) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }
  if (booking.status !== "COMPLETADA") {
    return NextResponse.json(
      { error: "Solo puedes valorar tras una limpieza completada." },
      { status: 403 }
    );
  }

  const cleanerUserId = booking.cleanerUserId;

  try {
    await prisma.review.create({
      data: {
        bookingId: booking.id,
        cleanerUserId,
        homeUserId: session.user.id,
        rating,
        comment,
      },
    });
  } catch (err) {
    // El índice único de bookingId es la garantía real de "una reseña por
    // reserva": comprobar antes con un findFirst dejaría una ventana entre la
    // comprobación y la escritura.
    if (
      typeof err === "object" &&
      err !== null &&
      (err as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya has valorado esta reserva." },
        { status: 409 }
      );
    }
    throw err;
  }

  // Recalcular media (solo reseñas visibles)
  await recomputeCleanerRating(cleanerUserId);

  // Aviso por email a la limpiadora (no bloquea la creación de la reseña)
  const cleaner = await prisma.user.findUnique({
    where: { id: cleanerUserId },
    select: { email: true, name: true },
  });
  if (cleaner?.email) {
    await sendNewReviewEmail({
      to: cleaner.email,
      cleanerName: cleaner.name ?? "",
      rating,
      comment,
      homeName: session.user.name ?? undefined,
    });
  }

  return NextResponse.json({ ok: true });
}
