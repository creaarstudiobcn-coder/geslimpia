import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/session";
import { stripe, stripeConfigured, demoMode, priceIdForPlan } from "@/lib/stripe";
import { appBaseUrl } from "@/lib/site";

export async function POST(req: Request) {
  const session = await getActiveSession();
  if (!session?.user?.id || session.user.role !== "HOGAR") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = body.plan === "COMPLETO" ? "COMPLETO" : "BASICO";
  const appUrl = appBaseUrl();

  // Si ya tiene una suscripción activa y vigente, no arrancamos otro checkout:
  // el upsert a PENDIENTE de más abajo le quitaría el acceso que ya ha pagado
  // (botón atrás, doble clic o un enlace guardado bastan para provocarlo).
  // Para cambiar de plan está /dashboard/plan, que sí lo hace a través de Stripe.
  const existing = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  const vigente =
    !existing?.currentPeriodEnd || existing.currentPeriodEnd > new Date();
  if (existing?.status === "ACTIVA" && vigente) {
    return NextResponse.json({ url: "/dashboard/plan" });
  }

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
  // Nunca en producción: una env var de Stripe que falte o no propague no puede
  // convertirse en suscripciones gratis silenciosas.
  if (!demoMode) {
    console.error(
      "checkout: Stripe no está configurado en producción; revisa STRIPE_SECRET_KEY y STRIPE_PRICE_*"
    );
    return NextResponse.json(
      { error: "El pago no está disponible ahora mismo. Inténtalo más tarde." },
      { status: 503 }
    );
  }

  const periodStart = new Date();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: {
      plan,
      status: "ACTIVA",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      contactsUsed: 0,
    },
    create: {
      userId: session.user.id,
      plan,
      status: "ACTIVA",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
  });

  return NextResponse.json({ url: "/suscripcion/exito?demo=1" });
}
