import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, planForPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { PLANES, type PlanId } from "@/lib/constants";
import { sendSubscriptionReceiptEmail } from "@/lib/email";

// Webhook de Stripe. Configura el endpoint en el dashboard de Stripe apuntando a
// https://TU-DOMINIO/api/stripe/webhook y guarda el secreto en STRIPE_WEBHOOK_SECRET.
//
// Eventos que hay que activar en Stripe (ver README → Despliegue):
//   · checkout.session.completed     -> primera activación de la suscripción
//   · invoice.payment_succeeded      -> renovación mensual (extiende el periodo)
//   · invoice.payment_failed         -> pago fallido (marca como PENDIENTE)
//   · customer.subscription.updated  -> cambios de estado (activa / impago / cancelación programada)
//   · customer.subscription.deleted  -> cancelación definitiva

// Traduce el estado de Stripe a nuestro enum textual (ACTIVA | PENDIENTE | CANCELADA).
function mapStripeStatus(status: Stripe.Subscription.Status): string {
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
function toDate(epochSeconds: number | null | undefined): Date | null {
  return epochSeconds ? new Date(epochSeconds * 1000) : null;
}

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
      // Primera activación tras completar el Checkout.
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.userId || s.client_reference_id || undefined;
        const plan = (s.metadata?.plan as "BASICO" | "COMPLETO") || "BASICO";
        if (!userId) break;

        // Intentamos leer el periodo real de la suscripción recién creada.
        let periodStart: Date | null = null;
        let periodEnd: Date | null = null;
        if (s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription as string);
          periodStart = toDate(sub.current_period_start);
          periodEnd = toDate(sub.current_period_end);
        }
        if (!periodEnd) {
          periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }
        periodStart = periodStart ?? new Date();

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan,
            status: "ACTIVA",
            stripeCustomerId: (s.customer as string) ?? undefined,
            stripeSubscriptionId: (s.subscription as string) ?? undefined,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          },
          create: {
            userId,
            plan,
            status: "ACTIVA",
            stripeCustomerId: (s.customer as string) ?? undefined,
            stripeSubscriptionId: (s.subscription as string) ?? undefined,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          },
        });

        // Recibo / confirmación por email (no bloquea el procesado del webhook)
        const buyer = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });
        if (buyer?.email) {
          const planInfo = PLANES[plan as PlanId] ?? PLANES.BASICO;
          await sendSubscriptionReceiptEmail({
            to: buyer.email,
            name: buyer.name ?? "",
            planName: planInfo.nombre,
            priceLabel: planInfo.precioLabel,
            contactos: planInfo.contactos,
          });
        }
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
            currentPeriodStart: toDate(sub.current_period_start) ?? undefined,
            currentPeriodEnd: toDate(sub.current_period_end) ?? undefined,
            ...(plan ? { plan } : {}),
          },
        });
        break;
      }

      // Cancelación definitiva.
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELADA" },
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
