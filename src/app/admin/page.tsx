import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PLANES, type PlanId, eur } from "@/lib/constants";
import { AdminHeader, StatCard, Badge, statusTone } from "@/components/admin/AdminUi";

export default async function AdminDashboard() {
  const [homes, cleaners, activeSubs, recentBookings, activeSubList] =
    await Promise.all([
      prisma.user.count({ where: { role: "HOGAR" } }),
      prisma.user.count({ where: { role: "LIMPIADORA" } }),
      prisma.subscription.count({ where: { status: "ACTIVA" } }),
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          homeUser: { select: { name: true } },
          cleanerUser: { select: { name: true } },
        },
      }),
      prisma.subscription.findMany({
        where: { status: "ACTIVA" },
        select: { plan: true },
      }),
    ]);

  // Ingresos recurrentes estimados (MRR) a partir de las suscripciones activas
  // y el precio de cada plan. No es un cobro real de Stripe: es lo que factura la
  // plataforma al mes por las cuotas activas.
  const mrr = activeSubList.reduce(
    (sum, s) => sum + (PLANES[s.plan as PlanId]?.precio ?? 0),
    0
  );

  return (
    <>
      <AdminHeader
        title="Resumen"
        subtitle="Vista general del estado de la plataforma."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Hogares" value={homes} />
        <StatCard label="Limpiadoras" value={cleaners} />
        <StatCard label="Suscripciones activas" value={activeSubs} />
        <StatCard
          label="Ingresos recurrentes / mes"
          value={eur(mrr)}
          hint="Estimado por cuotas activas (no es un cobro de Stripe)"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-petroleo">Reservas recientes</h2>
          <Link href="/admin/reservas" className="text-sm text-agua hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-100">
            {recentBookings.length === 0 && (
              <p className="p-5 text-sm text-slate-400">Aún no hay reservas.</p>
            )}
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
              >
                <div>
                  <span className="font-medium text-petroleo">
                    {b.homeUser.name}
                  </span>{" "}
                  <span className="text-slate-400">→</span>{" "}
                  <span className="font-medium text-petroleo">
                    {b.cleanerUser.name}
                  </span>
                  <p className="text-xs text-slate-400">
                    {b.date.toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {b.hours} h
                  </p>
                </div>
                <Badge tone={statusTone(b.status)}>{b.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
