import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POBLACIONES, LEGAL_VERSION } from "@/lib/constants";

// Asigna el rol (y ciudad) a un usuario que aún no lo tiene — típicamente alguien
// que acaba de entrar por primera vez con Google.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const role = body.role === "LIMPIADORA" ? "LIMPIADORA" : "HOGAR";
  const ciudad = String(body.ciudad ?? "").trim();

  if (!POBLACIONES.includes(ciudad as (typeof POBLACIONES)[number])) {
    return NextResponse.json(
      { error: "Selecciona una población válida." },
      { status: 400 }
    );
  }
  // Quien entra con Google nunca pasa por el formulario de registro, así que
  // este es el único punto donde se le puede pedir el consentimiento.
  if (body.consent !== true) {
    return NextResponse.json(
      {
        error:
          "Debes aceptar la Política de Privacidad y los Términos para continuar.",
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  // Solo se permite fijar el rol una vez (no re-asignar a quien ya lo tiene).
  if (user.role) {
    return NextResponse.json(
      { error: "El rol ya está asignado." },
      { status: 409 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role,
      ciudad,
      // Si ya constaba (p.ej. se re-entra al onboarding), no lo pisamos: vale la
      // fecha en que se aceptó por primera vez.
      consentAt: user.consentAt ?? new Date(),
      consentVersion: user.consentVersion ?? LEGAL_VERSION,
    },
  });

  // Igual que en el registro por email: la limpiadora arranca con un perfil vacío.
  if (role === "LIMPIADORA") {
    await prisma.cleanerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  return NextResponse.json({ ok: true, role }, { status: 200 });
}
