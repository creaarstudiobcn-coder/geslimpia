import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { PLANES } from "@/lib/constants";

const PASOS = [
  {
    emoji: "💳",
    titulo: "Elige tu plan",
    texto:
      "Suscríbete al plan de acceso que mejor encaje contigo. La cuota es por usar la plataforma.",
  },
  {
    emoji: "📅",
    titulo: "Reserva una visita",
    texto: "Busca limpiadoras de tu zona y propón un día y una hora.",
  },
  {
    emoji: "💬",
    titulo: "Contacta y acuerda",
    texto:
      "Habla por el chat, conoce su tarifa y acordáis directamente los detalles.",
  },
  {
    emoji: "🏠",
    titulo: "Limpieza en casa",
    texto: "La limpiadora va a tu hogar. El precio de la limpieza lo pagas a ella.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-espuma to-white">
          <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
            <div className="animate-fade-up">
              <span className="chip mb-5 bg-white shadow-card">
                ✨ Mataró i el Maresme
              </span>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-petroleo sm:text-5xl">
                Encuentra limpiadora de confianza{" "}
                <span className="text-agua">cerca de ti</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Te conectamos con limpiadoras profesionales{" "}
                <strong>independientes</strong> de tu zona. Tú eliges, contactas
                por chat y acordáis los detalles directamente.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register?role=HOGAR"
                  className="btn-primary text-base"
                >
                  🏠 Soy un hogar
                </Link>
                <Link
                  href="/register?role=LIMPIADORA"
                  className="btn-secondary text-base"
                >
                  🧽 Soy limpiadora
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Las limpiadoras se registran <strong>gratis</strong>. Sin
                permanencia.
              </p>
            </div>

            {/* Tarjeta decorativa */}
            <div className="relative animate-fade-up">
              <div className="card mx-auto max-w-md p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-menta/20 text-xl">
                    🧹
                  </div>
                  <div>
                    <p className="font-semibold text-petroleo">Marta G.</p>
                    <p className="text-sm text-slate-500">Mataró · ★ 4,9 (32)</p>
                  </div>
                  <span className="ml-auto rounded-full bg-menta/15 px-2.5 py-1 text-xs font-medium text-[#1f8a76]">
                    Disponible hoy
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="chip">🏠 Hogar</span>
                  <span className="chip">🪟 Cristales</span>
                  <span className="chip">✨ A fondo</span>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-espuma p-4">
                  <div>
                    <p className="text-xs text-slate-500">Tarifa que fija ella</p>
                    <p className="text-lg font-bold text-petroleo">14 €/h</p>
                  </div>
                  <span className="btn-primary pointer-events-none text-sm">
                    Contactar
                  </span>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 -z-10 h-32 w-32 rounded-full bg-agua/20 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 -z-10 h-32 w-32 rounded-full bg-menta/20 blur-2xl" />
            </div>
          </div>
        </section>

        {/* AVISO PLATAFORMA */}
        <section className="container-page py-10">
          <div className="rounded-2xl border border-agua/20 bg-espuma p-6 sm:p-8">
            <p className="text-center text-base text-petroleo sm:text-lg">
              <strong>
                Somos una plataforma de conexión, no una empresa de limpieza.
              </strong>{" "}
              Tu cuota mensual es por usar la plataforma. El precio de la limpieza
              lo pone cada limpiadora y lo acuerdas directamente con ella.
            </p>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="container-page py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-petroleo">
              Cómo funciona
            </h2>
            <p className="mt-3 text-slate-600">
              En cuatro pasos sencillos tienes tu hogar reluciente.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((p, i) => (
              <div key={p.titulo} className="card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-espuma text-2xl">
                    {p.emoji}
                  </span>
                  <span className="text-sm font-bold text-agua">
                    Paso {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-petroleo">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{p.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PLANES */}
        <section id="planes" className="bg-espuma/60 py-16">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-petroleo">
                Elige tu plan de acceso
              </h2>
              <p className="mt-3 text-slate-600">
                Los hogares pagan una cuota mensual por usar la plataforma. La
                cuota <strong>no incluye</strong> el precio de la limpieza.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
              {Object.values(PLANES).map((plan) => (
                <div
                  key={plan.id}
                  className={`card relative p-7 ${
                    plan.destacado ? "ring-2 ring-agua" : ""
                  }`}
                >
                  {plan.destacado && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-agua px-4 py-1 text-xs font-semibold text-white">
                      Más elegido
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-petroleo">
                    Plan {plan.nombre}
                  </h3>
                  <p className="mt-3">
                    <span className="text-4xl font-bold text-petroleo">
                      {plan.precioLabel}
                    </span>
                    <span className="text-slate-500">/mes</span>
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <span className="mt-0.5 text-menta">✔</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/register?role=HOGAR&plan=${plan.id}`}
                    className={`mt-7 w-full ${
                      plan.destacado ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    Elegir {plan.nombre}
                  </Link>
                </div>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-xl text-center text-xs text-slate-500">
              La cuota mensual da acceso a la plataforma y a contactar
              limpiadoras. El servicio de limpieza se paga aparte, directamente a
              la limpiadora, según la tarifa que ella fije.
            </p>
          </div>
        </section>

        {/* CTA LIMPIADORAS */}
        <section className="container-page py-16">
          <div className="overflow-hidden rounded-3xl bg-petroleo p-8 sm:p-12">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  ¿Eres limpiadora?
                </h2>
                <p className="mt-4 text-white/80">
                  Regístrate <strong className="text-menta">gratis</strong> y
                  recibe solicitudes de hogares de tu zona. Tú fijas tu tarifa y
                  gestionas tu disponibilidad. Sin comisiones por servicio.
                </p>
              </div>
              <div className="flex md:justify-end">
                <Link
                  href="/register?role=LIMPIADORA"
                  className="btn-secondary text-base"
                >
                  Registrarme gratis como limpiadora
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
