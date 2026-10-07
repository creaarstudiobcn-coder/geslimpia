import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, planForPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import {
  confirmarAltaDesdeCheckout,
  mapStripeStatus,
  toDate,
} from "@/lib/suscripcionStripe";

// Webhook de Stripe. Configura el endpoint en el dashboard de Stripe apuntando a
// https://TU-DOMINIO/api/stripe/webhook y guarda el secreto en STRIPE_WEBHOOK_SECRET.
//
// Eventos que hay que activar en Stripe (ver README → Despliegue):
//   · checkout.session.completed     -> primera activación de la suscripción
//   · invoice.payment_succeeded      -> renovación mensual (extiende el periodo)
//   · invoice.payment_failed         -> pago fallido (marca como PENDIENTE)
//   · customer.subscription.updated  -> cambios de estado (activa / impago / cancelación programada)
//   · customer.subscription.deleted  -> cancelación definitiva
//
// Stripe reintenta los eventos y puede entregarlos repetidos o desordenados, así
// que cada caso tiene que poder ejecutarse dos veces sin efectos de más: todos
// filtran por el id de la suscripción de Stripe y el alta no reenvía el recibo
// si la fila ya estaba activa con esa misma suscripción.

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe no configurado." }, { status: 400 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    if (!secret || !sig) throw new Error("Falta firma o secreto.");
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("webhook signature error", err);
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Primera activación tras completar el Checkout. Toda la lógica (estado
      // real en Stripe, cancelar una suscripción anterior que siga viva,
      // idempotencia y recibo) está en confirmarAltaDesdeCheckout, que comparte
      // con /suscripcion/exito.
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.mode !== "subscription") break;
        const userId = s.metadata?.userId || s.client_reference_id || undefined;
        if (!userId) break;
        await confirmarAltaDesdeCheckout(s, userId);
        break;
      }

      // Renovación mensual correcta: extiende el periodo y reactiva.
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string | null;
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        // Mover currentPeriodStart es lo que reinicia el cupo de contactos del
        // mes: el cliente que renueva vuelve a tener su plan entero.
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: {
            status: "ACTIVA",
            currentPeriodStart: toDate(sub.current_period_start) ?? undefined,
            currentPeriodEnd: toDate(sub.current_period_end) ?? undefined,
            contactsUsed: 0,
          },
        });
        break;
      }

      // Pago fallido: dejamos la suscripción en espera (no da acceso pleno).
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string | null;
        if (!subId) break;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: "PENDIENTE" },
        });
        break;
      }

      // Cambios de estado (activa, past_due, cancelación programada, etc.) y de
      // plan: el precio que se está cobrando en Stripe manda sobre el nuestro.
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const plan = planForPriceId(sub.items.data[0]?.price?.id);
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: mapStripeStatus(sub.status),
            // Con una baja programada, Stripe mantiene la suscripción en
            // "active" hasta el último día pagado: el estado NO cambia y lo que
            // hay que reflejar es esta bandera. También llega por aquí la baja
            // cancelada desde el propio Stripe, de ahí que se copie el valor tal
            // cual en vez de solo ponerla a true.
            cancelAtPeriodEnd: sub.cancel_at_period_end === true,
            currentPeriodStart: toDate(sub.current_period_start) ?? undefined,
            currentPeriodEnd: toDate(sub.current_period_end) ?? undefined,
            ...(plan ? { plan } : {}),
          },
        });
        break;
      }

      // Cancelación consumada: llega cuando vence el periodo de una baja
      // programada (o si se cancela en el acto desde el panel de Stripe). Es
      // este evento, y no el botón de cancelar, el que corta el acceso.
      // Solo afecta a la fila que tiene ESTA suscripción: cuando un alta nueva
      // sustituye a una vieja (que cancelamos), el aviso de la vieja llega
      // después y no puede quitarle el acceso a la nueva.
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          // La baja ya no está "programada", está hecha: dejar la bandera a true
          // haría que el panel siguiera ofreciendo un "reactivar" imposible.
          data: { status: "CANCELADA", cancelAtPeriodEnd: false },
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("webhook handler error", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
