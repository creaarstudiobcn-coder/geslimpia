import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { PageTitle } from "@/components/ui";
import { PLANES, type PlanId } from "@/lib/constants";
import PlanManager from "./PlanManager";

export const metadata = { title: "Mi plan · GesLimpia" };

export default async function PlanPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "HOGAR") redirect("/dashboard");

  const sub = user.subscription;

  return (
    <>
      <PageTitle
        title="Mi plan"
        subtitle="Gestiona tu suscripción de acceso a la plataforma."
      />

      {!sub || sub.status !== "ACTIVA" ? (
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
          contactsUsed={sub.contactsUsed}
          limit={PLANES[sub.plan as PlanId].contactos}
          periodEnd={sub.currentPeriodEnd?.toISOString() ?? null}
        />
      )}
    </>
  );
}
