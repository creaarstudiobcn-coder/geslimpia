import Link from "next/link";

export default function Logo({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const textColor = light ? "text-white" : "text-petroleo";
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      {/* Gota de agua estilizada */}
      <span className="grid h-9 w-9 place-items-center">
        <svg
          viewBox="0 0 24 24"
          className="h-9 w-9"
          aria-hidden="true"
          fill="none"
        >
          <path
            d="M12 2.5C12 2.5 5 10 5 14.5a7 7 0 1 0 14 0C19 10 12 2.5 12 2.5Z"
            fill="url(#dropGrad)"
          />
          <path
            d="M9.2 13.4c.2 1.9 1.5 3.2 3.4 3.5"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="dropGrad" x1="5" y1="2.5" x2="19" y2="21.5">
              <stop stopColor="#2FC4A8" />
              <stop offset="1" stopColor="#129BC9" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className={`text-xl font-bold tracking-tight ${textColor}`}>
        Ges<span className="text-agua">Limpia</span>
      </span>
    </Link>
  );
}
