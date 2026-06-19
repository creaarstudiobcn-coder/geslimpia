import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured, priceIdForPlan } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "HOGAR") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = body.plan === "COMPLETO" ? "COMPLETO" : "BASICO";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // --- MODO STRIPE (claves reales configuradas) ---
  if (stripeConfigured && stripe) {
    try {
      const priceId = priceIdForPlan(plan);
      if (!priceId) {
        return NextResponse.json(
          { error: "Plan no configurado en Stripe." },
          { status: 500 }
        );
      }

      const checkout = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: session.user.email ?? undefined,
        client_reference_id: session.user.id,
        metadata: { userId: session.user.id, plan },
        success_url: `${appUrl}/suscripcion/exito?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/suscripcion?cancelado=1`,
      });

      // Guardamos intención de suscripción como PENDIENTE
      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: { plan, status: "PENDIENTE" },
        create: { userId: session.user.id, plan, status: "PENDIENTE" },
      });

      return NextResponse.json({ url: checkout.url });
    } catch (err) {
      console.error("stripe checkout error", err);
      return NextResponse.json(
        { error: "No se pudo iniciar el pago." },
        { status: 500 }
      );
    }
  }

  // --- MODO DEMO (sin claves de Stripe): activamos directamente ---
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: { plan, status: "ACTIVA", currentPeriodEnd: periodEnd },
    create: {
      userId: session.user.id,
      plan,
      status: "ACTIVA",
      currentPeriodEnd: periodEnd,
    },
  });

  return NextResponse.json({ url: "/suscripcion/exito?demo=1" });
}
