import type { MetadataRoute } from "next";
import { allSlugs } from "@/lib/zonas";
import { absoluteUrl } from "@/lib/site";

// Sitemap dinámico (App Router nativo, sin next-sitemap). Incluye las páginas
// públicas indexables y las 70 páginas locales (2 por municipio) + /zonas.
export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = allSlugs();

  const estaticas: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/zonas"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/register"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/terminos"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacidad"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const hogares: MetadataRoute.Sitemap = slugs.map((s) => ({
    url: absoluteUrl(`/limpiadoras/${s}`),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const limpiadoras: MetadataRoute.Sitemap = slugs.map((s) => ({
    url: absoluteUrl(`/trabajo-limpiadora/${s}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...estaticas, ...hogares, ...limpiadoras];
}
