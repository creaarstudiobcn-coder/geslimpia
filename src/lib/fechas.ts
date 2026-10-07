// Formato de fechas y horas de la plataforma.
//
// Todas las fechas que se enseñan pasan por aquí, con zona horaria FIJA. El
// servidor (Vercel) corre en UTC y el navegador en la hora de cada persona: si
// cada uno formatea con la suya, una limpieza a las 10:00 salía a las 8:00 en el
// panel (y a las 10:00 en el navegador), y React daba error de hidratación porque
// el HTML del servidor y el del cliente no coincidían. El servicio es en el
// Maresme, así que la hora que vale es siempre la de Madrid.
export const ZONA_HORARIA = "Europe/Madrid";
const LOCALE = "es-ES";

type Fecha = Date | string | number;

function formatear(fecha: Fecha, opciones: Intl.DateTimeFormatOptions): string {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(LOCALE, {
    ...opciones,
    timeZone: ZONA_HORARIA,
  }).format(d);
}

/** 7 oct 2026, 10:00 */
export function fechaHora(fecha: Fecha): string {
  return formatear(fecha, { dateStyle: "medium", timeStyle: "short" });
}

/** 7/10/2026 */
export function fechaCorta(fecha: Fecha): string {
  return formatear(fecha, { day: "numeric", month: "numeric", year: "numeric" });
}

/** 07 oct 2026 */
export function fechaMedia(fecha: Fecha): string {
  return formatear(fecha, { day: "2-digit", month: "short", year: "numeric" });
}

/** 7 de octubre de 2026 */
export function fechaLarga(fecha: Fecha): string {
  return formatear(fecha, { dateStyle: "long" });
}

/** 7 de octubre */
export function diaYMes(fecha: Fecha): string {
  return formatear(fecha, { day: "numeric", month: "long" });
}

/** miércoles, 7 de octubre de 2026, 10:00 */
export function fechaHoraCompleta(fecha: Fecha): string {
  return formatear(fecha, { dateStyle: "full", timeStyle: "short" });
}

/** 10:00 */
export function hora(fecha: Fecha): string {
  return formatear(fecha, { hour: "2-digit", minute: "2-digit" });
}

/** 07/10, 10:00 */
export function diaMesHora(fecha: Fecha): string {
  return formatear(fecha, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Valor para el atributo `min` de un <input type="datetime-local">: el momento
// actual en la hora LOCAL del navegador ("2026-10-07T18:30"). Solo tiene sentido
// en el cliente (el servidor no sabe la hora local de quien mira).
export function ahoraParaInputLocal(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
