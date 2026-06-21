import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/admin";

// GET /api/admin/support?userId=... — hilo de soporte con un usuario (para el polling).
// Marca como leídos por el admin los mensajes que envió el usuario.
export async function GET(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  const userId = new URL(req.url).searchParams.get("userId") ?? "";
  if (!userId) {
    return NextResponse.json({ error: "Falta userId." }, { status: 400 });
  }

  await prisma.supportMessage.updateMany({
    where: { userId, fromAdmin: false, readByAdmin: false },
    data: { readByAdmin: true },
  });

  const messages = await prisma.supportMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      fromAdmin: m.fromAdmin,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

// POST /api/admin/support — el admin envía un mensaje a un usuario.
// Body: { userId, body }
export async function POST(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId ?? "");
  const text = String(body.body ?? "").trim();
  if (!userId || !text) {
    return NextResponse.json({ error: "Mensaje vacío." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "ADMIN") {
    return NextResponse.json({ error: "Destinatario no válido." }, { status: 400 });
  }

  const message = await prisma.supportMessage.create({
    data: { userId, fromAdmin: true, body: text, readByAdmin: true },
  });
  return NextResponse.json({
    message: {
      id: message.id,
      fromAdmin: true,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    },
  });
}
