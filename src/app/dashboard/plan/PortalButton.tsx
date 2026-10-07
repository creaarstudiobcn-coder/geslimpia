"use client";

import { useState } from "react";

// Abre el Customer Portal de Stripe para actualizar la tarjeta y pagar la
// factura pendiente. La URL del portal caduca enseguida, así que se pide en el
// momento del clic y no al pintar la página.
export default function PortalButton({
  label = "Actualizar mi tarjeta",
}: {
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function abrir() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portal" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo abrir la gestión del pago.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={abrir} disabled={loading} className="btn-primary">
        {loading ? "Abriendo…" : label}
      </button>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
