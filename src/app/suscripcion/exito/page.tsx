import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { subscriptionIsActive } from "@/lib/suscripcion";
import { confirmarAltaDesdeCheckout } from "@/lib/suscripcionStripe";
import Logo from "@/components/Logo";
import AutoRefresh from "./AutoRefresh";

// Neutro a propósito: la página solo dice "activada" si de verdad lo está.
export const metadata = { title: "Tu suscripción · GesLimpia" };

export default async function ExitoPage({
  searchParams,
}: {
  searchParams: { session_id?: string; demo?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Solo los hogares se suscriben: a una limpiadora (o admin) que llegue aquí
  // por un enlace no hay nada que confirmarle.
  if (user.role !== "HOGAR") redirect("/dashboard");

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
      if (ownerId === user.id && s.status === "complete") {
        // Mismo camino que el webhook: estado REAL de la suscripción en
        // Stripe, idempotente y sin duplicar el recibo si llegan los dos.
        await confirmarAltaDesdeCheckout(s, user.id);
      }
    } catch (err) {
      console.error("confirm checkout error", err);
    }
  }

  // Lo que se enseña sale de la BD tal como ha quedado, no de que Stripe nos
  // haya devuelto aquí: volver de Checkout no garantiza que el cobro entrara.
  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  const activa = subscriptionIsActive(sub);

  return (
    <main className="grid min-h-screen place-items-center bg-espuma px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        {activa ? (
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
        ) : (
          <div className="card p-8">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-3xl">
              ⏳
            </div>
            <h1 className="mt-5 text-2xl font-bold text-petroleo">
              Estamos confirmando tu pago…
            </h1>
            <p className="mt-2 text-slate-600">
              Suele tardar unos segundos. Esta página se actualiza sola; si en un
              par de minutos no se ha activado, revisa «Mi plan» o escríbenos.
            </p>
            <AutoRefresh />
            <div className="mt-6 flex flex-col gap-2">
              <a href="" className="btn-primary w-full">
                Comprobar de nuevo
              </a>
              <Link href="/dashboard/plan" className="btn-ghost w-full">
                Ir a mi plan
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
