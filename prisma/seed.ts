import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function stringifyList(v: string[]) {
  return JSON.stringify(v);
}

const CLEANERS = [
  {
    name: "Marta García",
    ciudad: "Mataró",
    bio: "12 años de experiencia en limpieza del hogar y limpiezas a fondo. Detallista y puntual.",
    hourlyRate: 14,
    services: ["hogar", "fondo", "cristales"],
    zones: ["Mataró", "Argentona", "Cabrera de Mar"],
    availability: "Lunes a viernes, mañanas",
    rating: 4.9,
    count: 32,
    disponibleHoy: true,
  },
  {
    name: "Lucía Fernández",
    ciudad: "Premià de Mar",
    bio: "Especialista en planchado y casas con mascotas. Trato cercano y de confianza.",
    hourlyRate: 12.5,
    services: ["hogar", "planchado", "mascotas"],
    zones: ["Premià de Mar", "Vilassar de Mar", "El Masnou"],
    availability: "Tardes y sábados por la mañana",
    rating: 4.7,
    count: 18,
    disponibleHoy: true,
  },
  {
    name: "Carmen Ruiz",
    ciudad: "Argentona",
    bio: "Limpiezas a fondo y de mantenimiento. También oficinas pequeñas.",
    hourlyRate: 15,
    services: ["fondo", "oficinas", "cristales"],
    zones: ["Argentona", "Mataró"],
    availability: "Jornada completa entre semana",
    rating: 4.8,
    count: 25,
    disponibleHoy: false,
  },
  {
    name: "Rosa Martín",
    ciudad: "Vilassar de Mar",
    bio: "Rápida y eficiente. Me encargo de tu hogar como si fuera el mío.",
    hourlyRate: 13,
    services: ["hogar", "planchado"],
    zones: ["Vilassar de Mar", "Premià de Mar", "Cabrera de Mar"],
    availability: "Mañanas de lunes a sábado",
    rating: 4.6,
    count: 11,
    disponibleHoy: true,
  },
  {
    name: "Ana Torres",
    ciudad: "El Masnou",
    bio: "Experiencia en mudanzas y limpiezas de fin de obra. Equipo y productos propios.",
    hourlyRate: 16,
    services: ["fondo", "mudanzas", "cristales"],
    zones: ["El Masnou", "Premià de Mar"],
    availability: "Bajo cita",
    rating: 4.9,
    count: 14,
    disponibleHoy: true,
  },
  {
    name: "Nadia El Amrani",
    ciudad: "Mataró",
    bio: "Limpieza del hogar y planchado. Muy organizada, hablo español, catalán y árabe.",
    hourlyRate: 12,
    services: ["hogar", "planchado", "fondo"],
    zones: ["Mataró", "Argentona"],
    availability: "Lunes a viernes, todo el día",
    rating: 4.5,
    count: 9,
    disponibleHoy: true,
  },
  {
    name: "Patricia Gómez",
    ciudad: "Arenys de Mar",
    bio: "Casas, apartamentos turísticos y oficinas. Flexibilidad horaria.",
    hourlyRate: 13.5,
    services: ["hogar", "oficinas", "cristales"],
    zones: ["Arenys de Mar", "Caldes d'Estrac"],
    availability: "Fines de semana incluidos",
    rating: 4.7,
    count: 21,
    disponibleHoy: false,
  },
  {
    name: "Elena Soares",
    ciudad: "Cabrera de Mar",
    bio: "Trato familiar, especial cuidado con casas con mascotas y niños.",
    hourlyRate: 12.5,
    services: ["hogar", "mascotas", "planchado"],
    zones: ["Cabrera de Mar", "Vilassar de Mar", "Mataró"],
    availability: "Mañanas",
    rating: 4.8,
    count: 16,
    disponibleHoy: true,
  },
];

async function main() {
  console.log("🌱 Seeding GesLimpia…");

  // Limpiar datos previos (orden por dependencias)
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.cleanerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Limpiadoras
  for (const c of CLEANERS) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: `${c.name.toLowerCase().split(" ")[0]}@demo.geslimpia.es`,
        passwordHash,
        role: "LIMPIADORA",
        ciudad: c.ciudad,
      },
    });
    await prisma.cleanerProfile.create({
      data: {
        userId: user.id,
        bio: c.bio,
        hourlyRate: c.hourlyRate,
        services: stringifyList(c.services),
        zones: stringifyList(c.zones),
        availability: c.availability,
        disponibleHoy: c.disponibleHoy,
        ratingAvg: c.rating,
        ratingCount: c.count,
        onboarded: true,
      },
    });
  }

  // Hogar demo con suscripción activa
  const home = await prisma.user.create({
    data: {
      name: "Familia Demo",
      email: "hogar@demo.geslimpia.es",
      passwordHash,
      role: "HOGAR",
      ciudad: "Mataró",
    },
  });
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  await prisma.subscription.create({
    data: {
      userId: home.id,
      plan: "COMPLETO",
      status: "ACTIVA",
      contactsUsed: 0,
      currentPeriodEnd: periodEnd,
    },
  });

  console.log("✅ Seed completado.");
  console.log("   Hogar demo:      hogar@demo.geslimpia.es / password123");
  console.log("   Limpiadora demo: marta@demo.geslimpia.es / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
