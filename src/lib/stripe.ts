import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

// Cliente Stripe. Si no hay clave configurada (entorno de demo sin Stripe),
// exportamos null y el flujo de suscripción usa el modo simulado.
export const stripe = key
  ? new Stripe(key, { apiVersion: "2024-06-20" })
  : null;

export const stripeConfigured =
  !!key &&
  !key.includes("placeholder") &&
  !!process.env.STRIPE_PRICE_BASICO &&
  !process.env.STRIPE_PRICE_BASICO.includes("placeholder");

export function priceIdForPlan(plan: "BASICO" | "COMPLETO"): string | undefined {
  return plan === "BASICO"
    ? process.env.STRIPE_PRICE_BASICO
    : process.env.STRIPE_PRICE_COMPLETO;
}
