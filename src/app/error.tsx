"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registramos el error para diagnóstico (no exponemos el detalle al usuario)
    console.error("app error boundary:", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-espuma px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <p className="text-5xl" aria-hidden>
            🛠️
          </p>
          <h1 className="mt-4 text-2xl font-bold text-petroleo">
            Algo no ha ido bien
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Ha ocurrido un error inesperado por nuestra parte. Puedes reintentar
            o volver al inicio; si el problema continúa, inténtalo de nuevo en
            unos minutos.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => reset()}
              className="inline-flex w-full items-center justify-center rounded-xl bg-agua px-5 py-3 font-semibold text-white transition hover:opacity-90 sm:w-auto"
            >
              Reintentar
            </button>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-semibold text-petroleo transition hover:bg-slate-50 sm:w-auto"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
