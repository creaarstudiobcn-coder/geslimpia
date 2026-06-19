"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICIOS, POBLACIONES } from "@/lib/constants";

type Initial = {
  bio: string;
  hourlyRate: number;
  availability: string;
  photoUrl: string;
  services: string[];
  zones: string[];
  disponibleHoy: boolean;
};

export default function PerfilEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [bio, setBio] = useState(initial.bio);
  const [hourlyRate, setHourlyRate] = useState(String(initial.hourlyRate));
  const [availability, setAvailability] = useState(initial.availability);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);
  const [services, setServices] = useState<string[]>(initial.services);
  const [zones, setZones] = useState<string[]>(initial.zones);
  const [disponibleHoy, setDisponibleHoy] = useState(initial.disponibleHoy);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function toggle(list: string[], value: string) {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (services.length === 0 || zones.length === 0) {
      setError("Selecciona al menos un servicio y una zona.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/cleaner/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio,
        hourlyRate: Number(hourlyRate),
        availability,
        photoUrl,
        services,
        zones,
        disponibleHoy,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo guardar.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="card flex items-center justify-between p-5">
        <div>
          <p className="font-semibold text-petroleo">Disponible hoy</p>
          <p className="text-sm text-slate-500">
            Aparecerás con la etiqueta “Disponible hoy” en las búsquedas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDisponibleHoy((v) => !v)}
          className={`relative h-7 w-12 rounded-full transition ${
            disponibleHoy ? "bg-menta" : "bg-slate-300"
          }`}
          aria-pressed={disponibleHoy}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              disponibleHoy ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      <div className="card space-y-5 p-6">
        <div>
          <label className="label" htmlFor="hourlyRate">
            Tu tarifa por hora (€) — la fijas tú
          </label>
          <div className="flex items-center gap-2">
            <input
              id="hourlyRate"
              type="number"
              min={0}
              step="0.5"
              className="input max-w-[140px]"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
            <span className="text-sm text-slate-500">€/hora</span>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="photoUrl">
            Foto (URL, opcional)
          </label>
          <input
            id="photoUrl"
            className="input"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <div>
          <label className="label" htmlFor="bio">
            Descripción
          </label>
          <textarea
            id="bio"
            rows={4}
            className="input"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div>
          <span className="label">Servicios</span>
          <div className="flex flex-wrap gap-2">
            {SERVICIOS.map((s) => {
              const active = services.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setServices(toggle(services, s.id))}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? "border-agua bg-agua text-white"
                      : "border-slate-200 text-slate-700 hover:border-agua/50"
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="label">Zonas donde trabajas</span>
          <div className="flex flex-wrap gap-2">
            {POBLACIONES.map((z) => {
              const active = zones.includes(z);
              return (
                <button
                  type="button"
                  key={z}
                  onClick={() => setZones(toggle(zones, z))}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? "border-menta bg-menta text-petroleo"
                      : "border-slate-200 text-slate-700 hover:border-menta/50"
                  }`}
                >
                  {z}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="availability">
            Disponibilidad
          </label>
          <input
            id="availability"
            className="input"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="Ej.: Lunes a viernes por las mañanas"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-lg bg-menta/15 px-4 py-2 text-sm text-[#1f8a76]">
          ✓ Perfil guardado correctamente.
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
