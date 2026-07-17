"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { POBLACIONES } from "@/lib/constants";
import ConsentCheckbox from "@/components/ConsentCheckbox";

export default function RolePicker({ defaultCiudad }: { defaultCiudad: string }) {
  const { update } = useSession();
  const [role, setRole] = useState<"HOGAR" | "LIMPIADORA">("HOGAR");
  const [ciudad, setCiudad] = useState<string>(
    defaultCiudad && POBLACIONES.includes(defaultCiudad as (typeof POBLACIONES)[number])
      ? defaultCiudad
      : POBLACIONES[0]
  );
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Consentimiento obligatorio, pero con mensaje claro en vez de un botón
    // desactivado que no explica por qué no avanza.
    if (!consent) {
      setError(
        "Marca la casilla para aceptar la Política de Privacidad y los Términos antes de continuar."
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/rol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, ciudad, consent }),
      });
      const data = await res.json();
      // 409 = la cuenta YA tiene rol (token desactualizado que aún dice null y
      // ha rebotado hasta aquí). No es un error para el usuario: refrescamos el
      // token y lo llevamos a su panel, en vez de dejarlo atascado en esta
      // pantalla sin salida.
      if (res.status === 409) {
        await update();
        window.location.assign("/dashboard");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar tu elección.");
        setLoading(false);
        return;
      }
      // Refresca el JWT para que el rol viaje en el token (y el middleware lo deje pasar).
      await update();
      // Navegación DURA (no router.push): garantiza que el middleware reciba la cookie
      // ya con el rol refrescado. Con navegación de cliente podría leer el token antiguo
      // (rol null) y rebotar de nuevo a /onboarding/rol → bucle.
      // Ambos roles entran directos al panel: allí el propio dashboard guía el
      // siguiente paso (suscribirse el hogar, completar perfil la limpiadora)
      // sin sacar al usuario del panel.
      window.location.assign("/dashboard");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {(["HOGAR", "LIMPIADORA"] as const).map((r) => (
          <button
            type="button"
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-xl border-2 p-4 text-left transition ${
              role === r
                ? "border-agua bg-espuma"
                : "border-slate-200 hover:border-agua/50"
            }`}
          >
            <span className="text-2xl">{r === "HOGAR" ? "🏠" : "🧽"}</span>
            <p className="mt-1 font-semibold text-petroleo">
              {r === "HOGAR" ? "Soy un hogar" : "Soy limpiadora"}
            </p>
            <p className="text-xs text-slate-500">
              {r === "HOGAR"
                ? "Busco limpiadora"
                : "Ofrezco mis servicios (gratis)"}
            </p>
          </button>
        ))}
      </div>

      <div>
        <label className="label" htmlFor="ciudad">
          Población
        </label>
        <select
          id="ciudad"
          className="input"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
        >
          {POBLACIONES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <ConsentCheckbox checked={consent} onChange={setConsent} />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Continuar"}
      </button>

      {role === "LIMPIADORA" && (
        <p className="text-center text-xs text-slate-500">
          Registrarse como limpiadora es totalmente gratis.
        </p>
      )}
    </form>
  );
}
