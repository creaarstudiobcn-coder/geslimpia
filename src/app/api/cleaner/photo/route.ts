import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put, del } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Subida de la foto de perfil de la limpiadora a Vercel Blob.
// El cliente ya redimensiona y convierte a webp antes de enviar (optimización),
// pero validamos de nuevo en el servidor (tipo y tamaño) por seguridad.

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "LIMPIADORA") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Almacenamiento de imágenes no configurado. Falta BLOB_READ_WRITE_TOKEN.",
      },
      { status: 503 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ninguna imagen." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato no válido. Usa JPG, PNG o WEBP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera el máximo de 5 MB." },
      { status: 400 }
    );
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  const pathname = `cleaners/${session.user.id}-${Date.now()}.${ext}`;

  const { url } = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  // Borrar la foto anterior si estaba en nuestro Blob (evita acumular archivos huérfanos).
  const previous = await prisma.cleanerProfile.findUnique({
    where: { userId: session.user.id },
    select: { photoUrl: true },
  });
  if (previous?.photoUrl?.includes(".public.blob.vercel-storage.com")) {
    await del(previous.photoUrl).catch(() => {});
  }

  await prisma.cleanerProfile.upsert({
    where: { userId: session.user.id },
    update: { photoUrl: url },
    create: { userId: session.user.id, photoUrl: url },
  });

  return NextResponse.json({ ok: true, url });
}

// Eliminar la foto de perfil (volver al avatar con inicial).
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "LIMPIADORA") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const profile = await prisma.cleanerProfile.findUnique({
    where: { userId: session.user.id },
    select: { photoUrl: true },
  });
  if (profile?.photoUrl?.includes(".public.blob.vercel-storage.com")) {
    await del(profile.photoUrl).catch(() => {});
  }
  await prisma.cleanerProfile.update({
    where: { userId: session.user.id },
    data: { photoUrl: "" },
  });

  return NextResponse.json({ ok: true });
}
