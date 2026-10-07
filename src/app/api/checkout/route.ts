import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/session";
import { stripe, stripeConfigured, demoMode, priceIdForPlan } from "@/lib/stripe";
import { appBaseUrl } from "@/lib/site";
import { subscriptionIsActive } from "@/lib/suscripcion";
import {
  leerSuscripcionStripe,
  sigueViva,
  urlPortalCliente,
} from "@/lib/suscripcionStripe";

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
  // Mismo criterio que el resto de la app (subscriptionIsActive): una fila
  // ACTIVA cuyo periodo ya venció no da acceso, así que tampoco bloquea pagar.
  const existing = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (subscriptionIsActive(existing)) {
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

      // Si ya tiene una suscripción en Stripe que sigue viva (pago fallido en
      // past_due, o un Checkout que quedó en incomplete), NO abrimos otro: cada
      // Checkout crea una suscripción nueva y acabaría pagando dos cuotas. Lo
      // que necesita es arreglar el cobro de la que ya tiene, y eso se hace en
      // el Customer Portal de Stripe (actualizar tarjeta / pagar la factura).
      if (existing?.stripeSubscriptionId) {
        const actual = await leerSuscripcionStripe(existing.stripeSubscriptionId);
        if (actual && sigueViva(actual.status)) {
          let portal: string | null = null;
          try {
            portal = await urlPortalCliente(
              existing,
              `${appUrl}/dashboard/plan`
            );
          } catch (err) {
            console.error("stripe billing portal error", err);
          }
          if (portal) return NextResponse.json({ url: portal });
          return NextResponse.json(
            {
              error:
                "Ya tienes una suscripción con un pago pendiente. Actualiza tu tarjeta desde «Mi plan» o escríbenos y lo resolvemos.",
            },
            { status: 409 }
          );
        }
      }

      const checkout = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        // Reutilizamos el cliente de Stripe si ya lo tiene: con customer_email
        // cada Checkout creaba un cliente nuevo y su historial quedaba partido.
        ...(existing?.stripeCustomerId
          ? { customer: existing.stripeCustomerId }
          : { customer_email: session.user.email ?? undefined }),
        client_reference_id: session.user.id,
        metadata: { userId: session.user.id, plan },
        success_url: `${appUrl}/suscripcion/exito?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/suscripcion?cancelado=1`,
      });

      // Guardamos intención de suscripción como PENDIENTE
      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        // cancelAtPeriodEnd a false: si esta fila viene de una baja anterior,
        // arrastrar la bandera marcaría la suscripción nueva como "se cancela".
        update: { plan, status: "PENDIENTE", cancelAtPeriodEnd: false },
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
      cancelAtPeriodEnd: false,
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
