import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = { title: "Página no encontrada · GesLimpia" };

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-espuma px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <p className="text-5xl" aria-hidden>
            🧽
          </p>
          <h1 className="mt-4 text-2xl font-bold text-petroleo">
            Esta página no existe
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Puede que el enlace esté roto o que la página se haya movido. No te
            preocupes, te ayudamos a volver al sitio.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-agua px-5 py-3 font-semibold text-white transition hover:opacity-90 sm:w-auto"
            >
              Volver al inicio
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-semibold text-petroleo transition hover:bg-slate-50 sm:w-auto"
            >
              Ir a mi panel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
