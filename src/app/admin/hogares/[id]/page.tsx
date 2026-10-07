import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  AdminHeader,
  Badge,
  estadoSuscripcion,
  planLabel,
  statusLabel,
  statusTone,
} from "@/components/admin/AdminUi";
import UserActions from "@/components/admin/UserActions";
import { fechaCorta } from "@/lib/fechas";

export const metadata = { title: "Ficha de hogar · Admin · GesLimpia" };

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
          Alta: {fechaCorta(user.createdAt)} · {user.ciudad ?? "—"}
        </span>
        {/* Prueba del consentimiento: el RGPD obliga a poder demostrarlo, así
            que tiene que ser consultable, no solo estar en la BD. */}
        {user.consentAt ? (
          <span className="text-xs text-slate-400">
            · Acepta los textos legales v{user.consentVersion} el{" "}
            {fechaCorta(user.consentAt)}
          </span>
        ) : (
          <span className="text-xs text-amber-600">
            · Sin consentimiento acreditado (alta anterior al registro de
            consentimiento)
          </span>
        )}
      </div>

      <div className="card mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-petroleo">Acciones</h2>
        <UserActions
          userId={user.id}
          isCleaner={false}
          active={user.active}
          hasStripeSubscription={
            !!sub?.stripeSubscriptionId && sub.status !== "CANCELADA"
          }
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
                <dd className="font-medium text-petroleo">{planLabel(sub.plan)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Estado</dt>
                <dd>
                  <Badge tone={statusTone(estadoSuscripcion(sub))}>
                    {statusLabel(estadoSuscripcion(sub))}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Contactos usados</dt>
                <dd className="font-medium text-petroleo">{sub.contactsUsed}</dd>
              </div>
              <div className="flex justify-between">
                {/* Con baja programada no hay renovación: es el último día. */}
                <dt className="text-slate-500">
                  {sub.cancelAtPeriodEnd ? "Fin (baja programada)" : "Renovación"}
                </dt>
                <dd className="font-medium text-petroleo">
                  {sub.currentPeriodEnd && sub.status !== "CANCELADA"
                    ? fechaCorta(sub.currentPeriodEnd)
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
                      {fechaCorta(b.date)}
                    </span>
                  </span>
                  <Badge tone={statusTone(b.status)}>{statusLabel(b.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
