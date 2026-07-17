import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  stripe,
  stripeConfigured,
  demoMode,
  priceIdForPlan,
} from "@/lib/stripe";
import type { PlanId } from "@/lib/constants";

// Gestionar la suscripción del hogar: cambiar de plan o cancelar.
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "HOGAR") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");
  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (!sub) {
    return NextResponse.json(
      { error: "No tienes suscripción." },
      { status: 404 }
    );
  }

  if (action === "cancel") {
    // En modo Stripe real, cancela también en Stripe
    if (stripe && sub.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      } catch (err) {
        console.error("stripe cancel error", err);
      }
    }
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: { status: "CANCELADA" },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "changePlan") {
    const plan: PlanId = body.plan === "COMPLETO" ? "COMPLETO" : "BASICO";
    if (plan === sub.plan) return NextResponse.json({ ok: true });

    // Cambiar de plan es un cobro distinto, así que el cambio tiene que ocurrir
    // en Stripe. Escribirlo solo en la BD dejaría pasar a COMPLETO sin pagar la
    // diferencia; el plan que mande es siempre el que se está cobrando.
    if (stripeConfigured && stripe) {
      if (!sub.stripeSubscriptionId) {
        return NextResponse.json(
          {
            error:
              "Tu suscripción no está vinculada a Stripe. Escríbenos y lo resolvemos.",
          },
          { status: 409 }
        );
      }
      const priceId = priceIdForPlan(plan);
      if (!priceId) {
        return NextResponse.json(
          { error: "Plan no configurado en Stripe." },
          { status: 500 }
        );
      }

      try {
        const current = await stripe.subscriptions.retrieve(
          sub.stripeSubscriptionId
        );
        const itemId = current.items.data[0]?.id;
        if (!itemId) throw new Error("Suscripción de Stripe sin líneas.");

        // create_prorations cobra/abona la diferencia del periodo en curso.
        const updated = await stripe.subscriptions.update(
          sub.stripeSubscriptionId,
          {
            items: [{ id: itemId, price: priceId }],
            proration_behavior: "create_prorations",
          }
        );

        await prisma.subscription.update({
          where: { userId: session.user.id },
          data: {
            plan,
            currentPeriodEnd: new Date(updated.current_period_end * 1000),
          },
        });
        return NextResponse.json({ ok: true });
      } catch (err) {
        console.error("stripe changePlan error", err);
        return NextResponse.json(
          { error: "No se pudo cambiar el plan. Inténtalo más tarde." },
          { status: 500 }
        );
      }
    }

    if (!demoMode) {
      console.error(
        "changePlan: Stripe no está configurado en producción; revisa STRIPE_SECRET_KEY y STRIPE_PRICE_*"
      );
      return NextResponse.json(
        {
          error:
            "El cambio de plan no está disponible ahora mismo. Inténtalo más tarde.",
        },
        { status: 503 }
      );
    }

    // Modo demo (solo fuera de producción): sin Stripe, reflejamos el cambio.
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: { plan },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
}
