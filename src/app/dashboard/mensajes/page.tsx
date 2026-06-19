import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageTitle, EmptyState, Avatar, StatusBadge } from "@/components/ui";

export const metadata = { title: "Mensajes · GesLimpia" };

export default async function MensajesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const isHome = user.role === "HOGAR";

  const bookings = await prisma.booking.findMany({
    where: isHome ? { homeUserId: user.id } : { cleanerUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      homeUser: { select: { name: true } },
      cleanerUser: { select: { name: true, cleanerProfile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <>
      <PageTitle title="Mensajes" subtitle="Tus conversaciones." />
      {bookings.length === 0 ? (
        <EmptyState
          emoji="💬"
          title="No tienes conversaciones"
          text={
            isHome
              ? "Contacta a una limpiadora para iniciar un chat."
              : "Cuando un hogar te contacte, podrás chatear aquí."
          }
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const otherName = isHome ? b.cleanerUser.name : b.homeUser.name;
            const photo = isHome ? b.cleanerUser.cleanerProfile?.photoUrl : null;
            const last = b.messages[0];
            return (
              <Link
                key={b.id}
                href={`/dashboard/mensajes/${b.id}`}
                className="card flex items-center gap-4 p-4 transition hover:shadow-soft"
              >
                <Avatar name={otherName} src={photo} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-petroleo">
                      {otherName}
                    </p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="truncate text-sm text-slate-500">
                    {last ? last.body : "Sin mensajes todavía"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
