// Verificación de Google reCAPTCHA v3 (servidor).
// Protege formularios públicos (registro / login) contra bots y spam.
//
// Criterio de seguridad (ver README → reCAPTCHA):
//  · Sin RECAPTCHA_SECRET_KEY (local) → se OMITE: no bloquea el desarrollo.
//  · Falta token con reCAPTCHA activo → RECHAZA (probable bot o script no cargado).
//  · Google no responde / timeout / red → FAIL-OPEN: un fallo transitorio de Google
//    no debe tirar todos los registros; el riesgo de spam puntual es menor.
//  · success:false, action incorrecta o score < 0.5 → FAIL-CLOSED: token forjado o bot.
const SECRET = process.env.RECAPTCHA_SECRET_KEY;
const SCORE_THRESHOLD = 0.5;
const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export type RecaptchaResult =
  | { ok: true; skipped?: boolean; score?: number }
  | { ok: false; reason: string };

export async function verifyRecaptcha(
  token: string | undefined | null,
  expectedAction?: string
): Promise<RecaptchaResult> {
  // Fallback de desarrollo: sin clave secreta no verificamos.
  if (!SECRET) return { ok: true, skipped: true };

  if (!token) return { ok: false, reason: "missing-token" };

  let data: {
    success?: boolean;
    score?: number;
    action?: string;
    "error-codes"?: string[];
  };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: SECRET, response: token }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`siteverify HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    // Fallo transitorio (Google caído / timeout / red): no bloqueamos a usuarios legítimos.
    console.error("recaptcha verify network error (fail-open):", err);
    return { ok: true, skipped: true };
  }

  if (data.success !== true) {
    return { ok: false, reason: "verification-failed" };
  }
  // El token de v3 incluye la acción con la que se generó: evita reutilizarlo entre
  // formularios distintos (replay login↔register).
  if (expectedAction && data.action && data.action !== expectedAction) {
    return { ok: false, reason: "action-mismatch" };
  }
  const score = typeof data.score === "number" ? data.score : 0;
  if (score < SCORE_THRESHOLD) {
    return { ok: false, reason: "low-score" };
  }
  return { ok: true, score };
}
