import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Alternar favorita (solo HOGAR)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "HOGAR") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const cleanerUserId = String(body.cleanerUserId ?? "");
  if (!cleanerUserId) {
    return NextResponse.json({ error: "Falta limpiadora." }, { status: 400 });
  }

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
}
