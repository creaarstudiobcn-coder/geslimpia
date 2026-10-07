import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe, planForPriceId } from "@/lib/stripe";
import { PLANES, type PlanId } from "@/lib/constants";
import { sendSubscriptionReceiptEmail } from "@/lib/email";

// Lo que comparten el webhook de Stripe, /suscripcion/exito, el checkout y el
// panel de admin para hablar con las suscripciones de Stripe. Vive aparte de
// lib/stripe.ts porque toca la BD y manda emails.

// Traduce el estado de Stripe a nuestro enum textual (ACTIVA | PENDIENTE | CANCELADA).
export function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVA";
    case "canceled":
    case "unpaid":
      return "CANCELADA";
    default:
      // incomplete, incomplete_expired, past_due, paused…
      return "PENDIENTE";
  }
}

// Convierte un epoch (segundos) de Stripe en Date, o null si no viene.
export function toDate(epochSeconds: number | null | undefined): Date | null {
  return epochSeconds ? new Date(epochSeconds * 1000) : null;
}

// Una suscripción en estos estados sigue existiendo en Stripe y le puede
// seguir cobrando: abrir otro Checkout encima crea una SEGUNDA suscripción y el
// cliente acaba pagando dos cuotas (pasaba tras un pago fallido, en past_due, o
// con un Checkout a medias, en incomplete).
const VIVAS: Stripe.Subscription.Status[] = [
  "active",
  "trialing",
  "past_due",
  "incomplete",
];

export function sigueViva(status: Stripe.Subscription.Status): boolean {
  return VIVAS.includes(status);
}

// Estados en los que ya no hay nada que cancelar.
const TERMINADAS: Stripe.Subscription.Status[] = ["canceled", "incomplete_expired"];

// Stripe responde resource_missing si el id no existe (p.ej. una suscripción de
// modo test en una BD que ya usa claves live). Para nosotros equivale a "no hay
// suscripción que cancelar".
export function esNoEncontrada(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "resource_missing"
  );
}

// Lee la suscripción de Stripe, o null si ya no existe.
export async function leerSuscripcionStripe(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) return null;
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (err) {
    if (esNoEncontrada(err)) return null;
    throw err;
  }
}

// Cancela EN EL ACTO una suscripción de Stripe si todavía no está terminada.
// Devuelve true si la ha cancelado. Los errores de Stripe (salvo "no existe") se
// propagan: quien llama decide, pero nunca debe dar por cancelada una
// suscripción que Stripe sigue cobrando.
export async function cancelarSiSigueViva(subscriptionId: string): Promise<boolean> {
  if (!stripe) return false;
  const actual = await leerSuscripcionStripe(subscriptionId);
  if (!actual || TERMINADAS.includes(actual.status)) return false;
  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (err) {
    if (esNoEncontrada(err)) return false;
    throw err;
  }
}

// URL del Customer Portal de Stripe para que el cliente actualice la tarjeta o
// pague la factura pendiente. Necesita el portal activado en el panel de Stripe
// (Settings → Billing → Customer portal). null si no hay cliente de Stripe.
export async function urlPortalCliente(
  sub: { stripeCustomerId: string | null; stripeSubscriptionId: string | null },
  returnUrl: string
): Promise<string | null> {
  if (!stripe) return null;
  let customerId = sub.stripeCustomerId;
  if (!customerId && sub.stripeSubscriptionId) {
    const actual = await leerSuscripcionStripe(sub.stripeSubscriptionId);
    customerId = actual
      ? typeof actual.customer === "string"
        ? actual.customer
        : actual.customer.id
      : null;
  }
  if (!customerId) return null;
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return portal.url;
}

function idDe(valor: string | { id: string } | null | undefined): string | null {
  if (!valor) return null;
  return typeof valor === "string" ? valor : valor.id;
}

