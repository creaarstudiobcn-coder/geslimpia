import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { parseList } from "@/lib/constants";
import OnboardingForm from "./OnboardingForm";
import Logo from "@/components/Logo";

export const metadata = { title: "Completa tu perfil · GesLimpia" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "LIMPIADORA") redirect("/dashboard");

  const p = user.cleanerProfile;

  return (
    <main className="min-h-screen bg-espuma px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-petroleo">
            Completa tu perfil de limpiadora
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cuéntales a los hogares cómo trabajas. <strong>Tú fijas tu tarifa</strong>{" "}
            por hora.
          </p>
          <div className="mt-6">
            <OnboardingForm
              initial={{
                bio: p?.bio ?? "",
                hourlyRate: p?.hourlyRate ?? 12,
                availability: p?.availability ?? "",
                photoUrl: p?.photoUrl ?? "",
                services: parseList(p?.services),
                zones: parseList(p?.zones),
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
