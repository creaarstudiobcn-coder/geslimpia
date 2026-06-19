import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { stripeConfigured } from "@/lib/stripe";
import Logo from "@/components/Logo";
import SubscriptionChooser from "./SubscriptionChooser";

export const metadata = { title: "Elige tu plan · GesLimpia" };

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: { plan?: string; cancelado?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "HOGAR") redirect("/dashboard");
  if (user.subscription?.status === "ACTIVA") redirect("/dashboard");

  const preselect =
    searchParams.plan === "COMPLETO" ? "COMPLETO" : "BASICO";

  return (
    <main className="min-h-screen bg-espuma px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-petroleo">
            Elige tu plan de acceso
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            La cuota mensual es por usar la plataforma y contactar limpiadoras.{" "}
            <strong>No incluye</strong> el precio de la limpieza, que fija y cobra
            cada limpiadora.
          </p>
        </div>

        {searchParams.cancelado && (
          <p className="mx-auto mt-6 max-w-md rounded-lg bg-amber-50 px-4 py-2 text-center text-sm text-amber-700">
            Has cancelado el pago. Puedes intentarlo de nuevo cuando quieras.
          </p>
        )}

        {!stripeConfigured && (
          <p className="mx-auto mt-6 max-w-lg rounded-lg bg-blue-50 px-4 py-2 text-center text-xs text-blue-700">
            ℹ️ Modo demo: Stripe no está configurado, así que la suscripción se
            activará de forma simulada (sin cobro real). Añade tus claves en{" "}
            <code>.env</code> para el checkout real.
          </p>
        )}

        <div className="mt-8">
          <SubscriptionChooser preselect={preselect} />
        </div>
      </div>
    </main>
  );
}
