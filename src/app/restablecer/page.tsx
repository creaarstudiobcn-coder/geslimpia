import Link from "next/link";
import Logo from "@/components/Logo";
import { tokenSigueValido } from "@/lib/passwordReset";
import ResetForm from "./ResetForm";

// Página de un enlace personal: no tiene nada que hacer en Google.
export const metadata = {
  title: "Elegir contraseña · GesLimpia",
  robots: { index: false, follow: false },
};

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  // Se comprueba ANTES de pintar (sin consumirlo): enseñar dos campos de
  // contraseña bajo un enlace caducado solo sirve para que alguien los rellene
  // y se lleve el error después.
  const valido = await tokenSigueValido(token);

  return (
    <main className="grid min-h-screen place-items-center bg-espuma px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          {valido ? (
            <ResetForm token={token} />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-petroleo">
                Este enlace ya no vale
              </h1>
              <p className="mt-3 text-slate-600">
                Los enlaces para cambiar la contraseña caducan en una hora y solo
                se pueden usar una vez. Pide uno nuevo y te llega al momento.
              </p>
              <Link href="/recuperar" className="btn-primary mt-6 inline-block">
                Pedir un enlace nuevo
              </Link>
              <p className="mt-6 text-center text-sm text-slate-600">
                ¿Te has acordado de la contraseña?{" "}
                <Link href="/login" className="font-semibold text-agua">
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
