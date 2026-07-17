"use client";

import Link from "next/link";

// Casilla de consentimiento para las altas (formulario de email y onboarding de
// Google). Sin marcar por defecto: el RGPD exige un acto afirmativo, y una
// casilla premarcada no vale como consentimiento.
export default function ConsentCheckbox({
  checked,
  onChange,
  id = "consent",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  id?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={id}
        type="checkbox"
        required
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-agua focus:ring-agua"
      />
      <label htmlFor={id} className="text-sm leading-relaxed text-slate-600">
        He leído y acepto la{" "}
        <Link
          href="/privacidad"
          target="_blank"
          className="font-medium text-agua underline underline-offset-2"
        >
          Política de Privacidad
        </Link>{" "}
        y los{" "}
        <Link
          href="/terminos"
          target="_blank"
          className="font-medium text-agua underline underline-offset-2"
        >
          Términos de uso
        </Link>
        . Tus datos los trata Dependalium Global Services, S.L. para gestionar tu
        cuenta y ponerte en contacto con limpiadoras. Puedes ejercer tus derechos
        de acceso, rectificación y supresión escribiendo a{" "}
        <a
          href="mailto:info@dependalium.com"
          className="font-medium text-agua underline underline-offset-2"
        >
          info@dependalium.com
        </a>
        .
      </label>
    </div>
  );
}
