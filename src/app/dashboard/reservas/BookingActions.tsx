"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Acciones del hogar sobre una reserva desde "Mis reservas":
//  · Cancelar una solicitud que la limpiadora aún no ha contestado.
//  · Marcar como completada una limpieza aceptada cuya fecha ya pasó. Si solo
//    pudiera hacerlo la limpiadora, bastaría con que no la marcara nunca para
//    que el hogar no pudiera valorarla.
// La API valida de nuevo permisos, transición y fecha.
export default function BookingActions({
  bookingId,
  canCancel,
  canComplete,
}: {
  bookingId: string;
  canCancel: boolean;
  canComplete: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function setStatus(status: "CANCELADA" | "COMPLETADA") {
    if (
      status === "CANCELADA" &&
      !window.confirm(
        "¿Cancelar esta solicitud? La limpiadora ya no podrá aceptarla. El contacto sigue contando en tu cupo del mes."
      )
    ) {
      return;
    }
    setBusy(status);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo actualizar la reserva.");
        return;
      }
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  if (!canCancel && !canComplete) return null;

  return (
    <>
      {canComplete && (
        <button
          onClick={() => setStatus("COMPLETADA")}
          disabled={!!busy}
          className="btn-outline text-sm"
        >
          {busy === "COMPLETADA" ? "Guardando…" : "✓ Marcar como completada"}
        </button>
      )}
      {canCancel && (
        <button
          onClick={() => setStatus("CANCELADA")}
          disabled={!!busy}
          className="btn-ghost text-sm text-red-600 hover:bg-red-50"
        >
          {busy === "CANCELADA" ? "Cancelando…" : "Cancelar solicitud"}
        </button>
      )}
      {error && (
        <p className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}
