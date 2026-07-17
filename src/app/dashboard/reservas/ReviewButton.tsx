"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewButton({
  bookingId,
  cleanerName,
}: {
  bookingId: string;
  cleanerName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "No se pudo valorar.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-secondary text-sm">
        ⭐ Valorar
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={submit} className="card w-full max-w-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-petroleo">
                Valorar a {cleanerName}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-3xl transition ${
                    n <= rating ? "text-amber-500" : "text-slate-300"
                  }`}
                  aria-label={`${n} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              className="input mt-4"
              placeholder="Cuenta tu experiencia (opcional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-4 w-full"
            >
              {loading ? "Enviando…" : "Enviar valoración"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
