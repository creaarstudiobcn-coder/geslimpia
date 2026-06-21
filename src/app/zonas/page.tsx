import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Breadcrumbs, JsonLd } from "@/components/zonas/parts";
import { municipiosPorComarca, MUNICIPIOS } from "@/lib/zonas";
import { SITE_URL, absoluteUrl } from "@/lib/site";

const title = "Zonas: limpiadoras y trabajo de limpieza en la provincia de Barcelona | GesLimpia";
const description =
  "GesLimpia conecta hogares y limpiadoras independientes en la provincia de Barcelona: Barcelona, Badalona, L'Hospitalet, Terrassa, Sabadell, Mataró y muchos más municipios. Encuentra limpiadora o trabaja como limpiadora en tu zona.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/zonas") },
  openGraph: {
    title,
    description,
    type: "website",
    url: absoluteUrl("/zonas"),
    siteName: "GesLimpia",
  },
};

export default function ZonasPage() {
  const grupos = municipiosPorComarca();

  return (
    <>
      <SiteHeader />
      <main>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Zonas", item: absoluteUrl("/zonas") },
            ],
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Municipios cubiertos por GesLimpia",
            numberOfItems: MUNICIPIOS.length,
            itemListElement: MUNICIPIOS.map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: m.nombre,
              url: absoluteUrl(`/limpiadoras/${m.slug}`),
            })),
          }}
        />

        {/* HERO */}
        <section className="bg-espuma/60">
          <div className="container-page py-12">
            <Breadcrumbs
              items={[
                { name: "Inicio", href: "/" },
                { name: "Zonas", href: "/zonas" },
              ]}
            />
            <div className="mt-6 max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-petroleo sm:text-4xl">
                Limpiadoras y trabajo de limpieza en la provincia de Barcelona
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                GesLimpia es la plataforma que conecta hogares con limpiadoras
                independientes en {MUNICIPIOS.length} municipios de la provincia
                de Barcelona. Elige tu municipio para encontrar limpiadora o para
                empezar a trabajar como limpiadora en tu zona.
              </p>
            </div>
          </div>
        </section>

        {/* LISTADO POR COMARCA */}
        <section className="container-page py-14">
          <div className="space-y-12">
            {grupos.map((g) => (
              <div key={g.comarca}>
                <h2 className="text-xl font-bold text-petroleo">{g.comarca}</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {g.municipios.map((m) => (
                    <div key={m.slug} className="card p-5">
                      <h3 className="font-semibold text-petroleo">{m.nombre}</h3>
                      <div className="mt-3 flex flex-col gap-1.5 text-sm">
                        <Link
                          href={`/limpiadoras/${m.slug}`}
                          className="text-agua hover:underline"
                        >
                          🏠 Limpiadora en {m.nombre}
                        </Link>
                        <Link
                          href={`/trabajo-limpiadora/${m.slug}`}
                          className="text-menta hover:underline"
                        >
                          🧽 Trabajo de limpiadora en {m.nombre}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AVISO PLATAFORMA */}
        <section className="container-page pb-16">
          <div className="rounded-2xl border border-agua/20 bg-espuma p-6 text-center text-sm text-petroleo sm:p-8">
            <strong>
              GesLimpia es una plataforma de conexión, no una empresa de limpieza.
            </strong>{" "}
            La cuota mensual es por usar la plataforma. El precio de la limpieza lo
            fija cada limpiadora y se acuerda directamente con ella.
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
