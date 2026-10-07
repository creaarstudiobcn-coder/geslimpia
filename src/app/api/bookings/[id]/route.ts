import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/session";
import { sendBookingAcceptedEmail } from "@/lib/email";

const VALID = ["ACEPTADA", "RECHAZADA", "COMPLETADA", "CANCELADA"];

// Transiciones permitidas. Antes no había ninguna: una reserva PENDIENTE (o
// RECHAZADA) podía saltar directa a COMPLETADA, y eso es lo que permitía a un
// hogar fabricarse una limpieza que nunca ocurrió para poder valorarla.
// CANCELADA: el hogar retira una solicitud que la limpiadora aún no ha
// contestado (se equivocó de día, ya encontró a otra…). El contacto ya hecho
// sigue contando para el cupo: cancelar no devuelve contactos.
const TRANSICIONES: Record<string, string[]> = {
  PENDIENTE: ["ACEPTADA", "RECHAZADA", "CANCELADA"],
  ACEPTADA: ["COMPLETADA"],
  RECHAZADA: [],
  COMPLETADA: [],
  CANCELADA: [],
};

// Actualizar estado de una reserva (la limpiadora acepta/rechaza/completa; el
// hogar cancela una pendiente o completa una ya pasada)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "");
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }

  const isCleaner = booking.cleanerUserId === session.user.id;
  const isHome = booking.homeUserId === session.user.id;
  if (!isCleaner && !isHome) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  if ((status === "ACEPTADA" || status === "RECHAZADA") && !isCleaner) {
    return NextResponse.json(
      { error: "Solo la limpiadora puede aceptar o rechazar." },
      { status: 403 }
    );
  }

  if (status === "CANCELADA" && !isHome) {
    return NextResponse.json(
      { error: "Solo el hogar puede cancelar su solicitud." },
      { status: 403 }
    );
  }

  if (!TRANSICIONES[booking.status]?.includes(status)) {
    return NextResponse.json(
      {
        error: `Una reserva ${booking.status.toLowerCase()} no puede pasar a ${status.toLowerCase()}.`,
      },
      { status: 409 }
    );
  }

  // Una limpieza no puede darse por hecha antes de su fecha. Junto con exigir
  // que la limpiadora la haya aceptado antes, esto impide que un hogar se
  // fabrique un servicio inexistente para poder valorarlo.
  // Cualquiera de las dos partes puede completarla: si solo pudiera la
  // limpiadora, le bastaría con no marcarla nunca para no recibir una mala
  // reseña.
  if (status === "COMPLETADA" && booking.date > new Date()) {
    return NextResponse.json(
      { error: "Esta limpieza aún no ha llegado a su fecha." },
      { status: 409 }
    );
  }

  // El WHERE incluye el estado que hemos validado: si entre la lectura y la
  // escritura la otra parte lo cambió (el hogar cancela mientras la limpiadora
  // acepta), la segunda no pisa a la primera con una transición que ya no vale.
  const { count } = await prisma.booking.updateMany({
    where: { id: params.id, status: booking.status },
    data: { status },
  });
  if (count === 0) {
    return NextResponse.json(
      {
        error:
          "La reserva ha cambiado mientras tanto. Recarga la página para ver su estado actual.",
      },
      { status: 409 }
    );
  }

  // Cuando la limpiadora acepta, avisamos al hogar por email (no bloquea la acción)
  if (status === "ACEPTADA" && isCleaner) {
    const [home, cleaner] = await Promise.all([
      prisma.user.findUnique({
        where: { id: booking.homeUserId },
        select: { email: true, name: true },
      }),
      prisma.user.findUnique({
        where: { id: booking.cleanerUserId },
        select: { name: true },
      }),
    ]);
    if (home?.email) {
      await sendBookingAcceptedEmail({
        to: home.email,
        homeName: home.name ?? "",
        cleanerName: cleaner?.name ?? "La limpiadora",
      });
    }
  }

  return NextResponse.json({ ok: true });
}