// Refleja en la BD la suscripción de un Checkout completado. La llaman el
// webhook (checkout.session.completed) y /suscripcion/exito, a menudo a la vez y
// el webhook además puede llegar repetido, así que tiene que ser idempotente:
//
//  · El estado sale de la suscripción REAL de Stripe, no de que el Checkout se
//    haya completado: un Checkout puede terminar con el cobro aún en proceso
//    (incomplete) y eso no puede dar acceso.
//  · El recibo se envía solo a quien hace la transición: el UPDATE lleva en el
//    WHERE "aún no está así", y Postgres garantiza que solo una de dos
//    ejecuciones simultáneas lo cumple. Sin esto, cada reintento del webhook
//    mandaba otro recibo.
//  · Si el hogar tenía OTRA suscripción viva (dos Checkouts abiertos, o uno
//    nuevo tras un impago), se cancela antes: si no, Stripe le cobraría las dos.
//    Se cancela ANTES de guardar la nueva porque después ya no sabríamos su id;
//    si Stripe falla, el error sube y el webhook se reintenta.
export async function confirmarAltaDesdeCheckout(
  s: Stripe.Checkout.Session,
  userId: string
): Promise<{ activa: boolean; recienActivada: boolean }> {
  const subId = idDe(s.subscription);
  if (!stripe || !subId) return { activa: false, recienActivada: false };

  const stripeSub = await stripe.subscriptions.retrieve(subId);
  const status = mapStripeStatus(stripeSub.status);
  const plan: PlanId =
    planForPriceId(stripeSub.items.data[0]?.price?.id) ??
    (s.metadata?.plan === "COMPLETO" ? "COMPLETO" : "BASICO");

  const previa = await prisma.subscription.findUnique({ where: { userId } });
  if (previa?.stripeSubscriptionId && previa.stripeSubscriptionId !== subId) {
    const cancelada = await cancelarSiSigueViva(previa.stripeSubscriptionId);
    if (cancelada) {
      console.warn(
        `checkout: cancelada la suscripción anterior ${previa.stripeSubscriptionId} del usuario ${userId} (sustituida por ${subId})`
      );
    }
  }

  const datos = {
    plan,
    status,
    // Lo que diga Stripe de la suscripción NUEVA: una baja programada de la
    // anterior no puede heredarse, o volvería a caducar al final del primer mes.
    cancelAtPeriodEnd: stripeSub.cancel_at_period_end === true,
    stripeCustomerId: idDe(stripeSub.customer) ?? idDe(s.customer),
    stripeSubscriptionId: subId,
    currentPeriodStart: toDate(stripeSub.current_period_start) ?? new Date(),
    currentPeriodEnd: toDate(stripeSub.current_period_end),
  };

  let transicion = false;
  if (previa) {
    const { count } = await prisma.subscription.updateMany({
      where: {
        userId,
        // "Todavía no refleja esta suscripción con este estado". El null va
        // aparte porque en SQL `NULL <> 'sub_…'` no es verdadero.
        OR: [
          { stripeSubscriptionId: null },
          { stripeSubscriptionId: { not: subId } },
          { status: { not: status } },
        ],
      },
      data: datos,
    });
    transicion = count > 0;
  } else {
    try {
      await prisma.subscription.create({ data: { userId, ...datos } });
      transicion = true;
    } catch (err) {
      // Otra ejecución simultánea creó la fila primero: ella manda el recibo.
      if ((err as { code?: string }).code !== "P2002") throw err;
    }
  }

  const recienActivada = transicion && status === "ACTIVA";
  if (recienActivada) {
    // Recibo / confirmación por email (sendEmail no lanza: un fallo de correo
    // no puede tumbar la activación).
    const buyer = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (buyer?.email) {
      const planInfo = PLANES[plan] ?? PLANES.BASICO;
      await sendSubscriptionReceiptEmail({
        to: buyer.email,
        name: buyer.name ?? "",
        planName: planInfo.nombre,
        priceLabel: planInfo.precioLabel,
        contactos: planInfo.contactos,
      });
    }
  }

  return { activa: status === "ACTIVA", recienActivada };
}
