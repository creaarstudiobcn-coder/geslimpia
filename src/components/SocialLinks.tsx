// Enlaces a redes sociales de GesLimpia. Iconos SVG propios (sin dependencias).
// Se usa en el footer compartido → aparece en toda la web.

export const SOCIALS = {
  instagram: "https://www.instagram.com/geslimpia",
  facebook: "https://www.facebook.com/profile.php?id=61591016738119",
};

function IconInstagram() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function SocialLinks() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">Síguenos</h3>
      <div className="mt-3 flex items-center gap-3">
        <a
          href={SOCIALS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Síguenos en Instagram"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#16B6BE] hover:text-white"
        >
          <IconInstagram />
        </a>
        <a
          href={SOCIALS.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Síguenos en Facebook"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#16B6BE] hover:text-white"
        >
          <IconFacebook />
        </a>
      </div>
    </div>
  );
}
