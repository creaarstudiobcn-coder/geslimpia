import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseList, PLANES, type PlanId } from "@/lib/constants";
import { contactUsage, subscriptionIsActive } from "@/lib/suscripcion";
import { PageTitle } from "@/components/ui";
import CleanerSearch from "./CleanerSearch";
import CleanerRequests from "./CleanerRequests";

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: { zona?: string; servicio?: string; disponible?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  // ---------- LIMPIADORA ----------
  if (user.role === "LIMPIADORA") {
    const bookings = await prisma.booking.findMany({
      where: { cleanerUserId: user.id },
      orderBy: { createdAt: "desc" },
      include: { homeUser: { select: { name: true, ciudad: true } } },
    });
    const perfilCompleto = user.cleanerProfile?.onboarded ?? false;
    return (
      <>
        <PageTitle
          title="Solicitudes entrantes"
          subtitle="Hogares que te han contactado. Acepta o rechaza los turnos."
        />
        {!perfilCompleto && (
          <div className="card mb-6 flex flex-col gap-3 border-agua/40 bg-agua/5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-petroleo">Completa tu perfil</h2>
              <p className="mt-1 text-sm text-slate-600">
                Hasta que no lo completes no apareces en las búsquedas de los
                hogares. Tú fijas tu tarifa por hora.
              </p>
            </div>
            <Link href="/onboarding" className="btn-primary shrink-0">
              Completar perfil
            </Link>
          </div>
        )}
        <CleanerRequests
          bookings={bookings.map((b) => ({
            id: b.id,
            homeName: b.homeUser.name,
            homeCity: b.homeUser.ciudad ?? "",
            date: b.date.toISOString(),
            hours: b.hours,
            status: b.status,
            notes: b.notes,
          }))}
        />
      </>
    );
  }

  // ---------- HOGAR ----------
  const sub = user.subscription;
  const activa = subscriptionIsActive(sub);

  if (!activa) {
    return (
      <>
        <PageTitle title="Buscar limpiadoras" />
        <div className="card mx-auto max-w-xl p-8 text-center">
          <span className="text-4xl">🔒</span>
          <h2 className="mt-4 text-xl font-bold text-petroleo">
            Suscríbete para buscar limpiadoras
          </h2>
          <p className="mt-2 text-slate-600">
            Necesitas un plan de acceso activo para ver el listado y contactar
            limpiadoras de tu zona. La cuota es por usar la plataforma; el precio
            de la limpieza lo fija cada limpiadora.
          </p>
          <Link href="/suscripcion" className="btn-primary mt-6">
            Ver planes
          </Link>
        </div>
      </>
    );
  }

  const zona = searchParams.zona;
  const servicio = searchParams.servicio;
  const soloDisponibles = searchParams.disponible === "1";

  const cleaners = await prisma.cleanerProfile.findMany({
    where: {
      onboarded: true,
      // No mostrar limpiadoras cuya cuenta ha sido desactivada por el admin.
      user: { active: true },
      ...(soloDisponibles ? { disponibleHoy: true } : {}),
    },
    include: { user: { select: { name: true, ciudad: true } } },
    // Las verificadas primero, después por valoración.
    orderBy: [{ verified: "desc" }, { ratingAvg: "desc" }, { ratingCount: "desc" }],
  });

  // Favoritas y cupo de contactos del periodo en curso
  const [favorites, usage] = await Promise.all([
    prisma.favorite.findMany({
      where: { homeUserId: user.id },
      select: { cleanerUserId: true },
    }),
    contactUsage(user.id, sub!),
  ]);
  const favSet = new Set(favorites.map((f) => f.cleanerUserId));
  const contactedSet = usage.yaContactadas;

  const list = cleaners
    .map((c) => ({
      userId: c.userId,
      name: c.user.name,
      ciudad: c.user.ciudad ?? "",
      bio: c.bio,
      hourlyRate: c.hourlyRate,
      services: parseList(c.services),
      zones: parseList(c.zones),
      availability: c.availability,
      photoUrl: c.photoUrl,
      disponibleHoy: c.disponibleHoy,
      verified: c.verified,
      ratingAvg: c.ratingAvg,
      ratingCount: c.ratingCount,
      isFavorite: favSet.has(c.userId),
      alreadyContacted: contactedSet.has(c.userId),
    }))
    .filter((c) => (zona ? c.zones.includes(zona) || c.ciudad === zona : true))
    .filter((c) => (servicio ? c.services.includes(servicio) : true));

  const plan = PLANES[(sub!.plan as PlanId)];

  return (
    <>
      <PageTitle
        title="Buscar limpiadoras"
        subtitle={`Plan ${plan.nombre}: te quedan ${usage.restantes} de ${usage.limite} limpiadoras nuevas este mes.`}
      />
      <CleanerSearch
        cleaners={list}
        filters={{ zona: zona ?? "", servicio: servicio ?? "", disponible: soloDisponibles }}
        contactInfo={{
          used: usage.usados,
          limit: usage.limite,
          planName: plan.nombre,
        }}
      />
    </>
  );
}
