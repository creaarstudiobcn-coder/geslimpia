import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// La limpiadora actualiza su tarifa y disponibilidad
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "LIMPIADORA") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (body.hourlyRate !== undefined)
    data.hourlyRate = Math.max(0, Number(body.hourlyRate) || 0);
  if (body.availability !== undefined)
    data.availability = String(body.availability).trim();
  if (body.disponibleHoy !== undefined)
    data.disponibleHoy = Boolean(body.disponibleHoy);

  await prisma.cleanerProfile.update({
    where: { userId: session.user.id },
    data,
  });

  return NextResponse.json({ ok: true });
}
