import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageTitle, EmptyState, Avatar, RatingStars } from "@/components/ui";
import {
  parseList,
  servicioEmoji,
  servicioLabel,
  eur,
} from "@/lib/constants";

export const metadata = { title: "Favoritas · GesLimpia" };

export default async function FavoritasPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "HOGAR") redirect("/dashboard");

  const favorites = await prisma.favorite.findMany({
    where: { homeUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      cleanerUser: {
        select: { name: true, ciudad: true, cleanerProfile: true },
      },
    },
  });

  return (
    <>
      <PageTitle
        title="Limpiadoras favoritas"
        subtitle="Tus limpiadoras guardadas para contactar rápido."
      />
      {favorites.length === 0 ? (
        <EmptyState
          emoji="⭐"
          title="No tienes favoritas"
          text="Pulsa la estrella en cualquier limpiadora para guardarla aquí."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((f) => {
            const p = f.cleanerUser.cleanerProfile;
            const services = parseList(p?.services);
            return (
              <div key={f.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={f.cleanerUser.name} src={p?.photoUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-petroleo">
                      {f.cleanerUser.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {f.cleanerUser.ciudad}
                    </p>
                    <RatingStars
                      value={p?.ratingAvg ?? 0}
                      count={p?.ratingCount ?? 0}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {services.slice(0, 3).map((s) => (
                    <span key={s} className="chip">
                      {servicioEmoji(s)} {servicioLabel(s)}
                    </span>
                  ))}
                </div>
                <p className="mt-4 border-t border-slate-100 pt-3 text-sm">
                  <span className="text-slate-500">Tarifa aprox. </span>
                  <span className="font-bold text-petroleo">
                    {eur(p?.hourlyRate ?? 0)}/h
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
