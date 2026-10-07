import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/session";
import { stringifyList, SERVICIOS, POBLACIONES } from "@/lib/constants";

export async function POST(req: Request) {
  const session = await getActiveSession();
  if (!session?.user?.id || session.user.role !== "LIMPIADORA") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const bio = String(body.bio ?? "").trim().slice(0, 500);
    // La tarifa es lo primero que ve un hogar: 0 € (o vacía) se publicaba como
    // "0,00 €/h". Se exige un valor positivo en vez de guardarlo recortado.
    const hourlyRate = Number(body.hourlyRate);
    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0 || hourlyRate > 999) {
      return NextResponse.json(
        { error: "La tarifa por hora tiene que ser mayor que 0 € (y menor de 1000 €)." },
        { status: 400 }
      );
    }
    const availability = String(body.availability ?? "").trim().slice(0, 200);
    // photoUrl lo gestiona exclusivamente /api/cleaner/photo — no se acepta aquí.
    // Solo se toca si viene. El onboarding no lo manda: si cada vez que se
    // repetía lo ponía a true, la limpiadora que se había marcado "no
    // disponible" volvía a salir como "Disponible hoy" sin saberlo.
    const disponibleHoy =
      body.disponibleHoy === undefined ? undefined : Boolean(body.disponibleHoy);

    const validServices = SERVICIOS.map((s) => s.id);
    const services = (Array.isArray(body.services) ? body.services : []).filter(
      (s: string) => validServices.includes(s as never)
    );
    const zones = (Array.isArray(body.zones) ? body.zones : []).filter(
      (z: string) => POBLACIONES.includes(z as (typeof POBLACIONES)[number])
    );

    await prisma.cleanerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        bio,
        hourlyRate,
        availability,
        services: stringifyList(services),
        zones: stringifyList(zones),
        ...(disponibleHoy === undefined ? {} : { disponibleHoy }),
        onboarded: true,
      },
      create: {
        userId: session.user.id,
        bio,
        hourlyRate,
        availability,
        services: stringifyList(services),
        zones: stringifyList(zones),
        // Alta nueva sin valor: el default del esquema (disponible).
        ...(disponibleHoy === undefined ? {} : { disponibleHoy }),
        onboarded: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("cleaner profile error", err);
    return NextResponse.json(
      { error: "No se pudo guardar el perfil." },
      { status: 500 }
    );
  }
}
