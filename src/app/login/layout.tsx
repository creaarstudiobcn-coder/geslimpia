import type { Metadata } from "next";

// page.tsx es "use client" y no puede exportar metadata: sin este layout la
// página heredaba el title y la description de la portada.
export const metadata: Metadata = {
  title: "Iniciar sesión · GesLimpia",
  description:
    "Accede a tu panel de GesLimpia para gestionar tus solicitudes, reservas y mensajes.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
