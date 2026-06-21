"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { GA_ID } from "@/lib/cookies";

// Envía un page_view en cada navegación de cliente (SPA). La primera vista la envía
// gtag('config') al cargarse; aquí solo cubrimos los cambios de ruta posteriores.
// Solo actúa si GA está cargado (window.gtag), es decir, si el usuario aceptó analíticas.
export default function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!GA_ID || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
