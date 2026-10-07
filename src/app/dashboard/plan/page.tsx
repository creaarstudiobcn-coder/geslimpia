import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { PageTitle } from "@/components/ui";
import { type PlanId } from "@/lib/constants";
import { contactUsage, subscriptionIsActive } from "@/lib/suscripcion";
import { stripe } from "@/lib/stripe";
import PlanManager from "./PlanManager";
import PortalButton from "./PortalButton";

export const metadata = { title: "Mi plan · GesLimpia" };

export default async function PlanPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "HOGAR") redirect("/dashboard");

  const sub = user.subscription;
  const activa = subscriptionIsActive(sub);
  const usage = sub && activa ? await contactUsage(user.id, sub) : null;
  // Pago fallido: la suscripción existe en Stripe pero el cobro no ha entrado
  // (el webhook la pone PENDIENTE). No es lo mismo que no tener plan: lo que
  // hace falta es arreglar la tarjeta, no volver a pasar por caja (eso crearía
  // una segunda suscripción). Un Checkout abandonado también deja la fila
  // PENDIENTE, pero sin suscripción de Stripe: ese caso sí es "sin plan".
  const pagoPendiente =
    !activa && sub?.status === "PENDIENTE" && !!sub.stripeSubscriptionId;

  return (
    <>
      <PageTitle
        title="Mi plan"
        subtitle="Gestiona tu suscripción de acceso a la plataforma."
      />

      {pagoPendiente ? (
        <div className="card max-w-xl p-8 text-center">
          <span className="text-4xl">⚠️</span>
          <h2 className="mt-3 text-xl font-bold text-petroleo">
            Tu último pago no se ha podido cobrar
          </h2>
          <p className="mt-2 text-slate-600">
            Tu suscripción sigue abierta, pero está en espera hasta que se pague
            la cuota. Actualiza tu tarjeta y la reactivamos automáticamente; no
            hace falta que vuelvas a suscribirte.
          </p>
          <div className="mt-5 flex justify-center">
            {stripe ? (
              <PortalButton />
            ) : (
              <a href="/suscripcion" className="btn-primary">
                Ver planes
              </a>
            )}
          </div>
        </div>
      ) : !sub || !usage ? (
        <div className="card max-w-xl p-8 text-center">
          <span className="text-4xl">💳</span>
          <h2 className="mt-3 text-xl font-bold text-petroleo">
            No tienes un plan activo
          </h2>
          <p className="mt-2 text-slate-600">
            Suscríbete para buscar y contactar limpiadoras.
          </p>
          <a href="/suscripcion" className="btn-primary mt-5">
            Ver planes
          </a>
        </div>
      ) : (
        <PlanManager
          plan={sub.plan as PlanId}
          contactsUsed={usage.usados}
          limit={usage.limite}
          periodEnd={sub.currentPeriodEnd?.toISOString() ?? null}
          cancelAtPeriodEnd={sub.cancelAtPeriodEnd}
        />
      )}
    </>
  );
}
