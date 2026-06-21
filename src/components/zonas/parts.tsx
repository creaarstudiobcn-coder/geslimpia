import Link from "next/link";
import type { Faq } from "@/lib/zonas";

// Inserta un bloque JSON-LD (datos estructurados Schema.org).
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Migas de pan visibles + se acompañan de BreadcrumbList JSON-LD desde la página.
export function Breadcrumbs({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  return (
    <nav aria-label="Migas de pan" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={it.href} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i < items.length - 1 ? (
              <Link href={it.href} className="hover:text-agua">
                {it.name}
              </Link>
            ) : (
              <span className="text-petroleo">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// FAQ accesible con <details>. El FAQPage JSON-LD se inserta aparte desde la página.
export function FaqSection({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-100">
      {faqs.map((f) => (
        <details key={f.q} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-petroleo">
            {f.q}
            <span className="shrink-0 text-agua transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

// Lista de barrios/zonas como chips.
export function BarriosList({ barrios }: { barrios: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {barrios.map((b) => (
        <li key={b} className="chip">
          {b}
        </li>
      ))}
    </ul>
  );
}
