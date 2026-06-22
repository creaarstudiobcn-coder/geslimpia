"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui";

const MAX_DIM = 512; // px (lado mayor) — suficiente para tarjetas y ficha
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

// Redimensiona en el navegador a un cuadrado de MAX_DIM y convierte a webp
// para que la subida sea ligera y cargue rápido.
async function resizeToWebp(file: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const side = Math.min(MAX_DIM, Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d")!;
  // Recorte centrado (cuadrado) para que el avatar redondo quede bien.
  const min = Math.min(img.width, img.height);
  const sx = (img.width - min) / 2;
  const sy = (img.height - min) / 2;
  ctx.drawImage(img, sx, sy, min, min, 0, 0, side, side);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob falló"))),
      "image/webp",
      0.85
    );
  });
}

export default function PhotoUploader({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-subir el mismo archivo
    if (!file) return;
    setError("");

    if (!ALLOWED.includes(file.type)) {
      setError("Formato no válido. Usa JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("La imagen supera el máximo de 5 MB.");
      return;
    }

    setBusy(true);
    try {
      const webp = await resizeToWebp(file);
      const fd = new FormData();
      fd.append("file", new File([webp], "foto.webp", { type: "image/webp" }));
      const res = await fetch("/api/cleaner/photo", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la foto.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("No se pudo procesar la imagen.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/cleaner/photo", { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      setError("No se pudo quitar la foto.");
      return;
    }
    onChange("");
  }

  return (
    <div>
      <span className="label">Foto de perfil</span>
      <div className="flex items-center gap-4">
        <Avatar name={name || "Tú"} src={value} size={72} />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="btn-secondary text-sm"
            >
              {busy ? "Procesando…" : value ? "Cambiar foto" : "Subir foto"}
            </button>
            {value && (
              <button
                type="button"
                onClick={onRemove}
                disabled={busy}
                className="btn-ghost text-sm text-red-600 hover:bg-red-50"
              >
                Quitar
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">
            JPG, PNG o WEBP · máx. 5 MB. Se recorta cuadrada automáticamente.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onPick}
        />
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
