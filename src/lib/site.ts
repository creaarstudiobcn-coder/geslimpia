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
