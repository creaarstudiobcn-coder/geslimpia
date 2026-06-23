// Emails transaccionales de GesLimpia mediante Resend (API HTTP).
//
// Diseño robusto:
//   · Si RESEND_API_KEY no está configurada, todas las funciones son "no-op":
//     no envían nada y registran un aviso, pero NUNCA lanzan ni rompen la acción
//     principal (registro, reserva, pago…).
//   · Cualquier fallo de red/Resend se captura y se loguea; el caller no se entera.
//
// Variables de entorno:
//   · RESEND_API_KEY  — clave de API de Resend (https://resend.com/api-keys)
//   · EMAIL_FROM      — remitente, p. ej. "GesLimpia <hola@geslimpia.es>"
//                       (el dominio debe estar verificado en Resend)

import { SITE_URL } from "@/lib/site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const BRAND = "#16B6BE";
const FROM = process.env.EMAIL_FROM || "GesLimpia <hola@geslimpia.es>";

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

// --- Envío de bajo nivel -----------------------------------------------------

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

/**
 * Envía un email. Devuelve true si se entregó a Resend, false si no se envió
 * (sin configurar o error). NUNCA lanza: la acción principal nunca debe fallar
 * por culpa de un email.
 */
async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY no configurada — email omitido: "${subject}" -> ${to}`);
    return false;
  }
  if (!to || !to.includes("@")) {
    console.warn(`[email] destinatario inválido — email omitido: "${subject}"`);
    return false;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] Resend respondió ${res.status} para "${subject}": ${detail}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] error enviando "${subject}":`, err);
    return false;
  }
}

// --- Plantilla base ----------------------------------------------------------

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Layout = {
  heading: string;
  intro: string;
  bodyHtml?: string;
  ctaLabel?: string;
  ctaPath?: string; // ruta relativa, se convierte en URL absoluta www
};

