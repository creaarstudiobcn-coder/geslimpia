import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

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
  openGraph: {
    title: "GesLimpia — Limpiadoras de confianza en el Maresme",
    description:
      "Plataforma de conexión entre hogares y limpiadoras profesionales independientes.",
    type: "website",
  },
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
      </body>
    </html>
  );
}
