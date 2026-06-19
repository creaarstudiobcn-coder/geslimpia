import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-petroleo">{title}</h1>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            ⚠️ Texto orientativo. El texto legal definitivo debe redactarlo un
            profesional. GesLimpia es una <strong>plataforma de conexión</strong>
            : no emplea a las limpiadoras ni presta el servicio de limpieza.
          </div>
          <article className="prose-legal mt-8 space-y-5 text-slate-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-petroleo [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
            {children}
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
