import { prisma } from "@/lib/prisma";
import { PLANES, type PlanId } from "@/lib/constants";

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
  sub: SubscriptionLike
): Promise<ContactUsage> {
  const bookings = await prisma.booking.findMany({
    where: { homeUserId },
    select: { cleanerUserId: true, createdAt: true },
  });
  return computeContactUsage(bookings, sub);
}
