/**
 * Service Worker para manejar notificaciones del navegador
 * Este archivo se sirve desde la carpeta public/
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

// ═══════════════════════════════════════════════════════════════════════════════
// Notificationclick — listener ÚNICO (fusión de los dos anteriores)
// ═══════════════════════════════════════════════════════════════════════════════

self.addEventListener("notificationclick", (event) => {
  const { notification, action } = event;
  const data = notification.data || {};

  notification.close();

  // "close" solo cierra, sin navegar
  if (action === "close") return;

  // Determina la URL según acción explícita o acción embebida en data
  let url = data.link || "/";

  switch (action || data.action) {
    case "view-shop-cart": {
      const shopKey = data.shopKey;
      url = shopKey ? `/t/${shopKey}/carrito` : "/";
      break;
    }
    case "view-cart":
      url = "/cart";
      break;
    case "view-promotion":
      url = "/promotions";
      break;
    case "view-order":
      url = "/orders";
      break;
    default:
      if (data.type === "pending-order" && data.shopKey) {
        url = `/t/${data.shopKey}/carrito`;
      }
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});

self.addEventListener("notificationclose", () => {});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("notificationerror", (event) => {
  console.error("[SW] Error en notificación:", event.error);
});

// ═══════════════════════════════════════════════════════════════════════════════
// Web Push — recibe pushes del servidor aunque el navegador esté cerrado
// ═══════════════════════════════════════════════════════════════════════════════

self.addEventListener("push", (event) => {
  if (!event.data) {
    console.warn("[SW] Push recibido sin datos");
    return;
  }

  try {
    // Intentar parsear como JSON
    let data;
    try {
      data = event.data.json();
    } catch {
      // Si no es JSON válido, usar el texto como body
      const text = event.data.text();
      data = {
        title: "Notificación",
        body: text,
      };
    }

    const {
      title = "Notificación",
      body = "",
      icon = "/icon-192x192.png",
      badge = "/badge-72x72.png",
      tag = "notification",
      data: notifData = {},
    } = data;

    const options = {
      body,
      icon,
      badge,
      tag,
      requireInteraction: true,
      data: notifData,
      actions: [
        { action: "open", title: "Abrir" },
        { action: "close", title: "Cerrar" },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("[SW] ❌ Error procesando push:", error.message);
  }
});
