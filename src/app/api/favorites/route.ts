import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/session";

// Marcar / desmarcar favorita (solo HOGAR).
// Body: { cleanerUserId, favorite?: boolean }. Con `favorite` se fija el valor
// pedido (true = guardar, false = quitar): un doble clic en "Quitar" ya no la
// vuelve a añadir. Sin él, alterna como antes.
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
  const pedido: boolean | null =
    typeof body.favorite === "boolean" ? body.favorite : null;

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        homeUserId_cleanerUserId: {
          homeUserId: session.user.id,
          cleanerUserId,
        },
      },
    });
    const quiere = pedido ?? !existing;

    if (!quiere) {
      // Quitar siempre se puede, aunque la limpiadora ya no esté activa.
      if (existing) await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ ok: true, favorited: false });
    }
    if (existing) return NextResponse.json({ ok: true, favorited: true });

    // Para guardar, el target tiene que ser realmente una limpiadora activa.
    const cleaner = await prisma.user.findFirst({
      where: { id: cleanerUserId, role: "LIMPIADORA", active: true },
    });
    if (!cleaner) {
      return NextResponse.json({ error: "Limpiadora no encontrada." }, { status: 404 });
    }

    await prisma.favorite.create({
      data: { homeUserId: session.user.id, cleanerUserId },
    });
    return NextResponse.json({ ok: true, favorited: true });
  } catch (err) {
    // P2002: dos clics simultáneos intentaron crear la misma favorita; la
    // otra petición ya la guardó, que es justo lo que se pedía.
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ ok: true, favorited: true });
    }
    console.error("favorites error", err);
    return NextResponse.json({ error: "Error al actualizar favoritas." }, { status: 500 });
  }
}
