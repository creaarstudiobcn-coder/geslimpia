import Link from "next/link";
import Reveal from "./Reveal";

/* ============================================================================
   Iconos ilustrados con SVG/CSS (sin fotos). Cada uno lleva una micro-animación
   sutil (clases gl-* de globals.css) que se desactiva con prefers-reduced-motion.
   Tamaño base 40px dentro de un tile redondeado.
   ========================================================================== */

// A1 — Suscripción / acceso: tarjeta de socio con check + anillo que late.
function IconAcceso() {
  return (
    <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-espuma">
      <span className="gl-ring absolute h-12 w-12 rounded-full bg-agua/30" />
      <svg
        viewBox="0 0 40 40"
        className="relative h-10 w-10"
        fill="none"
        aria-hidden="true"
      >
        <rect x="5" y="10" width="30" height="20" rx="4" fill="#129BC9" />
        <rect x="5" y="14" width="30" height="4" fill="#0E2A3B" opacity="0.25" />
        <circle cx="14" cy="24" r="4" fill="#fff" />
        <path
          d="M12.3 24l1.3 1.3 2.4-2.6"
          stroke="#129BC9"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="21" y="22" width="10" height="2" rx="1" fill="#fff" opacity="0.9" />
        <rect x="21" y="26" width="7" height="2" rx="1" fill="#fff" opacity="0.7" />
      </svg>
    </span>
  );
}

// A2 — Buscar limpiadoras en tu zona: lupa + estrellas que titilan.
function IconBuscar() {
  return (
    <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-espuma">
      <svg
        viewBox="0 0 40 40"
        className="h-10 w-10"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="17" cy="17" r="9" stroke="#129BC9" strokeWidth="2.6" />
        <line
          x1="24"
          y1="24"
          x2="32"
          y2="32"
          stroke="#129BC9"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          className="gl-twinkle"
          style={{ animationDelay: "0s" }}
          d="M14 13l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L11 15.3l2-.3 1-2z"
          fill="#2FC4A8"
        />
        <circle className="gl-twinkle" style={{ animationDelay: "0.5s" }} cx="22" cy="14" r="1.3" fill="#2FC4A8" />
        <circle className="gl-twinkle" style={{ animationDelay: "1s" }} cx="20" cy="21" r="1.1" fill="#129BC9" />
      </svg>
    </span>
  );
}

// A3 — Contactar por chat: dos bocadillos + puntos "escribiendo".
function IconChat() {
  return (
    <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-espuma">
      <svg
        viewBox="0 0 40 40"
        className="h-10 w-10"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 11a3 3 0 013-3h13a3 3 0 013 3v7a3 3 0 01-3 3h-8l-5 4v-4H9a3 3 0 01-3-3v-7z"
          fill="#129BC9"
        />
        <path
          d="M19 20a3 3 0 013-3h9a3 3 0 013 3v6a3 3 0 01-3 3h-1v3l-4-3h-4a3 3 0 01-3-3v-6z"
          fill="#2FC4A8"
        />
        <circle className="gl-dot" style={{ animationDelay: "0s" }} cx="11" cy="14.5" r="1.5" fill="#fff" />
        <circle className="gl-dot" style={{ animationDelay: "0.2s" }} cx="16" cy="14.5" r="1.5" fill="#fff" />
        <circle className="gl-dot" style={{ animationDelay: "0.4s" }} cx="21" cy="14.5" r="1.5" fill="#fff" />
      </svg>
    </span>
  );
}

// A4 — Limpiadora en casa: casa + destellos que titilan.
function IconCasa() {
  return (
    <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-espuma">
      <svg
        viewBox="0 0 40 40"
        className="h-10 w-10"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20 7l13 11h-3v14H10V18H7L20 7z"
          fill="#129BC9"
        />
        <rect x="17" y="23" width="6" height="9" rx="1" fill="#fff" />
        <path
          className="gl-twinkle"
          style={{ animationDelay: "0.2s" }}
          d="M28 9l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8.8-1.8z"
          fill="#2FC4A8"
        />
        <path
          className="gl-twinkle"
          style={{ animationDelay: "0.9s" }}
          d="M12 13l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6.6-1.3z"
          fill="#2FC4A8"
        />
      </svg>
    </span>
  );
}

