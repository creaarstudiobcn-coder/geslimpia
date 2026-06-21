"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import GoogleButton from "@/components/GoogleButton";
import { POBLACIONES } from "@/lib/constants";
import { useRecaptcha } from "@/lib/useRecaptcha";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { executeRecaptcha } = useRecaptcha();
  const initialRole =
    params.get("role") === "LIMPIADORA" ? "LIMPIADORA" : "HOGAR";
  const planParam = params.get("plan");

  const [role, setRole] = useState<"HOGAR" | "LIMPIADORA">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ciudad, setCiudad] = useState<string>(POBLACIONES[0]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const recaptchaToken = await executeRecaptcha("register");
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, ciudad, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la cuenta.");
        setLoading(false);
        return;
      }
      // Iniciar sesión automáticamente
      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (login?.error) {
        router.push("/login");
        return;
      }
      // Redirección según rol
      if (role === "LIMPIADORA") {
        router.push("/onboarding");
      } else {
        router.push(
          planParam ? `/suscripcion?plan=${planParam}` : "/suscripcion"
        );
      }
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Selector de rol */}
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
        <label className="label" htmlFor="name">
          Nombre
        </label>
        <input
          id="name"
          autoComplete="name"
          required
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
        />
      </div>
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
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@email.com"
        />
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
      <div>
        <label className="label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      {role === "LIMPIADORA" && (
        <p className="text-center text-xs text-slate-500">
          Registrarse como limpiadora es totalmente gratis.
        </p>
      )}
    </form>
  );
}

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-espuma px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-petroleo">Crear cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Únete a GesLimpia, la plataforma de conexión del Maresme.
          </p>
          <div className="mt-6">
            <Suspense fallback={null}>
              <RegisterForm />
            </Suspense>
          </div>
          <GoogleButton callbackUrl="/dashboard" />
          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-agua">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
