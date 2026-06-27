/**
 * Sistema escalable de notificaciones del navegador
 * Soporta múltiples tipos de notificaciones y eventos
 */

import { logoApp } from "./image";
import { supabase } from "./supabase";

export type NotificationType =
  | "pending-order"
  | "order-confirmed"
  | "order-ready"
  | "promotion"
  | "reminder"
  | "custom";

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, string | number | boolean | undefined>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Verifica si el navegador soporta notificaciones
 */
export function isNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator === "undefined") return false;

  return (
    typeof Notification !== "undefined" &&
    "serviceWorker" in navigator &&
    "Notification" in window
  );
}

/**
 * Solicita permiso al usuario para enviar notificaciones
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn("Notificaciones no soportadas en este navegador");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    return await Notification.requestPermission();
  }

  return "denied";
}

/**
 * Envía una notificación del navegador.
 * Usa Service Worker si está disponible, sino usa la API nativa.
 */
export async function sendNotification(
  config: NotificationConfig,
  useServiceWorker: boolean = true,
): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn("No se puede enviar notificación: navegador no soportado");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Permiso de notificación no concedido");
    return;
  }

  try {
    if (useServiceWorker) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(config.title, {
        body: config.body,
        icon: config.icon || logoApp,
        badge: config.badge,
        tag: config.tag || config.type,
        requireInteraction: config.requireInteraction ?? false,
        data: {
          ...config.data,
          type: config.type,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      new Notification(config.title, {
        body: config.body,
        icon: config.icon || logoApp,
        badge: config.badge,
        tag: config.tag || config.type,
        requireInteraction: config.requireInteraction ?? false,
      });
    }
  } catch (error) {
    console.error("Error enviando notificación:", error);
  }
}

/**
 * Notificación especializada para pedidos pendientes
 */
export async function notifyPendingOrder(
  shopName: string,
  itemCount: number,
  shopKey?: string,
): Promise<void> {
  const { data: tienda, error } = await supabase
    .from("Sitios")
    .select("urlPoster")
    .eq("sitioweb", shopKey)
    .single();

  if (error) {
    console.error(`Error obteniendo datos de la tienda ${shopKey}:`, error);
  }

  await sendNotification({
    type: "pending-order",
    title: `Pedido Pendiente en ${shopName}`,
    body: `Tienes ${itemCount} artículo${itemCount !== 1 ? "s" : ""} en tu carrito. ¡Completa tu pedido!`,
    icon: tienda?.urlPoster || logoApp,
    // FIX: el tag incluye shopKey para ser único por tienda
    tag: `pending-order-${shopKey}`,
    requireInteraction: true,
    data: {
      shopKey,
      itemCount,
      action: "view-shop-cart",
    },
  });
}

/**
 * Notificación para promociones
 */
export async function notifyPromotion(
  promotionTitle: string,
  description: string,
): Promise<void> {
  await sendNotification({
    type: "promotion",
    title: promotionTitle,
    body: description,
    icon: logoApp,
    tag: "promotion",
    data: {
      action: "view-promotion",
    },
  });
}

/**
 * Notificación personalizada
 */
export async function notifyCustom(
  type: NotificationType,
  title: string,
  body: string,
  customConfig?: Partial<NotificationConfig>,
): Promise<void> {
  await sendNotification({
    type,
    title,
    body,
    ...customConfig,
  });
}

/**
 * Limpia todas las notificaciones activas
 */
export async function clearAllNotifications(): Promise<void> {
  if (!isNotificationSupported()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();
    notifications.forEach((n) => n.close());
  } catch (error) {
    console.error("Error limpiando notificaciones:", error);
  }
}

/**
 * Limpia notificaciones cuyo tag comience con el prefijo dado.
 *
 * FIX: la API getNotifications({ tag }) hace match exacto, por lo que
 * "pending-order" nunca encontraba "pending-order-cafe-123".
 * Ahora iteramos todas y filtramos por startsWith.
 */
export async function clearNotificationsByTag(
  tagPrefix: string,
): Promise<void> {
  if (!isNotificationSupported()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const all = await registration.getNotifications();
    all.filter((n) => n.tag.startsWith(tagPrefix)).forEach((n) => n.close());
  } catch (error) {
    console.error("Error limpiando notificaciones por tag:", error);
  }
}

/**
 * @deprecated Usa clearNotificationsByTag() que hace match correcto por prefijo.
 * Mantenida por compatibilidad con código existente.
 */
export async function clearNotificationsByType(
  type: NotificationType,
): Promise<void> {
  return clearNotificationsByTag(type);
}
