import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stringifyList, SERVICIOS, POBLACIONES } from "@/lib/constants";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "LIMPIADORA") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const bio = String(body.bio ?? "").trim().slice(0, 500);
    const hourlyRate = Math.min(999, Math.max(0, Number(body.hourlyRate) || 0));
    const availability = String(body.availability ?? "").trim().slice(0, 200);
    // photoUrl lo gestiona exclusivamente /api/cleaner/photo — no se acepta aquí.
    const disponibleHoy =
      body.disponibleHoy === undefined ? true : Boolean(body.disponibleHoy);

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
        disponibleHoy,
        onboarded: true,
      },
      create: {
        userId: session.user.id,
        bio,
        hourlyRate,
        availability,
        services: stringifyList(services),
        zones: stringifyList(zones),
        disponibleHoy,
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
