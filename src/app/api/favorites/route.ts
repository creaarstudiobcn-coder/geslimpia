import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/session";

// Alternar favorita (solo HOGAR)
export async function POST(req: Request) {
  const session = await getActiveSession();
  if (!session?.user?.id || session.user.role !== "HOGAR") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const cleanerUserId = String(body.cleanerUserId ?? "");
  if (!cleanerUserId) {
    return NextResponse.json({ error: "Falta limpiadora." }, { status: 400 });
  }

  // Verificar que el target es realmente una limpiadora activa.
  const cleaner = await prisma.user.findFirst({
    where: { id: cleanerUserId, role: "LIMPIADORA", active: true },
  });
  if (!cleaner) {
    return NextResponse.json({ error: "Limpiadora no encontrada." }, { status: 404 });
  }

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        homeUserId_cleanerUserId: {
          homeUserId: session.user.id,
          cleanerUserId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ ok: true, favorited: false });
    }

    await prisma.favorite.create({
      data: { homeUserId: session.user.id, cleanerUserId },
    });
    return NextResponse.json({ ok: true, favorited: true });
  } catch (err) {
    console.error("favorites error", err);
    return NextResponse.json({ error: "Error al actualizar favoritas." }, { status: 500 });
  }
}
