import Link from "next/link";
import Logo from "./Logo";
import CookieSettingsButton from "./cookies/CookieSettingsButton";
import SocialLinks from "./SocialLinks";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-petroleo text-white">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm text-white/70">
              Plataforma de conexión entre hogares y limpiadoras profesionales
              independientes en la provincia de Barcelona.
            </p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Zonas</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/limpiadoras/barcelona" className="hover:text-menta">
                  Limpiadora en Barcelona
                </Link>
              </li>
              <li>
                <Link href="/limpiadoras/badalona" className="hover:text-menta">
                  Limpiadora en Badalona
                </Link>
              </li>
              <li>
                <Link href="/limpiadoras/terrassa" className="hover:text-menta">
                  Limpiadora en Terrassa
                </Link>
              </li>
              <li>
                <Link href="/limpiadoras/mataro" className="hover:text-menta">
                  Limpiadora en Mataró
                </Link>
              </li>
              <li>
                <Link href="/zonas" className="font-medium text-menta hover:underline">
                  Ver todas las zonas →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/terminos" className="hover:text-menta">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-menta">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-menta">
                  Política de cookies
                </Link>
              </li>
              <li>
                <Link href="/aviso-legal" className="hover:text-menta">
                  Aviso legal
                </Link>
              </li>
              <li>
                <CookieSettingsButton className="text-left hover:text-menta" />
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Empezar</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/register?role=HOGAR" className="hover:text-menta">
                  Soy un hogar
                </Link>
              </li>
              <li>
                <Link
                  href="/register?role=LIMPIADORA"
                  className="hover:text-menta"
                >
                  Soy limpiadora
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-menta">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-white/50">
            Pagos 100% seguros
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { src: "/pagos/stripe.png", alt: "Stripe" },
              { src: "/pagos/apple-pay.png", alt: "Apple Pay" },
              { src: "/pagos/google-pay.jpg", alt: "Google Pay" },
              { src: "/pagos/sabadell.jpg", alt: "Banco Sabadell" },
            ].map((m) => (
              <span
                key={m.alt}
                className="inline-flex h-9 items-center rounded-md bg-white px-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.src}
                  alt={m.alt}
                  className="h-5 w-auto"
                  loading="lazy"
                />
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 text-xs text-white/60">
          <p>
            <strong className="text-white/80">
              GesLimpia es una plataforma de conexión, no una empresa de
              limpieza.
            </strong>{" "}
            No empleamos a las limpiadoras ni prestamos el servicio de limpieza.
            La cuota mensual es por el uso de la plataforma; el precio de la
            limpieza lo fija cada limpiadora y se acuerda directamente con ella.
          </p>
          <p className="mt-3">
            © {new Date().getFullYear()} GesLimpia · Mataró i el Maresme. Todos
            los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
