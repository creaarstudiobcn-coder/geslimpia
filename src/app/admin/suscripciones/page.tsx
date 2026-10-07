import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  AdminHeader,
  Badge,
  estadoSuscripcion,
  planLabel,
  statusLabel,
  statusTone,
} from "@/components/admin/AdminUi";
import { fechaCorta } from "@/lib/fechas";

export const metadata = { title: "Suscripciones · Admin · GesLimpia" };

export default async function AdminSuscripciones({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const estado = searchParams.estado ?? "";
  const subs = await prisma.subscription.findMany({
    where: estado ? { status: estado } : {},
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <AdminHeader
        title="Suscripciones"
        subtitle="Estado de las cuotas de acceso de los hogares. El cobro real se gestiona en Stripe."
      />

      <form className="mb-5 flex gap-3">
        <select name="estado" defaultValue={estado} className="input min-w-0 max-w-xs flex-1">
          <option value="">Todos los estados</option>
          <option value="ACTIVA">Activas</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="CANCELADA">Canceladas</option>
        </select>
        <button type="submit" className="btn-primary">Filtrar</button>
      </form>

      <div className="card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {subs.length === 0 && (
            <p className="p-5 text-sm text-slate-400">Sin suscripciones.</p>
          )}
          {subs.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
            >
              {/* flex-1 + min-w-0: sin ellos el bloque mide lo que su texto y
                  el email largo desbordaba la pantalla en móvil (375 px). */}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/hogares/${s.user.id}`}
                  className="block truncate font-medium text-petroleo hover:text-agua"
                >
                  {s.user.name}
                </Link>
                <p className="truncate text-xs text-slate-400">
                  {s.user.email} · Plan {planLabel(s.plan)}
                  {s.currentPeriodEnd && s.status !== "CANCELADA"
                    ? s.cancelAtPeriodEnd
                      ? ` · termina el ${fechaCorta(s.currentPeriodEnd)}`
                      : ` · renueva ${fechaCorta(s.currentPeriodEnd)}`
                    : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge tone={statusTone(estadoSuscripcion(s))}>
                  {statusLabel(estadoSuscripcion(s))}
                  {s.cancelAtPeriodEnd && s.status === "ACTIVA" ? " · baja programada" : ""}
                </Badge>
                {s.stripeCustomerId && (
                  <a
                    href={`https://dashboard.stripe.com/customers/${s.stripeCustomerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-agua hover:underline"
                  >
                    Stripe ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
