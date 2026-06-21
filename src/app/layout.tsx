import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import CookieConsent from "@/components/cookies/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GesLimpia — Encuentra limpiadora de confianza en el Maresme",
  description:
    "Plataforma de conexión entre hogares y limpiadoras profesionales independientes en Mataró y el Maresme. Tú eliges, contactas y acuerdas directamente.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
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
    title: "GesLimpia — Limpiadoras de confianza en el Maresme",
    description:
      "Plataforma de conexión entre hogares y limpiadoras profesionales independientes.",
    type: "website",
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
      </body>
    </html>
  );
}
