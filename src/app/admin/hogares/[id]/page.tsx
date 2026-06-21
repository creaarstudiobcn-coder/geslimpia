import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader, Badge, statusTone } from "@/components/admin/AdminUi";
import UserActions from "@/components/admin/UserActions";

export default async function AdminHogarDetalle({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      subscription: true,
      bookingsAsHome: {
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { cleanerUser: { select: { name: true } } },
      },
    },
  });
  if (!user || user.role !== "HOGAR") notFound();
  const sub = user.subscription;

  return (
    <>
      <AdminHeader
        title={user.name}
        subtitle={user.email}
        back={{ href: "/admin/hogares", label: "Hogares" }}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {user.active ? <Badge tone="green">Activo</Badge> : <Badge tone="red">Desactivado</Badge>}
        <span className="text-xs text-slate-400">
          Alta: {user.createdAt.toLocaleDateString("es-ES")} · {user.ciudad ?? "—"}
        </span>
      </div>

      <div className="card mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-petroleo">Acciones</h2>
        <UserActions
          userId={user.id}
          isCleaner={false}
          active={user.active}
          deleteRedirect="/admin/hogares"
        />
        <Link
          href={`/admin/mensajes/${user.id}`}
          className="mt-4 inline-flex text-sm text-agua hover:underline"
        >
          💬 Abrir chat con {user.name}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-petroleo">Suscripción</h2>
          {sub ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Plan</dt>
                <dd className="font-medium text-petroleo">{sub.plan}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Estado</dt>
                <dd><Badge tone={statusTone(sub.status)}>{sub.status}</Badge></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Contactos usados</dt>
                <dd className="font-medium text-petroleo">{sub.contactsUsed}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Renovación</dt>
                <dd className="font-medium text-petroleo">
                  {sub.currentPeriodEnd
                    ? sub.currentPeriodEnd.toLocaleDateString("es-ES")
                    : "—"}
                </dd>
              </div>
              {sub.stripeCustomerId && (
                <a
                  href={`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex text-sm text-agua hover:underline"
                >
                  Ver cliente en Stripe ↗
                </a>
              )}
            </dl>
          ) : (
            <p className="text-sm text-slate-400">Este hogar no tiene suscripción.</p>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-petroleo">Reservas</h2>
          {user.bookingsAsHome.length === 0 ? (
            <p className="text-sm text-slate-400">Sin reservas.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {user.bookingsAsHome.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-2">
                  <span className="text-petroleo">
                    {b.cleanerUser.name}
                    <span className="ml-2 text-xs text-slate-400">
                      {b.date.toLocaleDateString("es-ES")}
                    </span>
                  </span>
                  <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
