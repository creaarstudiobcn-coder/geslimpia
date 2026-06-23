import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Lado USUARIO del chat de soporte (hogar o limpiadora con el equipo de GesLimpia).

// GET /api/support — el usuario lee su propio hilo. Marca como leídos los del admin.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const userId = session.user.id;

  await prisma.supportMessage.updateMany({
    where: { userId, fromAdmin: true, readByUser: false },
    data: { readByUser: true },
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

// POST /api/support — el usuario responde en su hilo.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const text = String(body.body ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Mensaje vacío." }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json(
      { error: "El mensaje no puede superar los 2000 caracteres." },
      { status: 400 }
    );
  }

  const message = await prisma.supportMessage.create({
    data: {
      userId: session.user.id,
      fromAdmin: false,
      body: text,
      readByUser: true,
    },
  });
  return NextResponse.json({
    message: {
      id: message.id,
      fromAdmin: false,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    },
  });
}
