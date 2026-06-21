// Gestión del consentimiento de cookies (AEPD/RGPD/LSSI). Cliente.
// La elección se guarda en la cookie propia `geslimpia_cc` durante 180 días,
// tal y como declara la Política de Cookies.

export const CONSENT_COOKIE = "geslimpia_cc";
export const CONSENT_DAYS = 180;
export const CONSENT_VERSION = 1;

// Evento global para reabrir el panel de cookies (desde "Configurar cookies" del footer).
export const OPEN_COOKIE_SETTINGS = "gl:open-cookie-settings";

export type Consent = {
  v: number;
  necessary: true; // siempre activas, no desactivables
  analytics: boolean; // opcional, off por defecto
};

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    const value = decodeURIComponent(match.split("=").slice(1).join("="));
    const parsed = JSON.parse(value);
    if (typeof parsed?.analytics !== "boolean") return null;
    return { v: CONSENT_VERSION, necessary: true, analytics: !!parsed.analytics };
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): Consent {
  const consent: Consent = { v: CONSENT_VERSION, necessary: true, analytics };
  if (typeof document !== "undefined") {
    const maxAge = CONSENT_DAYS * 24 * 60 * 60;
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(
      JSON.stringify(consent)
    )}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
  return consent;
}

// Carga las herramientas según el consentimiento. Las cookies NO necesarias solo
// se activan aquí, tras el consentimiento previo. Hoy no hay analítica configurada:
// si en el futuro se define NEXT_PUBLIC_GA_ID, se cargará Google Analytics SOLO si
// el usuario ha aceptado la categoría analítica.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __glAnalyticsLoaded?: boolean;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

// Borra las cookies _ga / _ga_* (todas las variantes de dominio/path).
function deleteGaCookies() {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const c of document.cookie.split("; ")) {
    const name = c.split("=")[0];
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name === "_gat") {
      for (const d of domains) {
        document.cookie = `${name}=; path=/; max-age=0${d ? `; domain=${d}` : ""}`;
      }
    }
  }
}

// Carga o desactiva Google Analytics según el consentimiento. Las cookies analíticas
// solo se activan aquí, tras el consentimiento PREVIO del usuario. Sin NEXT_PUBLIC_GA_ID
// no se carga nada (GA queda desactivado sin romper la web).
export function applyConsent(consent: Consent) {
  if (typeof window === "undefined" || !GA_ID) return;

  if (consent.analytics) {
    // Reactiva el kill-switch de Google por si se había revocado antes en esta sesión.
    window[`ga-disable-${GA_ID}`] = false;
    if (window.__glAnalyticsLoaded) return;
    window.__glAnalyticsLoaded = true;
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
  } else {
    // Revocación: kill-switch oficial de Google + borrado de cookies _ga existentes.
    window[`ga-disable-${GA_ID}`] = true;
    deleteGaCookies();
  }
}
