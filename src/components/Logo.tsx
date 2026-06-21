import Link from "next/link";

// Logo de GesLimpia: isotipo de gota (degradado turquesa #16B6BE) + wordmark
// "GesLimpia", servido como SVG horizontal desde public/icons.
//   · logo.svg        → texto oscuro, para fondos claros (header, cards, dashboard).
//   · logo-light.svg  → texto blanco, para fondos oscuros (footer petróleo).
export default function Logo({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const src = light ? "/icons/logo-light.svg" : "/icons/logo.svg";
  return (
    <Link
      href="/"
      className={`inline-flex items-center ${className}`}
      aria-label="GesLimpia — Inicio"
    >
      {/* SVG con el wordmark incluido. width/height fijan el ratio (evita CLS);
          la altura real la marca la clase h-9 y el ancho es automático. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="GesLimpia"
        width={300}
        height={72}
        className="h-9 w-auto"
      />
    </Link>
  );
}
