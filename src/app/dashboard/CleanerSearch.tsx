"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, RatingStars } from "@/components/ui";
import {
  POBLACIONES,
  SERVICIOS,
  servicioLabel,
  servicioEmoji,
  eur,
} from "@/lib/constants";

type Cleaner = {
  userId: string;
  name: string;
  ciudad: string;
  bio: string;
  hourlyRate: number;
  services: string[];
  zones: string[];
  availability: string;
  photoUrl: string;
  disponibleHoy: boolean;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  isFavorite: boolean;
  alreadyContacted: boolean;
};

export default function CleanerSearch({
  cleaners,
  filters,
  contactInfo,
}: {
  cleaners: Cleaner[];
  filters: { zona: string; servicio: string; disponible: boolean };
  contactInfo: { used: number; limit: number; planName: string };
}) {
  const router = useRouter();
  const [modal, setModal] = useState<Cleaner | null>(null);
  const [favs, setFavs] = useState<Record<string, boolean>>(
    Object.fromEntries(cleaners.map((c) => [c.userId, c.isFavorite]))
  );

  function applyFilters(next: Partial<typeof filters>) {
    const params = new URLSearchParams();
    const zona = next.zona ?? filters.zona;
    const servicio = next.servicio ?? filters.servicio;
    const disponible =
      next.disponible !== undefined ? next.disponible : filters.disponible;
    if (zona) params.set("zona", zona);
    if (servicio) params.set("servicio", servicio);
    if (disponible) params.set("disponible", "1");
    router.push(`/dashboard?${params.toString()}`);
  }

  async function toggleFav(id: string) {
    setFavs((f) => ({ ...f, [id]: !f[id] }));
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cleanerUserId: id }),
    });
    router.refresh();
  }

  return (
    <div>
      {/* Filtros */}
      <div className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[160px] flex-1">
          <label className="label text-xs">Zona</label>
          <select
            className="input py-2"
            value={filters.zona}
            onChange={(e) => applyFilters({ zona: e.target.value })}
          >
            <option value="">Todas</option>
            {POBLACIONES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="label text-xs">Servicio</label>
          <select
            className="input py-2"
            value={filters.servicio}
            onChange={(e) => applyFilters({ servicio: e.target.value })}
          >
            <option value="">Todos</option>
            {SERVICIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 py-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-agua"
            checked={filters.disponible}
            onChange={(e) => applyFilters({ disponible: e.target.checked })}
          />
          Disponibles hoy
        </label>
        {(filters.zona || filters.servicio || filters.disponible) && (
          <button
            className="btn-ghost py-2 text-sm"
            onClick={() => router.push("/dashboard")}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {cleaners.length === 0 ? (
        <div className="card grid place-items-center px-6 py-14 text-center">
          <span className="text-4xl">🧹</span>
          <p className="mt-3 font-semibold text-petroleo">
            No hay limpiadoras con esos filtros
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Prueba a quitar algún filtro o cambiar de zona.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cleaners.map((c) => (
            <div key={c.userId} className="card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <Avatar name={c.name} src={c.photoUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-1 truncate font-semibold text-petroleo">
                      <span className="truncate">{c.name}</span>
                      {c.verified && (
                        <span
                          title="Limpiadora verificada por GesLimpia"
                          className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-agua/10 px-1.5 py-0.5 text-[10px] font-semibold text-agua"
                        >
                          ✓ Verificada
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => toggleFav(c.userId)}
                      aria-label="Favorita"
                      className="text-lg"
                    >
                      {favs[c.userId] ? "⭐" : "☆"}
                    </button>
                  </div>
                  <p className="text-sm text-slate-500">{c.ciudad}</p>
                  <RatingStars value={c.ratingAvg} count={c.ratingCount} />
                </div>
              </div>

              {c.disponibleHoy && (
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-menta/15 px-2.5 py-1 text-xs font-medium text-[#1f8a76]">
                  ● Disponible hoy
                </span>
              )}

              {c.bio && (
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                  {c.bio}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.services.slice(0, 4).map((s) => (
                  <span key={s} className="chip">
                    {servicioEmoji(s)} {servicioLabel(s)}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-500">Tarifa aprox.</p>
                  <p className="font-bold text-petroleo">
                    {eur(c.hourlyRate)}/h
                  </p>
                </div>
                <button
                  onClick={() => setModal(c)}
                  className="btn-primary text-sm"
                >
                  {c.alreadyContacted ? "Reservar de nuevo" : "Contactar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ContactModal
          cleaner={modal}
          onClose={() => setModal(null)}
          contactInfo={contactInfo}
        />
      )}
    </div>
  );
}

function ContactModal({
  cleaner,
  onClose,
  contactInfo,
}: {
  cleaner: Cleaner;
  onClose: () => void;
  contactInfo: { used: number; limit: number; planName: string };
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("2");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [reviews, setReviews] = useState<
    { id: string; author: string; rating: number; comment: string; createdAt: string }[]
  >([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/reviews?cleanerUserId=${cleaner.userId}`)
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((d) => {
        if (active) {
          setReviews(d.reviews ?? []);
          setReviewsLoaded(true);
        }
      })
      .catch(() => active && setReviewsLoaded(true));
    return () => {
      active = false;
    };
  }, [cleaner.userId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cleanerUserId: cleaner.userId,
        date,
        hours: Number(hours),
        notes,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      if (res.status === 403 && data.error === "limit") {
        setLimitReached(true);
        setError(data.message);
        return;
      }
      setError(data.error ?? "No se pudo crear la reserva.");
      return;
    }
    router.push(`/dashboard/mensajes/${data.bookingId}`);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="card max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={cleaner.name} src={cleaner.photoUrl} size={56} />
            <div className="min-w-0">
              <h3 className="flex items-center gap-1 truncate text-lg font-bold text-petroleo">
                <span className="truncate">{cleaner.name}</span>
                {cleaner.verified && (
                  <span
                    title="Limpiadora verificada por GesLimpia"
                    className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-agua/10 px-1.5 py-0.5 text-[10px] font-semibold text-agua"
                  >
                    ✓ Verificada
                  </span>
                )}
              </h3>
              <p className="truncate text-sm text-slate-500">{cleaner.ciudad}</p>
              <RatingStars value={cleaner.ratingAvg} count={cleaner.ratingCount} />
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400" aria-label="Cerrar">
            ✕
          </button>
        </div>

        {cleaner.bio && (
          <p className="mt-3 text-sm text-slate-600">{cleaner.bio}</p>
        )}

        {/* Reseñas visibles de la limpiadora */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <h4 className="mb-2 text-sm font-semibold text-petroleo">
            Reseñas {cleaner.ratingCount > 0 && `(${cleaner.ratingCount})`}
          </h4>
          {!reviewsLoaded ? (
            <p className="text-sm text-slate-400">Cargando reseñas…</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-slate-400">
              Todavía no tiene reseñas. ¡Sé el primero en valorarla tras una limpieza!
            </p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl bg-espuma/60 p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-petroleo">{r.author}</span>
                    <RatingStars value={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="mt-1 text-slate-600">“{r.comment}”</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString("es-ES")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!cleaner.alreadyContacted && (
          <p className="mt-4 text-xs text-slate-500">
            Plan {contactInfo.planName}: {contactInfo.used}/{contactInfo.limit}{" "}
            limpiadoras contactadas.
          </p>
        )}

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className="label">Día y hora propuestos</label>
            <input
              type="datetime-local"
              required
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Horas estimadas</label>
            <input
              type="number"
              min={1}
              step="0.5"
              className="input max-w-[120px]"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Mensaje</label>
            <textarea
              rows={3}
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cuéntale qué necesitas (tamaño de la casa, tareas…)"
            />
          </div>

          <p className="rounded-lg bg-espuma px-3 py-2 text-xs text-slate-600">
            La tarifa ({eur(cleaner.hourlyRate)}/h) la fija {cleaner.name} y se
            paga directamente a ella. Tu cuota es solo por usar la plataforma.
          </p>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {limitReached ? (
            <button
              type="button"
              onClick={() => router.push("/dashboard/plan")}
              className="btn-secondary w-full"
            >
              Mejorar mi plan
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Enviando…" : "Enviar solicitud y abrir chat"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
