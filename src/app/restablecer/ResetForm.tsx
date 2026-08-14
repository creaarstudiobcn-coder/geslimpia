"use client";

import { useState } from "react";
import Link from "next/link";
import { PASSWORD_MIN } from "@/lib/constants";

export default function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hecho, setHecho] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== repetir) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo cambiar la contraseña.");
        return;
      }
      setHecho(true);
    } catch {
      setError("No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (hecho) {
    return (
      <>
        <h1 className="text-2xl font-bold text-petroleo">Contraseña cambiada</h1>
        <p className="mt-3 text-slate-600">
          Ya puedes entrar en GesLimpia con tu contraseña nueva. Por seguridad
          hemos cerrado las sesiones que hubiera abiertas en otros dispositivos.
        </p>
        <Link href="/login" className="btn-primary mt-6 inline-block">
          Iniciar sesión
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-petroleo">Elige tu contraseña</h1>
      <p className="mt-1 text-sm text-slate-500">
        Mínimo {PASSWORD_MIN} caracteres. Después entrarás con ella.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="password">
            Contraseña nueva
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN}
            autoFocus
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="label" htmlFor="repetir">
            Repite la contraseña
          </label>
          <input
            id="repetir"
            type="password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN}
            className="input"
            value={repetir}
            onChange={(e) => setRepetir(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </>
  );
}
