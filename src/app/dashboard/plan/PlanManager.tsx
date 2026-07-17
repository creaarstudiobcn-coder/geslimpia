"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANES, type PlanId } from "@/lib/constants";

export default function PlanManager({
  plan,
  contactsUsed,
  limit,
  periodEnd,
}: {
  plan: PlanId;
  contactsUsed: number;
  limit: number;
  periodEnd: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const current = PLANES[plan];
  const other = plan === "BASICO" ? PLANES.COMPLETO : PLANES.BASICO;
  const pct = Math.min(100, Math.round((contactsUsed / limit) * 100));

  async function changePlan(target: PlanId) {
    setLoading("change");
    setError("");
    try {
      const res = await fetch("/api/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changePlan", plan: target }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo cambiar el plan.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading("");
    }
  }

  async function cancel() {
    if (!confirm("¿Seguro que quieres cancelar tu suscripción?")) return;
    setLoading("cancel");
    await fetch("/api/subscription", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    setLoading("");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Plan actual</p>
            <p className="text-2xl font-bold text-petroleo">
              {current.nombre}{" "}
              <span className="text-base font-normal text-slate-500">
                · {current.precioLabel}/mes
              </span>
            </p>
          </div>
          <span className="rounded-full bg-menta/20 px-3 py-1 text-sm font-medium text-[#1f8a76]">
            Activa
          </span>
        </div>

        {periodEnd && (
          <p className="mt-2 text-sm text-slate-500">
            Próxima renovación:{" "}
            {new Date(periodEnd).toLocaleDateString("es-ES", {
              dateStyle: "long",
            })}
          </p>
        )}

        <div className="mt-5">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-slate-600">Limpiadoras contactadas</span>
            <span className="font-medium text-petroleo">
              {contactsUsed} / {limit}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-espuma">
            <div
              className="h-full rounded-full bg-agua transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-petroleo">
          {plan === "BASICO" ? "Mejora tu plan" : "Cambiar de plan"}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Cambia al plan {other.nombre} ({other.precioLabel}/mes) — contacta hasta{" "}
          {other.contactos} limpiadoras. Se ajustará el importe en tu próxima
          factura por los días que queden del periodo actual.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          onClick={() => changePlan(other.id)}
          disabled={loading === "change"}
          className="btn-primary mt-4"
        >
          {loading === "change"
            ? "Cambiando…"
            : `Cambiar a plan ${other.nombre}`}
        </button>
      </div>

      <div className="card border-red-100 p-6">
        <h3 className="font-semibold text-petroleo">Cancelar suscripción</h3>
        <p className="mt-1 text-sm text-slate-600">
          Sin permanencia. Perderás el acceso a la búsqueda al cancelar.
        </p>
        <button
          onClick={cancel}
          disabled={loading === "cancel"}
          className="btn-ghost mt-4 text-red-600 hover:bg-red-50"
        >
          {loading === "cancel" ? "Cancelando…" : "Cancelar mi plan"}
        </button>
      </div>
    </div>
  );
}
