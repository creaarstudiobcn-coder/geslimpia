import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/session";
import {
  stripe,
  stripeConfigured,
  demoMode,
  priceIdForPlan,
} from "@/lib/stripe";
import type { PlanId } from "@/lib/constants";

// Gestionar la suscripción del hogar: cambiar de plan o cancelar.
export async function PATCH(req: Request) {
  const session = await getActiveSession();
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

  // Dar de baja y volver atrás son la misma operación con distinto valor, así
  // que comparten camino: quien puede programar la baja tiene que poder
  // deshacerla sin volver a pasar por caja.
  if (action === "cancel" || action === "resume") {
    const cancelar = action === "cancel";

    // Basta con tener el cliente de Stripe: dar de baja no usa los price IDs, y
    // exigir stripeConfigured (que sí los mira) dejaría a la gente sin poder
    // cancelar por una variable de precio mal puesta — atrapada pagando.
    if (stripe) {
      if (!sub.stripeSubscriptionId) {
        return NextResponse.json(
          {
            error:
              "Tu suscripción no está vinculada a Stripe. Escríbenos y lo resolvemos.",
          },
          { status: 409 }
        );
      }
      try {
        // Baja PROGRAMADA, no inmediata: el periodo en curso ya está pagado y
        // tiene que seguir dando acceso hasta su último día. Cancelar en el acto
        // (subscriptions.cancel) le quitaba al cliente el mes que había pagado.
        const updated = await stripe.subscriptions.update(
          sub.stripeSubscriptionId,
          { cancel_at_period_end: cancelar }
        );

        await prisma.subscription.update({
          where: { userId: session.user.id },
          data: {
            cancelAtPeriodEnd: cancelar,
            // Refrescamos la fecha con la que manda Stripe: es hasta cuándo
            // conserva el acceso, y es la que le enseñamos en el panel.
            ...(updated.current_period_end
              ? {
                  currentPeriodEnd: new Date(updated.current_period_end * 1000),
                }
              : {}),
          },
        });
        return NextResponse.json({ ok: true });
      } catch (err) {
        // Si Stripe no acepta el cambio, NO lo damos por bueno en nuestra BD.
        // Marcarlo igualmente dejaba al cliente sin acceso mientras Stripe le
        // seguía cobrando todos los meses: cobro sin servicio.
        console.error(`stripe ${action} error`, err);
        return NextResponse.json(
          {
            error: cancelar
              ? "No hemos podido cancelar tu suscripción. No se ha cambiado nada: inténtalo de nuevo o escríbenos y lo hacemos nosotros."
              : "No hemos podido reactivar tu suscripción. Inténtalo de nuevo en unos minutos.",
          },
          { status: 502 }
        );
      }
    }

    if (!demoMode) {
      console.error(
        "cancel/resume: falta STRIPE_SECRET_KEY en producción; nadie puede darse de baja desde el panel."
      );
      return NextResponse.json(
        {
          error:
            "La gestión de tu plan no está disponible ahora mismo. Inténtalo más tarde.",
        },
        { status: 503 }
      );
    }

    // Modo demo (solo fuera de producción). Sin periodo de facturación no hay
    // nada pagado que respetar, así que la baja surte efecto ya.
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        cancelAtPeriodEnd: cancelar,
        ...(cancelar && !sub.currentPeriodEnd ? { status: "CANCELADA" } : {}),
        ...(!cancelar && sub.status === "CANCELADA" ? { status: "ACTIVA" } : {}),
      },
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
