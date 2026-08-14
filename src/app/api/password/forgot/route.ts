import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { emailConfigured, sendPasswordResetEmail } from "@/lib/email";
import { crearTokenDeReset, TOKEN_TTL_MINUTOS } from "@/lib/passwordReset";

// Pedir un enlace para restablecer la contraseña.
//
// Responde SIEMPRE lo mismo exista o no la cuenta. Contestar distinto convertiría
// este formulario en un comprobador de qué direcciones están registradas en la
// plataforma, que es justo el dato que no queremos regalar.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const recaptcha = await verifyRecaptcha(body.recaptchaToken, "forgot");
  if (!recaptcha.ok) {
    return NextResponse.json(
      {
        error:
          "No hemos podido verificar que eres una persona. Recarga la página e inténtalo de nuevo.",
      },
      { status: 400 }
    );
  }

  const email = String(body.email ?? "")
    .toLowerCase()
    .trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Escribe un email válido." },
      { status: 400 }
    );
  }

  // Sin Resend configurado no hay forma de entregar el enlace. Decirlo no revela
  // nada de ninguna cuenta y evita que la persona se quede esperando un correo
  // que no va a llegar nunca.
  if (!emailConfigured()) {
    console.error(
      "forgot: RESEND_API_KEY no configurada; nadie puede recuperar su contraseña."
    );
    return NextResponse.json(
      {
        error:
          "Ahora mismo no podemos enviar el correo de recuperación. Escríbenos a info@dependalium.com y te ayudamos.",
      },
      { status: 503 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, active: true },
    });

    // Cuentas desactivadas por el admin: no se recupera el acceso por aquí.
    if (user?.active) {
      const token = await crearTokenDeReset(user.id);
      // null = ya se le envió uno hace menos de un minuto y sigue valiendo.
      if (token) {
        const enviado = await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          token,
          minutos: TOKEN_TTL_MINUTOS,
        });
        if (!enviado) {
          console.error(`forgot: no se pudo enviar el enlace a ${user.id}`);
        }
      }
    }
  } catch (err) {
    // Tampoco los errores pueden distinguirse desde fuera: se registran y la
    // respuesta sigue siendo la de siempre.
    console.error("forgot error", err);
  }

  return NextResponse.json({ ok: true });
}
