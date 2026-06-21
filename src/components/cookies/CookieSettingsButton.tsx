"use client";

import { OPEN_COOKIE_SETTINGS } from "@/lib/cookies";

// Reabre el panel de configuración de cookies (para el footer).
export default function CookieSettingsButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))}
      className={className}
    >
      Configurar cookies
    </button>
  );
}
