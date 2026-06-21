"use client";

import { useCallback, useEffect } from "react";

// Hook de Google reCAPTCHA v3 (cliente, invisible).
// Carga el script SOLO en las páginas que llaman al hook (login / register), así no
// penaliza el rendimiento del resto del sitio. Expone executeRecaptcha(action) para
// obtener un token que se envía al backend, donde se verifica con la clave secreta.
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const SCRIPT_ID = "recaptcha-v3";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

// Espera a que el script asíncrono haya definido window.grecaptcha (evita que un envío
// muy rápido se quede sin token). Si no aparece a tiempo, devuelve false y el backend
// aplica su criterio (fail-open en transitorios).
function waitForGrecaptcha(timeoutMs = 4000): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.grecaptcha) return Promise.resolve(true);
  const start = Date.now();
  return new Promise((resolve) => {
    const iv = setInterval(() => {
      if (window.grecaptcha) {
        clearInterval(iv);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(iv);
        resolve(false);
      }
    }, 100);
  });
}

export function useRecaptcha() {
  useEffect(() => {
    if (!SITE_KEY) return; // sin clave (dev): no cargamos nada ni mostramos badge
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!SITE_KEY) return null; // dev: el backend omite la verificación
      const ready = await waitForGrecaptcha();
      if (!ready || !window.grecaptcha) return null;
      try {
        return await new Promise<string>((resolve, reject) => {
          window.grecaptcha!.ready(() => {
            window
              .grecaptcha!.execute(SITE_KEY, { action })
              .then(resolve)
              .catch(reject);
          });
        });
      } catch {
        return null;
      }
    },
    []
  );

  return { executeRecaptcha };
}
