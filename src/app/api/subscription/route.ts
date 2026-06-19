import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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
    const plan = body.plan === "COMPLETO" ? "COMPLETO" : "BASICO";
    // En modo demo actualizamos directamente. En Stripe real lo ideal es el
    // portal de cliente; aquí dejamos el cambio reflejado en la plataforma.
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: { plan },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
}
