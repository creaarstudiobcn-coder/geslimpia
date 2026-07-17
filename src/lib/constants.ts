// Constantes compartidas de GesLimpia

// Versión vigente de los textos legales (ver la cabecera de
// src/content/legal/privacidad.md). Se guarda junto al consentimiento porque el
// RGPD exige poder demostrar qué texto concreto aceptó cada persona, no solo que
// aceptó algo. Al publicar una versión nueva de la política, súbela aquí también.
export const LEGAL_VERSION = "1.0";

export const POBLACIONES = [
  "Mataró",
  "Argentona",
  "Premià de Mar",
  "Vilassar de Mar",
  "Arenys de Mar",
  "Cabrera de Mar",
  "El Masnou",
  "Caldes d'Estrac",
  "Otra del Maresme",
] as const;

export const SERVICIOS = [
  { id: "hogar", label: "Limpieza del hogar", emoji: "🏠" },
  { id: "cristales", label: "Cristales", emoji: "🪟" },
  { id: "planchado", label: "Planchado", emoji: "👔" },
  { id: "fondo", label: "Limpieza a fondo", emoji: "✨" },
  { id: "oficinas", label: "Oficinas", emoji: "🏢" },
  { id: "mascotas", label: "Casas con mascotas", emoji: "🐾" },
  { id: "mudanzas", label: "Mudanzas", emoji: "📦" },
] as const;

export type ServicioId = (typeof SERVICIOS)[number]["id"];

export function servicioLabel(id: string): string {
  return SERVICIOS.find((s) => s.id === id)?.label ?? id;
}

export function servicioEmoji(id: string): string {
  return SERVICIOS.find((s) => s.id === id)?.emoji ?? "🧽";
}

export type PlanId = "BASICO" | "COMPLETO";

export const PLANES: Record<
  PlanId,
  {
    id: PlanId;
    nombre: string;
    precio: number;
    precioLabel: string;
    contactos: number;
    destacado: boolean;
    features: string[];
  }
> = {
  BASICO: {
    id: "BASICO",
    nombre: "Básico",
    precio: 29.99,
    precioLabel: "29,99 €",
    contactos: 3,
    destacado: false,
    features: [
      "Contacta hasta 3 limpiadoras nuevas cada mes",
      "Reservas ilimitadas",
      "Mensajería directa",
      "Sin permanencia",
    ],
  },
  COMPLETO: {
    id: "COMPLETO",
    nombre: "Completo",
    precio: 69.0,
    precioLabel: "69,00 €",
    contactos: 10,
    destacado: true,
    features: [
      "Contacta hasta 10 limpiadoras nuevas cada mes",
      "Reservas ilimitadas",
      "Mensajería directa",
      "Soporte prioritario",
      "Sin permanencia",
    ],
  },
};

// Helpers para listas guardadas como JSON string en SQLite
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function stringifyList(value: string[]): string {
  return JSON.stringify(value ?? []);
}

export function eur(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}
