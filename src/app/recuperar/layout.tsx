import type { Metadata } from "next";

// page.tsx es "use client" y no puede exportar metadata: sin este layout la
// página heredaba el title y la description de la portada.
export const metadata: Metadata = {
  title: "Recuperar contraseña · GesLimpia",
  description:
    "Recibe en tu correo un enlace para crear una contraseña nueva en GesLimpia.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
