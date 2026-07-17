import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { POBLACIONES, LEGAL_VERSION } from "@/lib/constants";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Anti-spam: verificamos reCAPTCHA antes de cualquier trabajo en BD.
    const recaptcha = await verifyRecaptcha(body.recaptchaToken, "register");
    if (!recaptcha.ok) {
      return NextResponse.json(
        {
          error:
            "No hemos podido verificar que eres una persona. Recarga la página e inténtalo de nuevo.",
        },
        { status: 400 }
      );
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "")
      .toLowerCase()
      .trim();
    const password = String(body.password ?? "");
    const role = body.role === "LIMPIADORA" ? "LIMPIADORA" : "HOGAR";
    const ciudad = String(body.ciudad ?? "").trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }
    if (!POBLACIONES.includes(ciudad as (typeof POBLACIONES)[number])) {
      return NextResponse.json(
        { error: "Selecciona una población válida." },
        { status: 400 }
      );
    }
    // El consentimiento tiene que ser un acto afirmativo del usuario, así que se
    // valida aquí y no solo en el formulario: la casilla del cliente se puede
    // saltar llamando a la API directamente.
    if (body.consent !== true) {
      return NextResponse.json(
        {
          error:
            "Debes aceptar la Política de Privacidad y los Términos para crear la cuenta.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        ciudad,
        consentAt: new Date(),
        consentVersion: LEGAL_VERSION,
      },
    });

    // Crear perfil de limpiadora vacío para completar en el onboarding
    if (role === "LIMPIADORA") {
      await prisma.cleanerProfile.create({
        data: { userId: user.id },
      });
    }

    // Email de bienvenida (no bloquea el registro si falla / no está configurado)
    await sendWelcomeEmail({ to: email, name, role });

    return NextResponse.json({ ok: true, role }, { status: 201 });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json(
      { error: "Error al crear la cuenta." },
      { status: 500 }
    );
  }
}
