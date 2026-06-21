import Link from "next/link";

// Badge de estado genérico (activa/desactivada, verificada, plan, etc.).
export function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "blue" | "amber" | "slate";
}) {
  const tones: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-agua/10 text-agua",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// Tarjeta de KPI para el dashboard resumen.
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-petroleo">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// Encabezado de sección del panel.
export function AdminHeader({
  title,
  subtitle,
  back,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link
          href={back.href}
          className="text-sm text-agua hover:underline"
        >
          ← {back.label}
        </Link>
      )}
      <h1 className="mt-1 text-2xl font-bold text-petroleo">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

// Traduce el estado de una suscripción/reserva a un Badge con color.
export function statusTone(
  status: string
): "green" | "red" | "amber" | "slate" | "blue" {
  switch (status) {
    case "ACTIVA":
    case "ACEPTADA":
    case "COMPLETADA":
      return "green";
    case "CANCELADA":
    case "RECHAZADA":
      return "red";
    case "PENDIENTE":
      return "amber";
    default:
      return "slate";
  }
}
