import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PLANES, type PlanId } from "@/lib/constants";

// Cliente de Prisma o el de una transacción en curso: el cupo hay que poder
// leerlo dentro de la misma transacción que lo consume.
type Db = Prisma.TransactionClient | typeof prisma;

// Margen tras el vencimiento antes de cortar el acceso. Absorbe un webhook de
// renovación que llegue tarde: preferimos regalar unos días a bloquear a alguien
// que sí está pagando.
const DIAS_DE_GRACIA = 3;

// Lo que necesitamos de una suscripción para decidir. Es un tipo estructural
// para poder pasar tanto la fila de Prisma como la que cuelga de getCurrentUser.
export type SubscriptionLike = {
  plan: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
};

// Una suscripción da acceso si está ACTIVA y su periodo no ha vencido. El estado
// por sí solo no basta: si el webhook de cancelación se pierde, la fila se
// quedaría ACTIVA para siempre y el acceso no caducaría nunca.
export function subscriptionIsActive(
  sub: SubscriptionLike | null | undefined
): boolean {
  if (!sub || sub.status !== "ACTIVA") return false;
  if (!sub.currentPeriodEnd) return true;
  const limite = new Date(sub.currentPeriodEnd);
  limite.setDate(limite.getDate() + DIAS_DE_GRACIA);
  return limite > new Date();
}

// Inicio del periodo de facturación en curso. Las suscripciones anteriores a que
// guardáramos currentPeriodStart caen a su fecha de alta.
export function periodStart(sub: SubscriptionLike): Date {
  return sub.currentPeriodStart ?? sub.createdAt;
}

export type ContactUsage = {
  usados: number;
  limite: number;
  restantes: number;
  // Limpiadoras que este hogar ya contactó alguna vez (de cualquier periodo).
  yaContactadas: Set<string>;
};

// Cupo consumido en el periodo en curso: limpiadoras a las que el hogar escribió
// por PRIMERA vez dentro del periodo. Volver a reservar con alguien que ya
// conocías de un mes anterior no gasta cupo — ese contacto ya lo pagaste y el
// chat sigue abierto.
//
// Separado de la consulta para poder ejercitarlo sin base de datos.
export function computeContactUsage(
  bookings: { cleanerUserId: string; createdAt: Date }[],
  sub: SubscriptionLike
): ContactUsage {
  const desde = periodStart(sub);

  const primerContacto = new Map<string, Date>();
  for (const b of bookings) {
    const previo = primerContacto.get(b.cleanerUserId);
    if (!previo || b.createdAt < previo) {
      primerContacto.set(b.cleanerUserId, b.createdAt);
    }
  }

  const usados = Array.from(primerContacto.values()).filter(
    (fecha) => fecha >= desde
  ).length;
  const limite = PLANES[sub.plan as PlanId]?.contactos ?? 0;

  return {
    usados,
    limite,
    restantes: Math.max(0, limite - usados),
    yaContactadas: new Set(primerContacto.keys()),
  };
}

export async function contactUsage(
  homeUserId: string,
  sub: SubscriptionLike,
  db: Db = prisma
): Promise<ContactUsage> {
  const bookings = await db.booking.findMany({
    where: { homeUserId },
    select: { cleanerUserId: true, createdAt: true },
  });
  return computeContactUsage(bookings, sub);
}

// Reintentos cuando Postgres aborta la transacción por conflicto. Solo ocurre si
// el mismo hogar lanza varias reservas a la vez (doble clic, o varias pestañas),
// y el reintento casi siempre ve ya el trabajo de la transacción que ganó.
const REINTENTOS = 5;

// Espera creciente con algo de azar antes de reintentar. Sin esto, las
// transacciones que chocaron vuelven a chocar en el mismo instante y se agotan
// los reintentos entre ellas en vez de turnarse.
function esperaDeReintento(intento: number): Promise<void> {
  const ms = 15 * 2 ** (intento - 1) + Math.random() * 15;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Postgres devuelve 40001 al abortar una transacción serializable en conflicto;
// Prisma lo traduce a P2034.
function esConflictoDeTransaccion(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "P2034"
  );
}

export type NuevaReserva = {
  homeUserId: string;
  cleanerUserId: string;
  date: Date;
  hours: number;
  notes: string;
};

export type ResultadoReserva =
  | { agotado: true; limite: number }
  | { agotado: false; bookingId: string };

// Crea la reserva consumiendo cupo de forma atómica.
//
// Comprobar el cupo y consumirlo tiene que ser una sola operación: si se lee, se
// decide y se escribe por separado, N reservas simultáneas leen el mismo
// contador, todas pasan el límite y el hogar acaba contactando más limpiadoras
// de las que paga. Con Serializable, Postgres aborta las transacciones cuyo
// resultado no podría obtenerse ejecutándolas en serie, y reintentamos.
export async function crearReservaConCupo(
  datos: NuevaReserva,
  sub: SubscriptionLike
): Promise<ResultadoReserva> {
  const { homeUserId, cleanerUserId, date, hours, notes } = datos;

  for (let intento = 1; intento <= REINTENTOS; intento++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // Contactar de nuevo a una limpiadora que ya conocías no gasta cupo.
          const usage = await contactUsage(homeUserId, sub, tx);
          const isNewContact = !usage.yaContactadas.has(cleanerUserId);

          if (isNewContact && usage.usados >= usage.limite) {
            return { agotado: true as const, limite: usage.limite };
          }

          const booking = await tx.booking.create({
            data: {
              homeUserId,
              cleanerUserId,
              date,
              hours,
              notes,
              status: "PENDIENTE",
            },
          });

          // Primer mensaje del hogar (si escribió algo)
          if (notes) {
            await tx.message.create({
              data: { bookingId: booking.id, senderId: homeUserId, body: notes },
            });
          }

          if (isNewContact) {
            await tx.subscription.update({
              where: { userId: homeUserId },
              data: { contactsUsed: usage.usados + 1 },
            });
          }

          return { agotado: false as const, bookingId: booking.id };
        },
        { isolationLevel: "Serializable" }
      );
    } catch (err) {
      if (esConflictoDeTransaccion(err) && intento < REINTENTOS) {
        await esperaDeReintento(intento);
        continue;
      }
      throw err;
    }
  }

  // Inalcanzable: el bucle o devuelve o lanza.
  throw new Error("No se pudo crear la reserva tras varios intentos.");
}
