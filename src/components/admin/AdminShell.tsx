"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Logo from "../Logo";

const NAV = [
  { href: "/admin", label: "Resumen", icon: "📊" },
  { href: "/admin/limpiadoras", label: "Limpiadoras", icon: "🧽" },
  { href: "/admin/hogares", label: "Hogares", icon: "🏠" },
  { href: "/admin/suscripciones", label: "Suscripciones", icon: "💳" },
  { href: "/admin/reservas", label: "Reservas", icon: "📅" },
  { href: "/admin/mensajes", label: "Mensajes", icon: "💬" },
];

export default function AdminShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) => {
    const active =
      href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
    return `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
      active
        ? "bg-agua text-white"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;
  };

  return (
    <div className="min-h-screen bg-espuma/40">
      {/* Topbar móvil */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-petroleo px-4 py-3 lg:hidden">
        <Logo light />
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-sm text-white"
          aria-label="Abrir menú"
        >
          ☰ Menú
        </button>
      </div>

      <div className="flex">
        {/* Sidebar oscuro (distingue el panel de admin del de usuario) */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } fixed inset-x-0 top-[53px] z-40 bg-petroleo px-4 py-4 lg:static lg:block lg:min-h-screen lg:w-64 lg:px-4 lg:py-6`}
        >
          <div className="mb-6 hidden lg:block">
            <Logo light />
          </div>
          <div className="mb-4 rounded-xl bg-white/10 px-4 py-3">
            <p className="text-xs text-slate-400">Administrador</p>
            <p className="truncate font-semibold text-white">{name}</p>
          </div>
          <nav className="space-y-1" onClick={() => setOpen(false)}>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-white/10 pt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
            >
              ↩ Ir a mi panel
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
            >
              🚪 Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
