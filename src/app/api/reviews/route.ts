import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeCleanerRating } from "@/lib/reviews";

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

  // Recalcular media (solo reseñas visibles)
  await recomputeCleanerRating(cleanerUserId);

  return NextResponse.json({ ok: true });
}
