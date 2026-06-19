export function RatingStars({
  value,
  count,
}: {
  value: number;
  count?: number;
}) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1 text-sm text-amber-500">
      <span aria-hidden>
        {"★".repeat(full)}
        <span className="text-slate-300">{"★".repeat(5 - full)}</span>
      </span>
      <span className="text-slate-500">
        {value > 0 ? value.toFixed(1) : "Nueva"}
        {typeof count === "number" && count > 0 ? ` (${count})` : ""}
      </span>
    </span>
  );
}

export function Avatar({
  name,
  src,
  size = 48,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="grid place-items-center rounded-full bg-agua/15 font-bold text-agua"
      style={{ width: size, height: size, fontSize: size / 2.4 }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  ACEPTADA: "bg-menta/20 text-[#1f8a76]",
  RECHAZADA: "bg-red-100 text-red-600",
  COMPLETADA: "bg-slate-200 text-slate-600",
};

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  COMPLETADA: "Completada",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-petroleo">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="card grid place-items-center px-6 py-14 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="mt-3 font-semibold text-petroleo">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
    </div>
  );
}
