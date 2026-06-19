import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui";
import { eur } from "@/lib/constants";
import ChatThread from "./ChatThread";

export const metadata = { title: "Chat · GesLimpia" };

export default async function ChatPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      homeUser: { select: { id: true, name: true } },
      cleanerUser: {
        select: { id: true, name: true, cleanerProfile: true },
      },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!booking) notFound();
  if (booking.homeUserId !== user.id && booking.cleanerUserId !== user.id) {
    redirect("/dashboard");
  }

  const isHome = user.id === booking.homeUserId;
  const otherName = isHome ? booking.cleanerUser.name : booking.homeUser.name;
  const rate = booking.cleanerUser.cleanerProfile?.hourlyRate ?? 0;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/mensajes"
        className="mb-4 inline-block text-sm text-agua"
      >
        ← Volver a mensajes
      </Link>

      <div className="card flex flex-col" style={{ height: "70vh" }}>
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div>
            <p className="font-semibold text-petroleo">{otherName}</p>
            <p className="text-xs text-slate-500">
              📅{" "}
              {new Date(booking.date).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · {booking.hours} h
              {isHome && rate > 0 ? ` · ${eur(rate)}/h` : ""}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <ChatThread
          bookingId={booking.id}
          currentUserId={user.id}
          initialMessages={booking.messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Recuerda: el precio de la limpieza lo fija la limpiadora y se paga
        directamente a ella. GesLimpia solo facilita el contacto.
      </p>
    </div>
  );
}
