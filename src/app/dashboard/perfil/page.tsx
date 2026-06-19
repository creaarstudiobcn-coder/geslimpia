import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { PageTitle } from "@/components/ui";
import { parseList } from "@/lib/constants";
import PerfilEditor from "./PerfilEditor";

export const metadata = { title: "Mi perfil · GesLimpia" };

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "LIMPIADORA") redirect("/dashboard");

  const p = user.cleanerProfile;

  return (
    <>
      <PageTitle
        title="Mi perfil y tarifa"
        subtitle="Tú fijas tu tarifa y tu disponibilidad. Mantén tu perfil al día para recibir más solicitudes."
      />
      <PerfilEditor
        initial={{
          bio: p?.bio ?? "",
          hourlyRate: p?.hourlyRate ?? 12,
          availability: p?.availability ?? "",
          photoUrl: p?.photoUrl ?? "",
          services: parseList(p?.services),
          zones: parseList(p?.zones),
          disponibleHoy: p?.disponibleHoy ?? true,
        }}
      />
    </>
  );
}
