import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseList } from "@/lib/constants";
import { AdminHeader, Badge } from "@/components/admin/AdminUi";

export default async function AdminLimpiadoras({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; verificada?: string; zona?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const estado = searchParams.estado ?? "";
  const verificada = searchParams.verificada ?? "";
  const zona = (searchParams.zona ?? "").trim();

  const cleaners = await prisma.user.findMany({
    where: {
      role: "LIMPIADORA",
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
      ...(verificada === "1" ? { cleanerProfile: { verified: true } } : {}),
      ...(verificada === "0" ? { cleanerProfile: { verified: false } } : {}),
    },
    include: { cleanerProfile: true },
    orderBy: { createdAt: "desc" },
  });

  // Filtro por zona (las zonas se guardan como JSON string en el perfil).
  const list = cleaners.filter((c) => {
    if (!zona) return true;
    const zones = parseList(c.cleanerProfile?.zones);
    return (
      zones.some((z) => z.toLowerCase().includes(zona.toLowerCase())) ||
      (c.ciudad ?? "").toLowerCase().includes(zona.toLowerCase())
    );
  });

  return (
    <>
      <AdminHeader
        title="Limpiadoras"
        subtitle={`${list.length} resultado(s).`}
      />

      {/* Filtros (GET) */}
      <form className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Nombre o email…"
          className="input lg:col-span-2"
        />
        <input
          name="zona"
          defaultValue={zona}
          placeholder="Zona / ciudad…"
          className="input"
        />
        <select name="estado" defaultValue={estado} className="input">
          <option value="">Todos los estados</option>
          <option value="activa">Activas</option>
          <option value="inactiva">Desactivadas</option>
        </select>
        <select name="verificada" defaultValue={verificada} className="input">
          <option value="">Verificada: todas</option>
          <option value="1">Verificadas</option>
          <option value="0">Sin verificar</option>
        </select>
        <button type="submit" className="btn-primary lg:col-span-1">
          Filtrar
        </button>
      </form>

      <div className="card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {list.length === 0 && (
            <p className="p-5 text-sm text-slate-400">Sin resultados.</p>
          )}
          {list.map((c) => (
            <Link
              key={c.id}
              href={`/admin/limpiadoras/${c.id}`}
              className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-espuma/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-petroleo">{c.name}</p>
                <p className="truncate text-xs text-slate-400">
                  {c.email} · {c.ciudad ?? "—"} ·{" "}
                  {c.cleanerProfile?.hourlyRate ?? "—"} €/h
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {c.cleanerProfile?.verified && <Badge tone="blue">✓ Verificada</Badge>}
                {c.active ? (
                  <Badge tone="green">Activa</Badge>
                ) : (
                  <Badge tone="red">Desactivada</Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
