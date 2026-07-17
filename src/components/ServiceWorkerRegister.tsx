"use client";

import { useEffect } from "react";

// Registra el service worker (/sw.js) una vez montada la app en el cliente.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Cuando un service worker nuevo toma el control (tras un deploy), recargamos
    // una vez para que la pestaña abierta deje de ejecutar el JavaScript viejo.
    // El flag evita un bucle de recargas.
    let recargando = false;
    const onControllerChange = () => {
      if (recargando) return;
      recargando = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registro fallido: la app sigue funcionando sin offline */
      });
    };
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  return null;
}
