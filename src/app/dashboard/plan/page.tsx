import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { PageTitle } from "@/components/ui";
import { type PlanId } from "@/lib/constants";
import { contactUsage, subscriptionIsActive } from "@/lib/suscripcion";
import PlanManager from "./PlanManager";

export const metadata = { title: "Mi plan · GesLimpia" };

export default async function PlanPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "HOGAR") redirect("/dashboard");

  const sub = user.subscription;
  const activa = subscriptionIsActive(sub);
  const usage = sub && activa ? await contactUsage(user.id, sub) : null;

  return (
    <>
      <PageTitle
        title="Mi plan"
        subtitle="Gestiona tu suscripción de acceso a la plataforma."
      />

      {!sub || !usage ? (
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
        />
      )}
    </>
  );
}
