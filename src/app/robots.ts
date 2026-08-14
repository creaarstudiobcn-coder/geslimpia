import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site";

// robots.txt nativo. Permite indexar el sitio público y bloquea las rutas
// privadas de la app (panel, API, onboarding, suscripción, login). Apunta al
// sitemap en el dominio canónico.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /restablecer lleva un token personal en la URL y /recuperar es un
      // formulario de servicio: ninguno de los dos aporta nada en Google.
      disallow: [
        "/api/",
        "/dashboard/",
        "/onboarding/",
        "/suscripcion/",
        "/login",
        "/recuperar",
        "/restablecer",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
