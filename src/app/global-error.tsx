"use client";

// Captura errores que ocurren en el propio layout raíz (donde error.tsx no llega).
// Debe renderizar su propio <html>/<body>. Estilos inline para no depender de nada.

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("global error boundary:", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4f6f7",
          fontFamily:
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          color: "#1f2933",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e6eaec",
            padding: 32,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#16B6BE",
              marginBottom: 16,
            }}
          >
            GesLimpia
          </div>
          <div style={{ fontSize: 44 }} aria-hidden>
            🛠️
          </div>
          <h1 style={{ fontSize: 22, color: "#0f2b2d", margin: "12px 0 8px" }}>
            Algo no ha ido bien
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#5b6770" }}>
            Ha ocurrido un error inesperado. Reintenta o vuelve más tarde.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 20,
              background: "#16B6BE",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              padding: "12px 22px",
              borderRadius: 10,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
