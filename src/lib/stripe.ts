import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

// Cliente Stripe. Si no hay clave configurada (entorno de demo sin Stripe),
// exportamos null y el flujo de suscripción usa el modo simulado.
export const stripe = key
  ? new Stripe(key, { apiVersion: "2024-06-20" })
  : null;

function isSet(value: string | undefined): boolean {
  return !!value && !value.includes("placeholder");
}

export const stripeConfigured =
  isSet(key) &&
  isSet(process.env.STRIPE_PRICE_BASICO) &&
  isSet(process.env.STRIPE_PRICE_COMPLETO);

// El modo demo activa suscripciones sin cobrar, así que solo puede existir
// fuera de producción: si en producción falta configuración de Stripe, el flujo
// de pago tiene que fallar en vez de regalar el acceso.
export const demoMode =
  !stripeConfigured && process.env.NODE_ENV !== "production";

export function priceIdForPlan(plan: "BASICO" | "COMPLETO"): string | undefined {
  return plan === "BASICO"
    ? process.env.STRIPE_PRICE_BASICO
    : process.env.STRIPE_PRICE_COMPLETO;
}

// Inverso de priceIdForPlan: lo usa el webhook para reflejar en la plataforma
// el plan que realmente está pagando el cliente en Stripe.
export function planForPriceId(
  priceId: string | null | undefined
): "BASICO" | "COMPLETO" | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_BASICO) return "BASICO";
  if (priceId === process.env.STRIPE_PRICE_COMPLETO) return "COMPLETO";
  return null;
}
