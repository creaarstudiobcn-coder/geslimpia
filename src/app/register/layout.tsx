import type { Metadata } from "next";

// page.tsx es "use client" y no puede exportar metadata: sin este layout la
// página heredaba el title y la description de la portada.
export const metadata: Metadata = {
  title: "Crear cuenta · GesLimpia",
  description:
    "Regístrate gratis en GesLimpia como hogar o como limpiadora y empieza a conectar con limpiadoras profesionales independientes.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
