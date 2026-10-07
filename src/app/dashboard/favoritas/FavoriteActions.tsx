"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Acciones de cada tarjeta de Favoritas: contactar (abre su ficha en la
// búsqueda, con el formulario de reserva) y quitarla de la lista.
export default function FavoriteActions({
  cleanerUserId,
  cleanerName,
}: {
  cleanerUserId: string;
  cleanerName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function quitar() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cleanerUserId, favorite: false }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo quitar de favoritas.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/dashboard?limpiadora=${encodeURIComponent(cleanerUserId)}`}
          className="btn-primary text-sm"
        >
          Contactar
        </Link>
        <button
          onClick={quitar}
          disabled={busy}
          className="btn-ghost text-sm text-slate-600"
          aria-label={`Quitar a ${cleanerName} de favoritas`}
        >
          {busy ? "Quitando…" : "Quitar de favoritas"}
        </button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
