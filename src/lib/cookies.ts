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
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    __glAnalyticsLoaded?: boolean;
  }
}

export function applyConsent(consent: Consent) {
  if (typeof window === "undefined") return;
  if (consent.analytics && GA_ID && !window.__glAnalyticsLoaded) {
    window.__glAnalyticsLoaded = true;
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    const gtag = (...args: unknown[]) => {
      window.dataLayer!.push(args);
    };
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }
}
