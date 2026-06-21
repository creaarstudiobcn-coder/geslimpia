import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader, Badge, statusTone } from "@/components/admin/AdminUi";

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
        <select name="estado" defaultValue={estado} className="input max-w-xs">
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
              <div className="min-w-0">
                <Link
                  href={`/admin/hogares/${s.user.id}`}
                  className="font-medium text-petroleo hover:text-agua"
                >
                  {s.user.name}
                </Link>
                <p className="truncate text-xs text-slate-400">
                  {s.user.email} · Plan {s.plan}
                  {s.currentPeriodEnd
                    ? ` · renueva ${s.currentPeriodEnd.toLocaleDateString("es-ES")}`
                    : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge tone={statusTone(s.status)}>{s.status}</Badge>
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
