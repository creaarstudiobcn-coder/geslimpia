import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader, Badge, statusTone } from "@/components/admin/AdminUi";

export default async function AdminHogares({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const estado = searchParams.estado ?? "";

  const homes = await prisma.user.findMany({
    where: {
      role: "HOGAR",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(estado === "activa" ? { active: true } : {}),
      ...(estado === "inactiva" ? { active: false } : {}),
    },
    include: { subscription: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminHeader title="Hogares" subtitle={`${homes.length} resultado(s).`} />

      <form className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Nombre o email…"
          className="input lg:col-span-2"
        />
        <select name="estado" defaultValue={estado} className="input">
          <option value="">Todos los estados</option>
          <option value="activa">Activos</option>
          <option value="inactiva">Desactivados</option>
        </select>
        <button type="submit" className="btn-primary">
          Filtrar
        </button>
      </form>

      <div className="card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {homes.length === 0 && (
            <p className="p-5 text-sm text-slate-400">Sin resultados.</p>
          )}
          {homes.map((h) => (
            <Link
              key={h.id}
              href={`/admin/hogares/${h.id}`}
              className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-espuma/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-petroleo">{h.name}</p>
                <p className="truncate text-xs text-slate-400">
                  {h.email} · {h.ciudad ?? "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {h.subscription ? (
                  <Badge tone={statusTone(h.subscription.status)}>
                    {h.subscription.plan} · {h.subscription.status}
                  </Badge>
                ) : (
                  <Badge tone="slate">Sin suscripción</Badge>
                )}
                {h.active ? (
                  <Badge tone="green">Activo</Badge>
                ) : (
                  <Badge tone="red">Desactivado</Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
