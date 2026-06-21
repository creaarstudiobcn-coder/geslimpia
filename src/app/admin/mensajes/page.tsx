import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader, Badge } from "@/components/admin/AdminUi";

export default async function AdminMensajes({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();

  // Hilos existentes: último mensaje por usuario + no leídos por el admin.
  const recent = await prisma.supportMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
  const threadsMap = new Map<
    string,
    { user: { id: string; name: string; email: string; role: string | null }; last: string; lastAt: Date; unread: number }
  >();
  for (const m of recent) {
    const t = threadsMap.get(m.userId);
    if (!t) {
      threadsMap.set(m.userId, {
        user: m.user,
        last: m.body,
        lastAt: m.createdAt,
        unread: !m.fromAdmin && !m.readByAdmin ? 1 : 0,
      });
    } else if (!m.fromAdmin && !m.readByAdmin) {
      t.unread += 1;
    }
  }
  const threads = Array.from(threadsMap.values());

  // Búsqueda para iniciar un chat con cualquier usuario (hogar o limpiadora).
  const searchResults = q
    ? await prisma.user.findMany({
        where: {
          role: { in: ["HOGAR", "LIMPIADORA"] },
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: { id: true, name: true, email: true, role: true },
      })
    : [];

  return (
    <>
      <AdminHeader
        title="Mensajes"
        subtitle="Chatea con cualquier hogar o limpiadora."
      />

      {/* Iniciar chat con cualquier usuario */}
      <form className="mb-6 flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar usuario por nombre o email para iniciar chat…"
          className="input"
        />
        <button type="submit" className="btn-primary">Buscar</button>
      </form>

      {q && (
        <div className="card mb-6 overflow-hidden">
          <p className="border-b border-slate-100 p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Resultados
          </p>
          {searchResults.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">Sin resultados.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {searchResults.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/mensajes/${u.id}`}
                  className="flex items-center justify-between gap-2 p-4 hover:bg-espuma/50"
                >
                  <div>
                    <p className="font-medium text-petroleo">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <Badge tone="slate">{u.role}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hilos existentes */}
      <h2 className="mb-3 text-lg font-bold text-petroleo">Conversaciones</h2>
      <div className="card overflow-hidden">
        {threads.length === 0 ? (
          <p className="p-5 text-sm text-slate-400">
            Aún no hay conversaciones. Busca un usuario arriba para empezar.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {threads.map((t) => (
              <Link
                key={t.user.id}
                href={`/admin/mensajes/${t.user.id}`}
                className="flex items-center justify-between gap-3 p-4 hover:bg-espuma/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-petroleo">
                    {t.user.name}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      {t.user.role}
                    </span>
                  </p>
                  <p className="truncate text-xs text-slate-400">{t.last}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-400">
                    {t.lastAt.toLocaleDateString("es-ES")}
                  </span>
                  {t.unread > 0 && <Badge tone="blue">{t.unread} nuevo(s)</Badge>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
