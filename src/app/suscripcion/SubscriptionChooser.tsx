"use client";

import { useState } from "react";
import { PLANES, type PlanId } from "@/lib/constants";

export default function SubscriptionChooser({
  preselect,
}: {
  preselect: PlanId;
}) {
  const [selected, setSelected] = useState<PlanId>(preselect);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function subscribe() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selected }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      setError(data.error ?? "No se pudo iniciar la suscripción.");
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        {Object.values(PLANES).map((plan) => {
          const active = selected === plan.id;
          return (
            <button
              type="button"
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`card relative p-7 text-left transition ${
                active ? "ring-2 ring-agua" : "hover:shadow-soft"
              }`}
            >
              {plan.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-agua px-4 py-1 text-xs font-semibold text-white">
                  Más elegido
                </span>
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-petroleo">
                  Plan {plan.nombre}
                </h3>
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                    active ? "border-agua bg-agua text-white" : "border-slate-300"
                  }`}
                >
                  {active ? "✓" : ""}
                </span>
              </div>
              <p className="mt-3">
                <span className="text-4xl font-bold text-petroleo">
                  {plan.precioLabel}
                </span>
                <span className="text-slate-500">/mes</span>
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <span className="mt-0.5 text-menta">✔</span>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={subscribe}
        disabled={loading}
        className="btn-primary mx-auto mt-8 flex w-full max-w-sm text-base"
      >
        {loading
          ? "Redirigiendo…"
          : `Suscribirme al plan ${PLANES[selected].nombre}`}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        Sin permanencia · Puedes cancelar cuando quieras
      </p>
    </div>
  );
}