function layout({ heading, intro, bodyHtml = "", ctaLabel, ctaPath }: Layout): string {
  const cta =
    ctaLabel && ctaPath
      ? `<tr><td style="padding:8px 0 4px;">
           <a href="${SITE_URL}${ctaPath}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px;font-size:15px;">${escapeHtml(
          ctaLabel
        )}</a>
         </td></tr>`
      : "";

  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#f4f6f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2933;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f7;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6eaec;">
        <tr><td style="background:${BRAND};padding:20px 28px;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">GesLimpia</span>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 12px;font-size:21px;line-height:1.3;color:#0f2b2d;">${escapeHtml(heading)}</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3b4a52;">${intro}</p>
          ${bodyHtml}
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td>${cta}</td></tr></table>
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #eef1f2;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#8a979e;">
            GesLimpia · Conectamos hogares con limpiadoras de confianza en el Maresme.<br/>
            <a href="${SITE_URL}" style="color:${BRAND};text-decoration:none;">www.geslimpia.es</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function infoBox(rows: Array<[string, string]>): string {
  const items = rows
    .map(
      ([k, v]) =>
        `<tr>
           <td style="padding:6px 0;font-size:13px;color:#8a979e;width:38%;">${escapeHtml(k)}</td>
           <td style="padding:6px 0;font-size:14px;color:#1f2933;font-weight:600;">${escapeHtml(v)}</td>
         </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafa;border:1px solid #e7eef0;border-radius:12px;padding:8px 16px;margin:0 0 18px;">${items}</table>`;
}

// --- Emails transaccionales --------------------------------------------------

/** 1. Bienvenida al registrarse (variante hogar / limpiadora). */
export async function sendWelcomeEmail(args: {
  to: string;
  name: string;
  role: "HOGAR" | "LIMPIADORA";
}): Promise<boolean> {
  const nombre = args.name?.trim() || "¡Hola!";
  if (args.role === "LIMPIADORA") {
    return sendEmail({
      to: args.to,
      subject: "Bienvenida a GesLimpia 🧽",
      html: layout({
        heading: `Bienvenida, ${escapeHtml(nombre)}`,
        intro:
          "Tu cuenta de limpiadora ya está creada. Completa tu perfil (foto, zonas, servicios y disponibilidad) para que los hogares de tu zona puedan encontrarte y contactarte.",
        bodyHtml:
          '<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3b4a52;">Cuanto más completo esté tu perfil, más solicitudes recibirás. Aparecer en GesLimpia es <strong>gratis</strong>.</p>',
        ctaLabel: "Completar mi perfil",
        ctaPath: "/dashboard/perfil",
      }),
    });
  }
  return sendEmail({
    to: args.to,
    subject: "Bienvenido a GesLimpia 🏠",
    html: layout({
      heading: `Bienvenido, ${escapeHtml(nombre)}`,
      intro:
        "Tu cuenta ya está lista. Explora las limpiadoras de confianza de tu zona, contacta con las que más te encajen y organiza tu limpieza sin complicaciones.",
      ctaLabel: "Ver limpiadoras",
      ctaPath: "/dashboard",
    }),
  });
}

/** 2. Aviso a la limpiadora cuando un hogar la contacta (el más importante). */
export async function sendNewContactEmail(args: {
  to: string;
  cleanerName: string;
  homeName: string;
  date?: Date;
  hours?: number;
  notes?: string;
}): Promise<boolean> {
  const fecha = args.date
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "full" }).format(args.date)
    : "Por concretar";
  const rows: Array<[string, string]> = [
    ["Familia", args.homeName || "Un hogar"],
    ["Fecha propuesta", fecha],
  ];
  if (args.hours) rows.push(["Horas", `${args.hours} h`]);

  const notesHtml = args.notes
    ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#3b4a52;"><strong>Mensaje:</strong><br/>“${escapeHtml(
        args.notes
      )}”</p>`
    : "";

  const cleaner = args.cleanerName?.trim();
  return sendEmail({
    to: args.to,
    subject: "📩 Una familia te ha contactado en GesLimpia",
    html: layout({
      heading: cleaner ? `Tienes una nueva solicitud, ${escapeHtml(cleaner)}` : "Tienes una nueva solicitud",
      intro:
        "Una familia está interesada en tus servicios. Entra en tu panel para ver los detalles y responder cuanto antes — la rapidez marca la diferencia.",
      bodyHtml: infoBox(rows) + notesHtml,
      ctaLabel: "Ver la solicitud",
      ctaPath: "/dashboard/reservas",
    }),
  });
}

/** 3. Aviso al hogar cuando la limpiadora acepta su solicitud. */
export async function sendBookingAcceptedEmail(args: {
  to: string;
  homeName: string;
  cleanerName: string;
}): Promise<boolean> {
  return sendEmail({
    to: args.to,
    subject: "✅ Tu solicitud ha sido aceptada",
    html: layout({
      heading: "¡Buenas noticias!",
      intro: `${escapeHtml(
        args.cleanerName || "La limpiadora"
      )} ha aceptado tu solicitud. Ya podéis poneros de acuerdo en los detalles a través del chat de GesLimpia.`,
      ctaLabel: "Abrir el chat",
      ctaPath: "/dashboard/mensajes",
    }),
  });
}

/** 4. Recibo / confirmación de suscripción (tras checkout.session.completed). */
export async function sendSubscriptionReceiptEmail(args: {
  to: string;
  name: string;
  planName: string;
  priceLabel: string;
  contactos: number;
}): Promise<boolean> {
  const nombre = args.name?.trim();
  const saludo = nombre ? `Gracias, ${escapeHtml(nombre)}.` : "Gracias.";
  return sendEmail({
    to: args.to,
    subject: "Tu suscripción a GesLimpia está activa ✔",
    html: layout({
      heading: "Suscripción activada",
      intro: `${saludo} Tu plan ya está activo y puedes empezar a contactar limpiadoras.`,
      bodyHtml: infoBox([
        ["Plan", args.planName],
        ["Importe", args.priceLabel],
        ["Contactos incluidos", String(args.contactos)],
      ]),
      ctaLabel: "Ir a mi panel",
      ctaPath: "/dashboard",
    }),
  });
}

/** 5. Aviso de nueva reseña a la limpiadora. */
export async function sendNewReviewEmail(args: {
  to: string;
  cleanerName: string;
  rating: number;
  comment?: string;
  homeName?: string;
}): Promise<boolean> {
  const stars = "★".repeat(args.rating) + "☆".repeat(Math.max(0, 5 - args.rating));
  const commentHtml = args.comment
    ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#3b4a52;">“${escapeHtml(
        args.comment
      )}”</p>`
    : "";
  return sendEmail({
    to: args.to,
    subject: "⭐ Has recibido una nueva valoración",
    html: layout({
      heading: "Nueva valoración",
      intro: `${escapeHtml(
        args.homeName || "Una familia"
      )} te ha valorado en GesLimpia. ¡Las buenas reseñas te ayudan a conseguir más clientes!`,
      bodyHtml:
        `<p style="margin:0 0 8px;font-size:24px;letter-spacing:2px;color:${BRAND};">${stars}</p>` +
        commentHtml,
      ctaLabel: "Ver mis valoraciones",
      ctaPath: "/dashboard/valoraciones",
    }),
  });
}
