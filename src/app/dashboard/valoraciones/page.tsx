import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageTitle, EmptyState, RatingStars, Avatar } from "@/components/ui";

export const metadata = { title: "Valoraciones · GesLimpia" };

export default async function ValoracionesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "LIMPIADORA") redirect("/dashboard");

  const reviews = await prisma.review.findMany({
    where: { cleanerUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: { homeUser: { select: { name: true } } },
  });

  const avg = user.cleanerProfile?.ratingAvg ?? 0;
  const count = user.cleanerProfile?.ratingCount ?? 0;

  return (
    <>
      <PageTitle
        title="Valoraciones recibidas"
        subtitle="Lo que opinan los hogares de tu trabajo."
      />

      <div className="card mb-6 flex items-center gap-4 p-6">
        <div className="text-4xl font-bold text-petroleo">
          {avg > 0 ? avg.toFixed(1) : "—"}
        </div>
        <div>
          <RatingStars value={avg} count={count} />
          <p className="text-sm text-slate-500">
            {count} {count === 1 ? "valoración" : "valoraciones"}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          emoji="⭐"
          title="Todavía no tienes valoraciones"
          text="Cuando completes limpiezas, los hogares podrán valorarte."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center gap-3">
                <Avatar name={r.homeUser.name} size={40} />
                <div>
                  <p className="font-semibold text-petroleo">
                    {r.homeUser.name}
                  </p>
                  <RatingStars value={r.rating} />
                </div>
                <span className="ml-auto text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString("es-ES")}
                </span>
              </div>
              {r.comment && (
                <p className="mt-3 text-sm text-slate-600">“{r.comment}”</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
