import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import Logo from "@/components/Logo";
import RolePicker from "./RolePicker";

export const metadata = { title: "Elige tu rol · GesLimpia" };

export default async function ElegirRolPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Si ya tiene rol, no hay nada que elegir.
  if (user.role) redirect("/dashboard");

  return (
    <main className="grid min-h-screen place-items-center bg-espuma px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-petroleo">
            ¡Bienvenido/a, {user.name}!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Para terminar de configurar tu cuenta, dinos cómo vas a usar
            GesLimpia.
          </p>
          <div className="mt-6">
            <RolePicker defaultCiudad={user.ciudad ?? ""} />
          </div>
        </div>
      </div>
    </main>
  );
}
