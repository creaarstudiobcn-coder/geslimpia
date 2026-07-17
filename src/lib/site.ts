// Dominio canónico del sitio. Se usa para canonicals, Open Graph y sitemap.
// Decisión de producto: el dominio principal en Vercel es CON www
// (https://www.geslimpia.es); el resto (geslimpia.es, *.vercel.app) redirige a él.
// Los canonicals deben apuntar SIEMPRE al dominio principal real, también en builds
// locales, así que es una constante (overridable por si cambia el dominio).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.geslimpia.es"
).replace(/\/$/, "");

// Construye una URL absoluta a partir de una ruta relativa.
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Base para las URLs a las que Stripe devuelve al cliente tras el checkout.
// En producción es siempre el dominio canónico: si dependiera de una env var que
// puede faltar o apuntar al dominio sin www, el cliente que acaba de pagar
// aterrizaría en localhost o cruzaría un redirect que le tira la sesión.
// En local sí dejamos que apunte al servidor de desarrollo.
export function appBaseUrl(): string {
  if (process.env.NODE_ENV === "production") return SITE_URL;
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}
