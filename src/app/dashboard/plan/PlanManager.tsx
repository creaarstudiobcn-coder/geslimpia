"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANES, type PlanId } from "@/lib/constants";

export default function PlanManager({
  plan,
  contactsUsed,
  limit,
  periodEnd,
  cancelAtPeriodEnd,
}: {
  plan: PlanId;
  contactsUsed: number;
  limit: number;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const current = PLANES[plan];
  const other = plan === "BASICO" ? PLANES.COMPLETO : PLANES.BASICO;
  const pct = Math.min(100, Math.round((contactsUsed / limit) * 100));
  const fechaFin = periodEnd
    ? new Date(periodEnd).toLocaleDateString("es-ES", { dateStyle: "long" })
    : null;

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

  // Baja y reactivación comparten manejador: las dos son la misma llamada y las
  // dos tienen que enseñar el error si el servidor no ha podido hacerlo.
  async function toggleCancel(cancelar: boolean) {
    if (
      cancelar &&
      !confirm(
        fechaFin
          ? `Tu plan seguirá activo hasta el ${fechaFin} y no se renovará. ¿Continuamos?`
          : "Tu plan no se renovará. ¿Continuamos?"
      )
    ) {
      return;
    }
    setLoading(cancelar ? "cancel" : "resume");
    setCancelError("");
    try {
      const res = await fetch("/api/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: cancelar ? "cancel" : "resume" }),
      });
      // Sin esta comprobación, un fallo de Stripe se veía como una baja
      // correcta: la página se refrescaba igual y el cliente creía haber
      // cancelado algo que se le seguía cobrando.
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCancelError(
          data.error ??
            (cancelar
              ? "No se pudo cancelar. No se ha cambiado nada."
              : "No se pudo reactivar.")
        );
        return;
      }
      router.refresh();
    } catch {
      setCancelError(
        "No se pudo conectar. Revisa tu conexión e inténtalo de nuevo."
      );
    } finally {
      setLoading("");
    }
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
          {cancelAtPeriodEnd ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
              Se cancela
            </span>
          ) : (
            <span className="rounded-full bg-menta/20 px-3 py-1 text-sm font-medium text-[#1f8a76]">
              Activa
            </span>
          )}
        </div>

        {fechaFin &&
          (cancelAtPeriodEnd ? (
            <p className="mt-2 text-sm text-slate-500">
              Cancelada. Mantienes el acceso hasta el {fechaFin} y ese día no se
              renovará.
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Próxima renovación: {fechaFin} · ese día tu cupo vuelve a {limit}
            </p>
          ))}

        <div className="mt-5">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-slate-600">
              Limpiadoras nuevas contactadas este mes
            </span>
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

      {cancelAtPeriodEnd ? (
        <div className="card p-6">
          <h3 className="font-semibold text-petroleo">Reactivar suscripción</h3>
          <p className="mt-1 text-sm text-slate-600">
            Tu plan {current.nombre} está cancelado
            {fechaFin ? ` y termina el ${fechaFin}` : ""}. Si te lo has pensado
            mejor, puedes reactivarlo y seguirá renovándose como siempre — sin
            volver a pagar ahora.
          </p>
          {cancelError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {cancelError}
            </p>
          )}
          <button
            onClick={() => toggleCancel(false)}
            disabled={loading === "resume"}
            className="btn-primary mt-4"
          >
            {loading === "resume" ? "Reactivando…" : "Reactivar mi plan"}
          </button>
        </div>
      ) : (
        <div className="card border-red-100 p-6">
          <h3 className="font-semibold text-petroleo">Cancelar suscripción</h3>
          <p className="mt-1 text-sm text-slate-600">
            Sin permanencia. Conservas el acceso hasta el final del periodo que
            ya has pagado
            {fechaFin ? ` (${fechaFin})` : ""} y no se te volverá a cobrar.
          </p>
          {cancelError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {cancelError}
            </p>
          )}
          <button
            onClick={() => toggleCancel(true)}
            disabled={loading === "cancel"}
            className="btn-ghost mt-4 text-red-600 hover:bg-red-50"
          >
            {loading === "cancel" ? "Cancelando…" : "Cancelar mi plan"}
          </button>
        </div>
      )}
    </div>
  );
}
