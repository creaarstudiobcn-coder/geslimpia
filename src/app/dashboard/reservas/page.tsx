import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageTitle, EmptyState, StatusBadge } from "@/components/ui";
import Link from "next/link";
import ReviewButton from "./ReviewButton";

export const metadata = { title: "Mis reservas · GesLimpia" };

export default async function ReservasPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const isHome = user.role === "HOGAR";

  const bookings = await prisma.booking.findMany({
    where: isHome ? { homeUserId: user.id } : { cleanerUserId: user.id },
    orderBy: { date: "desc" },
    include: {
      homeUser: { select: { name: true, ciudad: true } },
      cleanerUser: { select: { name: true, ciudad: true } },
    },
  });

  // Reseñas ya escritas por el hogar (para no duplicar)
  const reviewed = isHome
    ? new Set(
        (
          await prisma.review.findMany({
            where: { homeUserId: user.id },
            select: { cleanerUserId: true },
          })
        ).map((r) => r.cleanerUserId)
      )
    : new Set<string>();

  return (
    <>
      <PageTitle
        title="Mis reservas"
        subtitle={
          isHome
            ? "Tus solicitudes a limpiadoras y su estado."
            : "Reservas con hogares de tu zona."
        }
      />

      {bookings.length === 0 ? (
        <EmptyState
          emoji="📅"
          title="No tienes reservas todavía"
          text={
            isHome
              ? "Busca una limpiadora y envía tu primera solicitud."
              : "Cuando aceptes solicitudes, aparecerán aquí."
          }
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const other = isHome ? b.cleanerUser : b.homeUser;
            return (
              <div key={b.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-petroleo">{other.name}</p>
                    <p className="text-sm text-slate-500">{other.ciudad}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>
                    📅{" "}
                    {new Date(b.date).toLocaleString("es-ES", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <span>⏱️ {b.hours} h</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/mensajes/${b.id}`}
                    className="btn-ghost text-sm"
                  >
                    💬 Abrir chat
                  </Link>
                  {isHome &&
                    b.status === "COMPLETADA" &&
                    !reviewed.has(b.cleanerUserId) && (
                      <ReviewButton
                        cleanerUserId={b.cleanerUserId}
                        cleanerName={b.cleanerUser.name}
                      />
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