// B1 — Registro gratis: etiqueta "GRATIS" que se balancea.
function IconGratis() {
  return (
    <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-menta/15">
      <svg
        viewBox="0 0 40 40"
        className="gl-swing h-10 w-10"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 7h13l13 13-13 13L7 20V7z"
          fill="#2FC4A8"
        />
        <circle cx="13.5" cy="13.5" r="2.6" fill="#fff" />
        <text
          x="22"
          y="24"
          fontSize="7"
          fontWeight="bold"
          fill="#0E2A3B"
          transform="rotate(45 22 22)"
        >
          0€
        </text>
      </svg>
    </span>
  );
}

// B2 — Fijas tu tarifa: etiqueta de precio con € y flecha arriba (pulso).
function IconTarifa() {
  return (
    <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-menta/15">
      <svg
        viewBox="0 0 40 40"
        className="h-10 w-10"
        fill="none"
        aria-hidden="true"
      >
        <rect x="8" y="11" width="24" height="18" rx="4" fill="#0E2A3B" />
        <path
          d="M23 17.5a4 4 0 100 5M16 20h6"
          stroke="#2FC4A8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="gl-float"
          d="M30 9l3 3-3 3"
          stroke="#129BC9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          transform="rotate(-90 30 12)"
        />
      </svg>
    </span>
  );
}

// B3 — Recibes solicitudes: campana con notificaciones que llegan (titilan).
function IconSolicitudes() {
  return (
    <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-menta/15">
      <svg
        viewBox="0 0 40 40"
        className="h-10 w-10"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20 9a7 7 0 017 7v5l2 3H11l2-3v-5a7 7 0 017-7z"
          fill="#0E2A3B"
        />
        <path
          d="M17 27a3 3 0 006 0"
          stroke="#0E2A3B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle className="gl-twinkle" style={{ animationDelay: "0s" }} cx="28" cy="12" r="3.4" fill="#2FC4A8" />
        <circle className="gl-twinkle" style={{ animationDelay: "0.7s" }} cx="11" cy="15" r="2.2" fill="#129BC9" />
      </svg>
    </span>
  );
}

