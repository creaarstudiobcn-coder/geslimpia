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
  introHogar,
  faqsHogar,
} from "@/lib/zonas";
import { SITE_URL, absoluteUrl } from "@/lib/site";

// Solo se generan (y son válidas) las rutas de los municipios de la lista.
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
  const title = `Limpiadora en ${m.nombre} | GesLimpia`;
  const description = `Encuentra limpiadora de confianza en ${m.nombre} (${m.comarca}). Ves perfiles, tarifas y valoraciones de limpiadoras independientes de la zona y contactas directamente. Plataforma de conexión, no empresa de limpieza.`;
  const path = `/limpiadoras/${m.slug}`;
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

export default function LimpiadorasMunicipioPage({
  params,
}: {
  params: { municipio: string };
}) {
  const m = getMunicipio(params.municipio);
  if (!m) notFound();

  const path = `/limpiadoras/${m.slug}`;
  const canonical = absoluteUrl(path);
  const intro = introHogar(m);
  const faqs = faqsHogar(m);
  const cercanos = m.cercanos
    .map((s) => getMunicipio(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <>
      <SiteHeader />
      <main>
        {/* JSON-LD: Service + FAQPage + BreadcrumbList */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Service",
            name: `Limpiadoras en ${m.nombre}`,
            serviceType: "Servicio de limpieza del hogar",
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
              { "@type": "ListItem", position: 3, name: `Limpiadora en ${m.nombre}`, item: canonical },
            ],
          }}
        />

        {/* HERO */}
        <section className="bg-espuma/60">
          <div className="container-page py-12">
            <Breadcrumbs
              items={[
                { name: "Inicio", href: "/" },
                { name: "Zonas", href: "/zonas" },
                { name: `Limpiadora en ${m.nombre}`, href: path },
              ]}
            />
            <div className="mt-6 max-w-3xl">
              <span className="chip mb-4">🏠 Para tu hogar · {m.comarca}</span>
              <h1 className="text-3xl font-bold tracking-tight text-petroleo sm:text-4xl">
                Limpiadora en {m.nombre}
              </h1>
              <p className="mt-4 text-lg text-slate-600">{intro}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/register?role=HOGAR" className="btn-primary">
                  Buscar limpiadora en {m.nombre}
                </Link>
                <Link href="/#planes" className="btn-outline">
                  Ver planes de acceso
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="container-page py-14">
          <h2 className="text-2xl font-bold text-petroleo">
            Cómo encontrar limpiadora en {m.nombre}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["1. Te suscribes", "Eliges un plan de acceso. La cuota es por usar la plataforma, no por la limpieza."],
              ["2. Buscas en tu zona", `Ves perfiles de limpiadoras de ${m.nombre}, con su tarifa y sus valoraciones.`],
              ["3. Contactáis", "Habláis por el chat y acordáis día, hora y precio directamente con ella."],
              ["4. Limpieza en casa", "La limpiadora va a tu hogar. El pago del servicio es entre vosotros."],
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
              Zonas de {m.nombre} que cubrimos
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Conectamos con limpiadoras de todo {m.nombre} y alrededores. Estas
              son algunas de las zonas del municipio:
            </p>
            <div className="mt-6">
              <BarriosList barrios={m.barrios} />
            </div>
            <p className="mt-4 text-sm text-slate-500">
              La disponibilidad depende de las altas en cada momento. Si en tu
              barrio todavía hay pocas limpiadoras, también puedes conectar con
              profesionales de municipios cercanos.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="container-page py-14">
          <h2 className="text-center text-2xl font-bold text-petroleo">
            Preguntas frecuentes sobre limpiadoras en {m.nombre}
          </h2>
          <div className="mt-8">
            <FaqSection faqs={faqs} />
          </div>
        </section>

        {/* ENLAZADO INTERNO + CROSS-LINK */}
        <section className="container-page pb-16">
          <div className="rounded-2xl border border-agua/20 bg-white p-6 sm:p-8">
            {cercanos.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-petroleo">
                  Limpiadoras en municipios cercanos
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {cercanos.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/limpiadoras/${c.slug}`}
                        className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-sm text-petroleo hover:border-agua hover:text-agua"
                      >
                        Limpiadora en {c.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-6 rounded-xl bg-espuma p-5">
              <p className="text-petroleo">
                <strong>¿Eres limpiadora en {m.nombre}?</strong> Date de alta
                gratis y consigue clientes de tu zona.{" "}
                <Link
                  href={`/trabajo-limpiadora/${m.slug}`}
                  className="font-semibold text-agua hover:underline"
                >
                  Ver trabajo de limpiadora en {m.nombre} →
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
