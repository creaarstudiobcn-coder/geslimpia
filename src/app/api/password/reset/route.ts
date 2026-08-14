import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PASSWORD_MIN } from "@/lib/constants";
import { invalidarTokensDe, usarTokenDeReset } from "@/lib/passwordReset";

// Fijar la contraseña nueva a partir del token del email.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "");
  const password = String(body.password ?? "");

  if (password.length < PASSWORD_MIN) {
    return NextResponse.json(
      {
        error: `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`,
      },
      { status: 400 }
    );
  }

  // Se consume antes de tocar nada: si el enlace no vale, no llegamos a la BD.
  const resultado = await usarTokenDeReset(token);
  if (!resultado.ok) {
    const mensajes = {
      invalido:
        "Este enlace no es válido. Pide uno nuevo desde «He olvidado mi contraseña».",
      usado:
        "Este enlace ya se ha usado. Si necesitas cambiarla otra vez, pide uno nuevo.",
      caducado:
        "Este enlace ha caducado. Pide uno nuevo y tendrás una hora para usarlo.",
    } as const;
    return NextResponse.json(
      { error: mensajes[resultado.motivo] },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: resultado.userId },
      select: { active: true },
    });
    if (!user?.active) {
      return NextResponse.json(
        { error: "Esta cuenta está desactivada. Contacta con soporte." },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: resultado.userId },
      data: {
        passwordHash,
        // Marca que invalida las sesiones abiertas antes de este momento (ver
        // lib/session.ts). Cambiar la contraseña tiene que echar a quien hubiera
        // entrado con la anterior; si no, restablecerla no sirve de nada cuando
        // alguien ya está dentro.
        passwordChangedAt: new Date(),
      },
    });

    // Cualquier otro enlace pendiente de esta cuenta deja de valer.
    await invalidarTokensDe(resultado.userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset error", err);
    return NextResponse.json(
      { error: "No se pudo cambiar la contraseña. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
