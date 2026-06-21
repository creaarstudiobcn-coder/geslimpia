import { prisma } from "@/lib/prisma";
import { AdminHeader, Badge, statusTone } from "@/components/admin/AdminUi";

export default async function AdminReservas({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const estado = searchParams.estado ?? "";
  const bookings = await prisma.booking.findMany({
    where: estado ? { status: estado } : {},
    include: {
      homeUser: { select: { name: true } },
      cleanerUser: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <AdminHeader
        title="Reservas"
        subtitle={`${bookings.length} reserva(s) entre hogares y limpiadoras.`}
      />

      <form className="mb-5 flex gap-3">
        <select name="estado" defaultValue={estado} className="input max-w-xs">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="ACEPTADA">Aceptadas</option>
          <option value="RECHAZADA">Rechazadas</option>
          <option value="COMPLETADA">Completadas</option>
        </select>
        <button type="submit" className="btn-primary">Filtrar</button>
      </form>

      <div className="card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {bookings.length === 0 && (
            <p className="p-5 text-sm text-slate-400">Sin reservas.</p>
          )}
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
            >
              <div>
                <span className="font-medium text-petroleo">{b.homeUser.name}</span>{" "}
                <span className="text-slate-400">→</span>{" "}
                <span className="font-medium text-petroleo">{b.cleanerUser.name}</span>
                <p className="text-xs text-slate-400">
                  {b.date.toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {b.hours} h
                  {b.notes ? ` · ${b.notes.slice(0, 60)}` : ""}
                </p>
              </div>
              <Badge tone={statusTone(b.status)}>{b.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
