"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Logo from "./Logo";

type NavItem = { href: string; label: string; icon: string };

const NAV_HOGAR: NavItem[] = [
  { href: "/dashboard", label: "Buscar limpiadoras", icon: "🔍" },
  { href: "/dashboard/reservas", label: "Mis reservas", icon: "📅" },
  { href: "/dashboard/mensajes", label: "Mensajes", icon: "💬" },
  { href: "/dashboard/favoritas", label: "Favoritas", icon: "⭐" },
  { href: "/dashboard/plan", label: "Mi plan", icon: "💳" },
  { href: "/dashboard/soporte", label: "Mensajes del equipo", icon: "🛟" },
];

const NAV_LIMPIADORA: NavItem[] = [
  { href: "/dashboard", label: "Solicitudes", icon: "📥" },
  { href: "/dashboard/reservas", label: "Mis reservas", icon: "📅" },
  { href: "/dashboard/mensajes", label: "Mensajes", icon: "💬" },
  { href: "/dashboard/valoraciones", label: "Valoraciones", icon: "⭐" },
  { href: "/dashboard/perfil", label: "Mi perfil y tarifa", icon: "🧽" },
  { href: "/dashboard/soporte", label: "Mensajes del equipo", icon: "🛟" },
];

export default function DashboardShell({
  role,
  name,
  children,
}: {
  role: "HOGAR" | "LIMPIADORA";
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = role === "HOGAR" ? NAV_HOGAR : NAV_LIMPIADORA;

  const linkClass = (href: string) => {
    const active =
      href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(href);
    return `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
      active
        ? "bg-agua text-white"
        : "text-slate-600 hover:bg-espuma hover:text-petroleo"
    }`;
  };

  return (
    <div className="min-h-screen bg-espuma/40">
      {/* Topbar móvil */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:hidden">
        <Logo />
        <button
          onClick={() => setOpen((o) => !o)}
          className="btn-ghost text-sm"
          aria-label="Abrir menú"
        >
          ☰ Menú
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } fixed inset-x-0 top-[57px] z-40 border-b border-slate-100 bg-white px-4 py-4 lg:static lg:block lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-4 lg:py-6`}
        >
          <div className="mb-6 hidden lg:block">
            <Logo />
          </div>
          <div className="mb-4 rounded-xl bg-espuma px-4 py-3">
            <p className="text-xs text-slate-500">
              {role === "HOGAR" ? "Hogar" : "Limpiadora"}
            </p>
            <p className="truncate font-semibold text-petroleo">{name}</p>
          </div>
          <nav className="space-y-1" onClick={() => setOpen(false)}>
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <span aria-hidden>🚪</span>
              Salir
            </button>
          </nav>
        </aside>

        {/* Contenido */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
