"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Logo from "./Logo";

export default function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="btn-ghost text-sm">
                Mi panel
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-outline text-sm"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">
                Entrar
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Empezar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
