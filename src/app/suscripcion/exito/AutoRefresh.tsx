"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Mientras el pago se confirma, vuelve a pedir la página cada pocos segundos
// para que aparezca "activada" en cuanto llegue el webhook. Con tope: si Stripe
// tarda más de lo normal, no nos quedamos refrescando para siempre.
const CADA_MS = 4000;
const INTENTOS = 15;

export default function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      if (n > INTENTOS) {
        clearInterval(t);
        return;
      }
      router.refresh();
    }, CADA_MS);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
