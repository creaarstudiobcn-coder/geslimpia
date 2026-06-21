import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseList, servicioLabel } from "@/lib/constants";
import { AdminHeader, Badge } from "@/components/admin/AdminUi";
import UserActions from "@/components/admin/UserActions";

export default async function AdminLimpiadoraDetalle({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      cleanerProfile: true,
      reviewsReceived: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { homeUser: { select: { name: true } } },
      },
    },
  });
  if (!user || user.role !== "LIMPIADORA") notFound();
  const p = user.cleanerProfile;

  return (
    <>
      <AdminHeader
        title={user.name}
        subtitle={user.email}
        back={{ href: "/admin/limpiadoras", label: "Limpiadoras" }}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {p?.verified && <Badge tone="blue">✓ Verificada</Badge>}
        {user.active ? <Badge tone="green">Activa</Badge> : <Badge tone="red">Desactivada</Badge>}
        <span className="text-xs text-slate-400">
          Alta: {user.createdAt.toLocaleDateString("es-ES")}
        </span>
      </div>

      {/* Acciones */}
      <div className="card mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-petroleo">Acciones</h2>
        <UserActions
          userId={user.id}
          isCleaner
          active={user.active}
          verified={p?.verified ?? false}
          deleteRedirect="/admin/limpiadoras"
        />
        <Link
          href={`/admin/mensajes/${user.id}`}
          className="mt-4 inline-flex text-sm text-agua hover:underline"
        >
          💬 Abrir chat con {user.name}
        </Link>
      </div>

      {/* Perfil */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-petroleo">Perfil</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Ciudad" value={user.ciudad ?? "—"} />
            <Row label="Tarifa" value={`${p?.hourlyRate ?? "—"} €/h`} />
            <Row label="Disponibilidad" value={p?.availability || "—"} />
            <Row
              label="Valoración"
              value={`${p?.ratingAvg?.toFixed(1) ?? "0.0"} ★ (${p?.ratingCount ?? 0})`}
            />
            <Row label="Onboarding" value={p?.onboarded ? "Completado" : "Pendiente"} />
          </dl>
          {p?.bio && <p className="mt-3 text-sm text-slate-600">{p.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {parseList(p?.services).map((s) => (
              <span key={s} className="chip">{servicioLabel(s)}</span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {parseList(p?.zones).map((z) => (
              <span key={z} className="chip bg-slate-100">{z}</span>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-petroleo">
            Valoraciones recientes
          </h2>
          {user.reviewsReceived.length === 0 ? (
            <p className="text-sm text-slate-400">Sin valoraciones.</p>
          ) : (
            <ul className="space-y-3">
              {user.reviewsReceived.map((r) => (
                <li key={r.id} className="border-b border-slate-100 pb-3 last:border-0">
                  <p className="text-sm font-medium text-petroleo">
                    {"★".repeat(r.rating)}
                    <span className="text-slate-300">{"★".repeat(5 - r.rating)}</span>{" "}
                    <span className="text-xs text-slate-400">— {r.homeUser.name}</span>
                  </p>
                  {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-petroleo">{value}</dd>
    </div>
  );
}
