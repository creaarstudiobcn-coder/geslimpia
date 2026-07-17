import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Logo from "@/components/Logo";

export const metadata = { title: "Suscripción activada · GesLimpia" };

export default async function ExitoPage({
  searchParams,
}: {
  searchParams: { session_id?: string; demo?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Si volvemos de Stripe Checkout, confirmamos el pago (por si el webhook
  // todavía no llegó, p.ej. en desarrollo local sin webhook configurado).
  if (searchParams.session_id && stripe) {
    try {
      const s = await stripe.checkout.sessions.retrieve(
        searchParams.session_id
      );
      // El session_id viaja en la URL y cualquiera puede reutilizarlo, así que
      // solo confirmamos si el pago es de este mismo usuario.
      const ownerId = s.metadata?.userId ?? s.client_reference_id ?? null;
      const paid = s.payment_status === "paid" || s.status === "complete";

      if (paid && ownerId === user.id) {
        const plan =
          (s.metadata?.plan as "BASICO" | "COMPLETO") || "BASICO";

        // Periodo real de Stripe; el mes estimado solo como último recurso.
        let periodEnd: Date | null = null;
        if (s.subscription) {
          const stripeSub = await stripe.subscriptions.retrieve(
            s.subscription as string
          );
          periodEnd = new Date(stripeSub.current_period_end * 1000);
        }
        if (!periodEnd) {
          periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        await prisma.subscription.upsert({
          where: { userId: user.id },
          update: {
            plan,
            status: "ACTIVA",
            stripeCustomerId: (s.customer as string) ?? undefined,
            stripeSubscriptionId: (s.subscription as string) ?? undefined,
            currentPeriodEnd: periodEnd,
          },
          create: {
            userId: user.id,
            plan,
            status: "ACTIVA",
            stripeCustomerId: (s.customer as string) ?? undefined,
            stripeSubscriptionId: (s.subscription as string) ?? undefined,
            currentPeriodEnd: periodEnd,
          },
        });
      }
    } catch (err) {
      console.error("confirm checkout error", err);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-espuma px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-menta/20 text-3xl">
            ✅
          </div>
          <h1 className="mt-5 text-2xl font-bold text-petroleo">
            ¡Suscripción activada!
          </h1>
          <p className="mt-2 text-slate-600">
            Ya puedes buscar limpiadoras de tu zona y contactarlas. Recuerda: la
            tarifa de la limpieza la fija cada limpiadora y se acuerda
            directamente con ella.
          </p>
          <Link href="/dashboard" className="btn-primary mt-6 w-full">
            Ir a buscar limpiadoras
          </Link>
        </div>
      </div>
    </main>
  );
}
