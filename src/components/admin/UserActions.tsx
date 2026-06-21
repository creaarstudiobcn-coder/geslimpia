"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  isCleaner: boolean;
  active: boolean;
  verified?: boolean;
  // A dónde volver tras eliminar (listado correspondiente).
  deleteRedirect: string;
};

// Acciones del admin sobre un usuario: verificar (limpiadoras), activar/desactivar
// y eliminar. Llaman a la API protegida; la verificación de rol es server-side.
export default function UserActions({
  userId,
  isCleaner,
  active,
  verified,
  deleteRedirect,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function patch(action: string) {
    setBusy(action);
    setError("");
    const res = await fetch(`/api/admin/users/${userId}`, {
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
      "¿Eliminar definitivamente esta cuenta? Se borrarán su perfil, reservas y mensajes. Esta acción no se puede deshacer."
    );
    if (!ok) return;
    setBusy("delete");
    setError("");
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (!res.ok) {
      setBusy(null);
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "No se pudo eliminar.");
      return;
    }
    router.push(deleteRedirect);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {isCleaner &&
        (verified ? (
          <button
            onClick={() => patch("unverify")}
            disabled={!!busy}
            className="btn-outline text-sm"
          >
            {busy === "unverify" ? "…" : "Quitar verificación"}
          </button>
        ) : (
          <button
            onClick={() => patch("verify")}
            disabled={!!busy}
            className="btn-primary text-sm"
          >
            {busy === "verify" ? "…" : "✓ Verificar"}
          </button>
        ))}

      {active ? (
        <button
          onClick={() => patch("deactivate")}
          disabled={!!busy}
          className="btn-ghost text-sm text-amber-700 hover:bg-amber-50"
        >
          {busy === "deactivate" ? "…" : "Desactivar"}
        </button>
      ) : (
        <button
          onClick={() => patch("activate")}
          disabled={!!busy}
          className="btn-ghost text-sm text-emerald-700 hover:bg-emerald-50"
        >
          {busy === "activate" ? "…" : "Reactivar"}
        </button>
      )}

      <button
        onClick={remove}
        disabled={!!busy}
        className="btn-ghost text-sm text-red-600 hover:bg-red-50"
      >
        {busy === "delete" ? "Eliminando…" : "Eliminar"}
      </button>

      {error && (
        <p className="w-full text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
