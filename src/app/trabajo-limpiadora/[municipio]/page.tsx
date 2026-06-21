import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  Breadcrumbs,
  FaqSection,
  BarriosList,
  JsonLd,
} from "@/components/zonas/parts";
import {
  allSlugs,
  getMunicipio,
  introLimpiadora,
  faqsLimpiadora,
} from "@/lib/zonas";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return allSlugs().map((municipio) => ({ municipio }));
}

export function generateMetadata({
  params,
}: {
  params: { municipio: string };
}): Metadata {
  const m = getMunicipio(params.municipio);
  if (!m) return {};
  const title = `Trabajo de limpiadora en ${m.nombre} | GesLimpia`;
  const description = `¿Buscas trabajo de limpiadora en ${m.nombre}? Date de alta gratis en GesLimpia, fija tu tarifa y recibe solicitudes de hogares de ${m.nombre} y alrededores. Sin comisiones por servicio.`;
  const path = `/trabajo-limpiadora/${m.slug}`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl(path),
      siteName: "GesLimpia",
    },
  };
}

export default function TrabajoLimpiadoraMunicipioPage({
  params,
}: {
  params: { municipio: string };
}) {
  const m = getMunicipio(params.municipio);
  if (!m) notFound();

  const path = `/trabajo-limpiadora/${m.slug}`;
  const canonical = absoluteUrl(path);
  const intro = introLimpiadora(m);
  const faqs = faqsLimpiadora(m);
  const cercanos = m.cercanos
    .map((s) => getMunicipio(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <>
      <SiteHeader />
      <main>
        {/* JSON-LD: Service (captación de limpiadoras) + FAQPage + BreadcrumbList.
            Evitamos JobPosting a propósito: no son ofertas de empleo reales con
            empleador y salario, y un JobPosting vacío puede acarrear penalización. */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Service",
            name: `Trabajo de limpiadora en ${m.nombre}`,
            serviceType: "Captación de clientes para limpiadoras independientes",
            areaServed: { "@type": "City", name: m.nombre },
            provider: {
              "@type": "Organization",
              name: "GesLimpia",
              url: SITE_URL,
            },
            url: canonical,
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Zonas", item: absoluteUrl("/zonas") },
              { "@type": "ListItem", position: 3, name: `Trabajo de limpiadora en ${m.nombre}`, item: canonical },
            ],
          }}
        />

        {/* HERO */}
        <section className="bg-petroleo text-white">
          <div className="container-page py-12">
            <Breadcrumbs
              items={[
                { name: "Inicio", href: "/" },
                { name: "Zonas", href: "/zonas" },
                { name: `Trabajo de limpiadora en ${m.nombre}`, href: path },
              ]}
            />
            <div className="mt-6 max-w-3xl">
              <span className="chip mb-4 bg-menta/20 text-white">
                🧽 Para limpiadoras · {m.comarca}
              </span>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Trabajo de limpiadora en {m.nombre}
              </h1>
              <p className="mt-4 text-lg text-white/85">{intro}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register?role=LIMPIADORA"
                  className="btn-secondary"
                >
                  Registrarme gratis como limpiadora
                </Link>
              </div>
              <p className="mt-3 text-sm text-white/70">
                Sin coste y sin permanencia. Tú fijas tu tarifa.
              </p>
            </div>
          </div>
        </section>

        {/* QUÉ CONSIGUES */}
        <section className="container-page py-14">
          <h2 className="text-2xl font-bold text-petroleo">
            Por qué darte de alta en {m.nombre}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Te registras gratis", "Sin coste y sin permanencia. Empiezas cuando quieras."],
              ["Fijas tú tu tarifa", "Tú decides el precio. Sin comisiones por servicio."],
              ["Recibes solicitudes", `Hogares de ${m.nombre} y alrededores te contactan directamente.`],
              ["Eliges y organizas", "Aceptas los trabajos que te encajan y gestionas tu agenda."],
            ].map(([t, d]) => (
              <div key={t} className="card p-6">
                <h3 className="font-semibold text-petroleo">{t}</h3>
                <p className="mt-2 text-sm text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ZONAS / BARRIOS */}
        <section className="bg-espuma/50 py-14">
          <div className="container-page">
            <h2 className="text-2xl font-bold text-petroleo">
              Recibe solicitudes en tu zona de {m.nombre}
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Indica en tu perfil las zonas donde trabajas. Hogares de áreas como
              estas podrán encontrarte:
            </p>
            <div className="mt-6">
              <BarriosList barrios={m.barrios} />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container-page py-14">
          <h2 className="text-center text-2xl font-bold text-petroleo">
            Preguntas frecuentes
          </h2>
          <div className="mt-8">
            <FaqSection faqs={faqs} />
          </div>
        </section>

        {/* ENLAZADO INTERNO + CROSS-LINK */}
        <section className="container-page pb-16">
          <div className="rounded-2xl border border-menta/30 bg-white p-6 sm:p-8">
            {cercanos.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-petroleo">
                  Trabajo de limpiadora en municipios cercanos
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {cercanos.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/trabajo-limpiadora/${c.slug}`}
                        className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-sm text-petroleo hover:border-menta hover:text-menta"
                      >
                        {c.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-6 rounded-xl bg-espuma p-5">
              <p className="text-petroleo">
                <strong>¿Buscas limpiadora en {m.nombre}?</strong>{" "}
                <Link
                  href={`/limpiadoras/${m.slug}`}
                  className="font-semibold text-agua hover:underline"
                >
                  Ver limpiadoras en {m.nombre} →
                </Link>
              </p>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              <Link href="/zonas" className="text-agua hover:underline">
                Ver todas las zonas
              </Link>{" "}
              donde GesLimpia conecta hogares y limpiadoras.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
