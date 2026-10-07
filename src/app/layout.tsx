import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import CookieConsent from "@/components/cookies/CookieConsent";
import Analytics from "@/components/cookies/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GesLimpia — Limpiadora de confianza en la provincia de Barcelona",
  description:
    "Conecta con limpiadoras profesionales independientes en la provincia de Barcelona: Barcelona, el Baix Llobregat, el Vallès, el Maresme y más. Tú eliges y acuerdas directamente.",
  /* El respaldo era "http://localhost:3000". Con una canónica declarada eso
     publicaría <link rel="canonical" href="http://localhost:3000/"> en cuanto
     faltara la variable en el entorno, que es peor que no tener canónica. */
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.geslimpia.es"
  ),
  // metadataBase por sí solo NO emite <link rel="canonical">: hace falta
  // declararla. Sin ella el ápex y el www compiten por la misma página.
  // "./" = cada página se apunta a sí misma; con "/" todas heredaban la portada.
  alternates: { canonical: "./" },
  applicationName: "GesLimpia",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GesLimpia",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "GesLimpia — Limpiadoras de confianza en la provincia de Barcelona",
    description:
      "Plataforma de conexión entre hogares y limpiadoras profesionales independientes.",
    type: "website",
    // Vista previa al compartir el enlace (WhatsApp, redes). 1200×630.
    images: [
      {
        url: "/og-portada.jpg",
        width: 1200,
        height: 630,
        alt: "GesLimpia — Encuentra limpiadora de confianza cerca de ti",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#16B6BE",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
