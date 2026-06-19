"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge, EmptyState } from "@/components/ui";

type Booking = {
  id: string;
  homeName: string;
  homeCity: string;
  date: string;
  hours: number;
  status: string;
  notes: string;
};

export default function CleanerRequests({
  bookings,
}: {
  bookings: Booking[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    router.refresh();
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        emoji="📭"
        title="Aún no tienes solicitudes"
        text="Cuando un hogar de tu zona te contacte, aparecerá aquí. Mantén tu perfil y disponibilidad al día."
      />
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((b) => (
        <div key={b.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-petroleo">{b.homeName}</p>
              <p className="text-sm text-slate-500">{b.homeCity}</p>
            </div>
            <StatusBadge status={b.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>
              📅{" "}
              {new Date(b.date).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            <span>⏱️ {b.hours} h estimadas</span>
          </div>

          {b.notes && (
            <p className="mt-3 rounded-lg bg-espuma px-3 py-2 text-sm text-slate-700">
              “{b.notes}”
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {b.status === "PENDIENTE" && (
              <>
                <button
                  disabled={busy === b.id}
                  onClick={() => setStatus(b.id, "ACEPTADA")}
                  className="btn-secondary text-sm"
                >
                  Aceptar
                </button>
                <button
                  disabled={busy === b.id}
                  onClick={() => setStatus(b.id, "RECHAZADA")}
                  className="btn-ghost text-sm text-red-600 hover:bg-red-50"
                >
                  Rechazar
                </button>
              </>
            )}
            {b.status === "ACEPTADA" && (
              <button
                disabled={busy === b.id}
                onClick={() => setStatus(b.id, "COMPLETADA")}
                className="btn-outline text-sm"
              >
                Marcar como completada
              </button>
            )}
            <Link href={`/dashboard/mensajes/${b.id}`} className="btn-ghost text-sm">
              💬 Abrir chat
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
