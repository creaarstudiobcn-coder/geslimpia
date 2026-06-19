import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseList, PLANES, type PlanId } from "@/lib/constants";
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
    return (
      <>
        <PageTitle
          title="Solicitudes entrantes"
          subtitle="Hogares que te han contactado. Acepta o rechaza los turnos."
        />
        <CleanerRequests
          bookings={bookings.map((b) => ({
            id: b.id,
            homeName: b.homeUser.name,
            homeCity: b.homeUser.ciudad,
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
  const activa = sub?.status === "ACTIVA";

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
      ...(soloDisponibles ? { disponibleHoy: true } : {}),
    },
    include: { user: { select: { name: true, ciudad: true } } },
    orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
  });

  // Favoritas y contactos previos
  const [favorites, contacted] = await Promise.all([
    prisma.favorite.findMany({
      where: { homeUserId: user.id },
      select: { cleanerUserId: true },
    }),
    prisma.booking.findMany({
      where: { homeUserId: user.id },
      select: { cleanerUserId: true },
      distinct: ["cleanerUserId"],
    }),
  ]);
  const favSet = new Set(favorites.map((f) => f.cleanerUserId));
  const contactedSet = new Set(contacted.map((c) => c.cleanerUserId));

  const list = cleaners
    .map((c) => ({
      userId: c.userId,
      name: c.user.name,
      ciudad: c.user.ciudad,
      bio: c.bio,
      hourlyRate: c.hourlyRate,
      services: parseList(c.services),
      zones: parseList(c.zones),
      availability: c.availability,
      photoUrl: c.photoUrl,
      disponibleHoy: c.disponibleHoy,
      ratingAvg: c.ratingAvg,
      ratingCount: c.ratingCount,
      isFavorite: favSet.has(c.userId),
      alreadyContacted: contactedSet.has(c.userId),
    }))
    .filter((c) => (zona ? c.zones.includes(zona) || c.ciudad === zona : true))
    .filter((c) => (servicio ? c.services.includes(servicio) : true));

  const plan = PLANES[(sub!.plan as PlanId)];
  const contactCount = contactedSet.size;

  return (
    <>
      <PageTitle
        title="Buscar limpiadoras"
        subtitle={`Plan ${plan.nombre}: has contactado ${contactCount} de ${plan.contactos} limpiadoras.`}
      />
      <CleanerSearch
        cleaners={list}
        filters={{ zona: zona ?? "", servicio: servicio ?? "", disponible: soloDisponibles }}
        contactInfo={{
          used: contactCount,
          limit: plan.contactos,
          planName: plan.nombre,
        }}
      />
    </>
  );
}
