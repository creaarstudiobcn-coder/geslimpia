/* Service worker mínimo y robusto para GesLimpia (PWA instalable + offline básico). */
// IMPORTANTE: sube este número en cada cambio de estrategia de caché. El handler
// `activate` borra toda caché cuyo nombre no coincida, así que al cambiarlo se
// purgan los assets viejos y ningún navegador se queda pegado a un build anterior.
const CACHE = "geslimpia-v3";
// Assets que precacheamos para que la landing funcione offline.
const PRECACHE = ["/", "/offline", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // addAll falla si algún recurso no responde 200; lo hacemos tolerante.
      .then((cache) => Promise.allSettled(PRECACHE.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Solo gestionamos GET del mismo origen. El resto (POST de auth, APIs, terceros) pasa directo.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // NETWORK-FIRST para TODO (documentos y estáticos): los usuarios conectados
  // reciben SIEMPRE la última versión desplegada. La caché es solo una red de
  // seguridad para uso offline. Con cache-first, un navegador podía quedarse
  // ejecutando JavaScript viejo tras un deploy y los botones dejaban de
  // responder; network-first lo elimina de raíz.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") return caches.match("/offline");
          return Response.error();
        })
      )
  );
});
