"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useRecaptcha } from "@/lib/useRecaptcha";

export default function RecuperarPage() {
  const { executeRecaptcha } = useRecaptcha();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const recaptchaToken = await executeRecaptcha("forgot");
      const res = await fetch("/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, recaptchaToken: recaptchaToken ?? "" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo enviar el correo. Inténtalo de nuevo.");
        return;
      }
      setEnviado(true);
    } catch {
      setError("No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-espuma px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          {enviado ? (
            <>
              <h1 className="text-2xl font-bold text-petroleo">
                Revisa tu correo
              </h1>
              {/* En positivo y sin confirmar que la cuenta exista: la respuesta
                  es la misma haya o no haya cuenta con ese email. */}
              <p className="mt-3 text-slate-600">
                Si hay una cuenta de GesLimpia asociada a{" "}
                <strong className="text-petroleo">{email}</strong>, te hemos
                enviado un enlace para elegir una contraseña nueva. Caduca en una
                hora.
              </p>
              <p className="mt-3 text-sm text-slate-500">
                ¿No lo ves? Mira en la carpeta de spam antes de volver a pedirlo.
              </p>
              <Link href="/login" className="btn-primary mt-6 inline-block">
                Volver a iniciar sesión
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-petroleo">
                ¿Has olvidado tu contraseña?
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Escribe tu email y te enviamos un enlace para elegir una nueva.
              </p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    required
                    autoFocus
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@email.com"
                  />
                </div>
                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? "Enviando…" : "Enviarme el enlace"}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-600">
                ¿Te has acordado?{" "}
                <Link href="/login" className="font-semibold text-agua">
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
