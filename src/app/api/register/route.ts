import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { POBLACIONES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, ciudad },
    });

    // Crear perfil de limpiadora vacío para completar en el onboarding
    if (role === "LIMPIADORA") {
      await prisma.cleanerProfile.create({
        data: { userId: user.id },
      });
    }

    return NextResponse.json({ ok: true, role }, { status: 201 });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json(
      { error: "Error al crear la cuenta." },
      { status: 500 }
    );
  }
}
