"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  readConsent,
  writeConsent,
  applyConsent,
  OPEN_COOKIE_SETTINGS,
} from "@/lib/cookies";

export default function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (c) {
      // Ya hay decisión previa: aplicamos lo aceptado (analítica solo si procede).
      applyConsent(c);
      setAnalytics(c.analytics);
    } else {
      // Primera visita: pedimos consentimiento (nada no-necesario cargado aún).
      setShowBanner(true);
    }
    setReady(true);

    const open = () => {
      const cur = readConsent();
      setAnalytics(cur?.analytics ?? false);
      setShowPanel(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, open);
  }, []);

  function decide(analyticsValue: boolean) {
    const c = writeConsent(analyticsValue);
    applyConsent(c);
    setAnalytics(analyticsValue);
    setShowBanner(false);
    setShowPanel(false);
  }

  if (!ready || (!showBanner && !showPanel)) return null;

  return (
    <>
      {/* Panel de configuración por categorías */}
      {showPanel ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-petroleo/40 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Configuración de cookies"
        >
          <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-card sm:rounded-2xl">
            <div className="flex items-start gap-3">
              <Drop />
              <div>
                <h2 className="text-lg font-bold text-petroleo">
                  Configuración de cookies
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Elige qué cookies permites. Puedes cambiarlo cuando quieras.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Category
                title="Necesarias"
                description="Imprescindibles para que la plataforma funcione (sesión, seguridad y tu propia elección de cookies). No se pueden desactivar."
                checked
                disabled
              />
              <Category
                title="Analíticas"
                description="Nos ayudan a medir y mejorar el uso del sitio de forma agregada. Solo se cargan si las aceptas."
                checked={analytics}
                onChange={setAnalytics}
              />
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button onClick={() => decide(analytics)} className="btn-primary flex-1">
                Guardar selección
              </button>
              <button onClick={() => decide(true)} className="btn-outline flex-1">
                Aceptar todas
              </button>
              <button onClick={() => decide(false)} className="btn-ghost flex-1">
                Rechazar todas
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              Más información en nuestra{" "}
              <Link href="/cookies" className="text-agua hover:underline">
                Política de Cookies
              </Link>
              .
            </p>
          </div>
        </div>
      ) : (
        /* Banner de primera visita */
        <div
          className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
          role="dialog"
          aria-label="Aviso de cookies"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-start gap-3">
              <Drop />
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-petroleo">
                  Usamos cookies 🍪
                </p>
                <p className="mt-1">
                  Utilizamos cookies necesarias para que la plataforma funcione y,
                  con tu permiso, cookies analíticas para mejorar el sitio. Tú
                  decides.{" "}
                  <Link href="/cookies" className="text-agua hover:underline">
                    Más información
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setShowPanel(true)} className="btn-ghost order-3 sm:order-1">
                Configurar
              </button>
              <button onClick={() => decide(false)} className="btn-outline order-2">
                Rechazar todas
              </button>
              <button onClick={() => decide(true)} className="btn-primary order-1 sm:order-3">
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Category({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 p-4">
      <div>
        <p className="font-semibold text-petroleo">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-[#16B6BE] peer-disabled:opacity-60" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}

// Isotipo de gota de la marca (#16B6BE → #10B981).
function Drop() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ccDrop" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#27C2D6" />
          <stop offset="0.55" stopColor="#16B6BE" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5C12 2.5 5 10 5 14.5a7 7 0 1 0 14 0C19 10 12 2.5 12 2.5Z"
        fill="url(#ccDrop)"
      />
    </svg>
  );
}
