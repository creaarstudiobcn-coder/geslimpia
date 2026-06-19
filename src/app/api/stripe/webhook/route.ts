import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Webhook de Stripe. Configura el endpoint en el dashboard de Stripe apuntando a
// /api/stripe/webhook y guarda el secreto en STRIPE_WEBHOOK_SECRET.
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
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.userId || s.client_reference_id;
        const plan = (s.metadata?.plan as "BASICO" | "COMPLETO") || "BASICO";
        if (userId) {
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan,
              status: "ACTIVA",
              stripeCustomerId: (s.customer as string) ?? undefined,
              stripeSubscriptionId: (s.subscription as string) ?? undefined,
              currentPeriodEnd: periodEnd,
            },
            create: {
              userId,
              plan,
              status: "ACTIVA",
              stripeCustomerId: (s.customer as string) ?? undefined,
              stripeSubscriptionId: (s.subscription as string) ?? undefined,
              currentPeriodEnd: periodEnd,
            },
          });
        }
        break;
      }
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
