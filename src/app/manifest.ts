import type { MetadataRoute } from "next";

// Manifest PWA. Next.js lo sirve en /manifest.webmanifest e inyecta el <link> solo.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GesLimpia",
    short_name: "GesLimpia",
    description:
      "Conecta con limpiadoras profesionales independientes en Mataró y el Maresme.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#EAF6F8",
    theme_color: "#129BC9",
    lang: "es",
    categories: ["lifestyle", "business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