// B4 — Eliges y organizas agenda: calendario con check (aparece con el reveal).
function IconAgenda() {
  return (
    <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-menta/15">
      <svg
        viewBox="0 0 40 40"
        className="h-10 w-10"
        fill="none"
        aria-hidden="true"
      >
        <rect x="7" y="10" width="26" height="23" rx="4" fill="#0E2A3B" />
        <rect x="7" y="10" width="26" height="6" rx="4" fill="#129BC9" />
        <line x1="13" y1="7" x2="13" y2="13" stroke="#2FC4A8" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="27" y1="7" x2="27" y2="13" stroke="#2FC4A8" strokeWidth="2.4" strokeLinecap="round" />
        <path
          className="gl-float"
          d="M15 23l3.2 3.2L26 19"
          stroke="#2FC4A8"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

/* ============================================================================
   Tarjeta de paso reutilizable
   ========================================================================== */
type Paso = {
  icon: React.ReactNode;
  titulo: string;
  texto: string;
};

function StepCard({
  paso,
  index,
  accent,
}: {
  paso: Paso;
  index: number;
  accent: "agua" | "menta";
}) {
  const numClass = accent === "agua" ? "text-agua" : "text-menta";
  return (
    <Reveal delay={index * 120} className="h-full">
      <div className="card relative h-full p-6">
        <div className="mb-4 flex items-center gap-3">
          {paso.icon}
          <span className={`text-sm font-bold ${numClass}`}>
            Paso {index + 1}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-petroleo">{paso.titulo}</h3>
        <p className="mt-2 text-sm text-slate-600">{paso.texto}</p>
      </div>
    </Reveal>
  );
}

// Pequeña insignia de refuerzo de valor (icono SVG + texto).
function ValueBadge({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-espuma px-4 py-2 text-sm font-medium text-petroleo">
      {icon}
      {children}
    </span>
  );
}

/* ============================================================================
   SECCIÓN A — Para las familias / hogares
   ========================================================================== */
const PASOS_HOGAR: Paso[] = [
  {
    icon: <IconAcceso />,
    titulo: "Te suscribes a la plataforma",
    texto:
      "Eliges tu plan de acceso. La cuota es por usar GesLimpia y contactar limpiadoras — no por la limpieza.",
  },
  {
    icon: <IconBuscar />,
    titulo: "Buscas en tu zona",
    texto:
      "Ves perfiles de limpiadoras de tu población, con su tarifa y las valoraciones de otros hogares.",
  },
  {
    icon: <IconChat />,
    titulo: "Contactas por chat",
    texto:
      "Habláis directamente y acordáis día, hora y precio. Tú decides con quién y cuándo.",
  },
  {
    icon: <IconCasa />,
    titulo: "Limpieza en tu casa",
    texto:
      "La limpiadora va a tu hogar. El pago del servicio es entre vosotros, según la tarifa que ella fija.",
  },
];

export function FamiliasSection() {
  return (
    <section className="container-page py-16">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="chip mb-3">🏠 Para tu hogar</span>
        <h2 className="text-3xl font-bold tracking-tight text-petroleo">
          Así de fácil (y por qué pagas la cuota)
        </h2>
        <p className="mt-3 text-slate-600">
          La cuota mensual es por <strong>usar la plataforma</strong> y contactar
          limpiadoras. <strong>No incluye la limpieza</strong>: cada limpiadora
          fija su tarifa y la acuerdas con ella.
        </p>
      </Reveal>

      <div className="relative mt-12">
        {/* Línea conectora animada: horizontal en desktop. */}
        <div
          className="gl-dash pointer-events-none absolute left-[16%] right-[16%] top-[3.25rem] hidden h-0.5 lg:block"
          aria-hidden="true"
        />
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS_HOGAR.map((p, i) => (
            <StepCard key={p.titulo} paso={p} index={i} accent="agua" />
          ))}
        </div>
      </div>

      <Reveal
        delay={200}
        className="mt-10 flex flex-wrap justify-center gap-3"
      >
        <ValueBadge
          icon={
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="8" stroke="#129BC9" strokeWidth="2" />
              <path d="M10 6v4l2.5 2" stroke="#129BC9" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        >
          Ahorras tiempo
        </ValueBadge>
        <ValueBadge
          icon={
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M10 2l6 2v5c0 4-2.7 6.5-6 7-3.3-.5-6-3-6-7V4l6-2z" stroke="#2FC4A8" strokeWidth="2" strokeLinejoin="round" />
              <path d="M7.5 10l1.7 1.7L13 8" stroke="#2FC4A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          Profesionales con valoraciones
        </ValueBadge>
        <ValueBadge
          icon={
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="8" stroke="#0E2A3B" strokeWidth="2" />
              <line x1="5" y1="5" x2="15" y2="15" stroke="#0E2A3B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        >
          Sin permanencia
        </ValueBadge>
      </Reveal>
    </section>
  );
}

/* ============================================================================
   SECCIÓN B — Para las limpiadoras
   ========================================================================== */
const PASOS_LIMPIADORA: Paso[] = [
  {
    icon: <IconGratis />,
    titulo: "Te registras gratis",
    texto:
      "Sin coste y sin permanencia. Date de alta en minutos y empieza cuando quieras.",
  },
  {
    icon: <IconTarifa />,
    titulo: "Fijas tú tu tarifa",
    texto:
      "Creas tu perfil y decides tú el precio de tu servicio. Nadie te lo baja.",
  },
  {
    icon: <IconSolicitudes />,
    titulo: "Recibes solicitudes",
    texto:
      "Hogares de tu zona te contactan directamente a través de la plataforma.",
  },
  {
    icon: <IconAgenda />,
    titulo: "Eliges y organizas",
    texto:
      "Aceptas los trabajos que te encajan y gestionas tu agenda a tu manera.",
  },
];

export function LimpiadorasSection() {
  return (
    <section className="bg-espuma/50 py-16">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip mb-3 bg-menta/20">🧽 Para limpiadoras</span>
          <h2 className="text-3xl font-bold tracking-tight text-petroleo">
            Tú tienes el control
          </h2>
          <p className="mt-3 text-slate-600">
            Consigues clientes de tu zona <strong>sin intermediarios que te
            bajen la tarifa</strong>. Tú pones el precio, tú eliges los trabajos.
          </p>
        </Reveal>

        <div className="relative mt-12">
          <div
            className="gl-dash pointer-events-none absolute left-[16%] right-[16%] top-[3.25rem] hidden h-0.5 lg:block"
            aria-hidden="true"
          />
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PASOS_LIMPIADORA.map((p, i) => (
              <StepCard key={p.titulo} paso={p} index={i} accent="menta" />
            ))}
          </div>
        </div>

        <Reveal delay={200} className="mt-10 text-center">
          <Link href="/register?role=LIMPIADORA" className="btn-secondary text-base">
            Registrarme gratis como limpiadora
          </Link>
          <p className="mt-3 text-xs text-slate-500">
            Sin coste y sin permanencia. Tú fijas tu tarifa.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
