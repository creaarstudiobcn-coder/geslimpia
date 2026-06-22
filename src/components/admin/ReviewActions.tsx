"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Acciones del admin sobre una reseña: ocultar/mostrar (sin borrar) y eliminar.
// La verificación de rol es server-side; aquí solo llamamos a la API protegida.
export default function ReviewActions({
  reviewId,
  hidden,
}: {
  reviewId: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function patch(action: "hide" | "show") {
    setBusy(action);
    setError("");
    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "No se pudo completar la acción.");
      return;
    }
    router.refresh();
  }

  async function remove() {
    const ok = window.confirm(
      "¿Eliminar definitivamente esta reseña? Esta acción no se puede deshacer."
    );
    if (!ok) return;
    setBusy("delete");
    setError("");
    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "DELETE",
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "No se pudo eliminar.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {hidden ? (
        <button
          onClick={() => patch("show")}
          disabled={!!busy}
          className="btn-ghost text-xs text-emerald-700 hover:bg-emerald-50"
        >
          {busy === "show" ? "…" : "Mostrar"}
        </button>
      ) : (
        <button
          onClick={() => patch("hide")}
          disabled={!!busy}
          className="btn-ghost text-xs text-amber-700 hover:bg-amber-50"
        >
          {busy === "hide" ? "…" : "Ocultar"}
        </button>
      )}
      <button
        onClick={remove}
        disabled={!!busy}
        className="btn-ghost text-xs text-red-600 hover:bg-red-50"
      >
        {busy === "delete" ? "Eliminando…" : "Eliminar"}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}
