import Logo from "@/components/Logo";

export const metadata = { title: "Sin conexión · GesLimpia" };

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-espuma px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <p className="text-5xl">📡</p>
          <h1 className="mt-4 text-2xl font-bold text-petroleo">Sin conexión</h1>
          <p className="mt-2 text-sm text-slate-500">
            Parece que no tienes internet ahora mismo. Comprueba tu conexión y
            vuelve a intentarlo.
          </p>
        </div>
      </div>
    </main>
  );
}
