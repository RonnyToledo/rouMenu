/**
 * Servicio para monitorear cambios en el carrito (IndexedDB)
 * y disparar notificaciones locales cuando la página no está visible.
 *
 * NOTA: este monitor solo funciona con el navegador abierto.
 * Para notificaciones con el navegador cerrado usa Web Push
 * (ver usePushNotifications.ts + /api/subscribe-push + cron en el servidor).
 */

import { loadCartFromIDB } from "@/lib/indexedDBCart";
import {
  notifyPendingOrder,
  clearNotificationsByTag,
} from "@/lib/notificationService";

interface CartMonitorConfig {
  shopKey: string;
  shopName: string;
  checkIntervalMs?: number; // default: 5 minutos
  minItemsToNotify?: number; // default: 1
  onlyNotifyWhenHidden?: boolean; // default: true
}

interface CartState {
  lastItemCount: number;
  lastNotificationTime: number;
  notificationCooldownMs: number;
}

const cartStates = new Map<string, CartState>();

/**
 * Inicia el monitoreo del carrito para una tienda.
 * Devuelve una función cleanup para detener el monitoreo.
 */
export async function startCartMonitoring(
  config: CartMonitorConfig,
): Promise<() => void> {
  const {
    shopKey,
    shopName,
    checkIntervalMs = 5 * 60 * 1000,
    minItemsToNotify = 1,
    onlyNotifyWhenHidden = true,
  } = config;

  if (!cartStates.has(shopKey)) {
    cartStates.set(shopKey, {
      lastItemCount: 0,
      lastNotificationTime: 0,
      notificationCooldownMs: 60 * 1000,
    });
  }

  // Verificación inicial inmediata
  await checkCartAndNotify(
    shopKey,
    shopName,
    minItemsToNotify,
    onlyNotifyWhenHidden,
  );

  const intervalId = setInterval(
    () =>
      checkCartAndNotify(
        shopKey,
        shopName,
        minItemsToNotify,
        onlyNotifyWhenHidden,
      ),
    checkIntervalMs,
  );

  return () => {
    clearInterval(intervalId);
    cartStates.delete(shopKey);
  };
}

/**
 * Verifica el carrito actual y envía notificación si corresponde.
 */
async function checkCartAndNotify(
  shopKey: string,
  shopName: string,
  minItemsToNotify: number,
  onlyNotifyWhenHidden: boolean = true,
): Promise<void> {
  try {
    const cartData = await loadCartFromIDB(shopKey);
    const state = cartStates.get(shopKey);

    if (!state) return;

    const currentItemCount = cartData?.products?.length ?? 0;
    const now = Date.now();
    const isPageHidden = typeof document !== "undefined" && document.hidden;
    const shouldNotify = onlyNotifyWhenHidden ? isPageHidden : true;

    if (currentItemCount >= minItemsToNotify && shouldNotify) {
      const cooldownPassed =
        now - state.lastNotificationTime > state.notificationCooldownMs;

      if (state.lastItemCount === 0 || cooldownPassed) {
        await notifyPendingOrder(shopName, currentItemCount, shopKey);
        state.lastNotificationTime = now;
      }
    } else {
      // FIX: usa clearNotificationsByTag con el tag exacto usado al crear
      if (state.lastItemCount > 0) {
        await clearNotificationsByTag(`pending-order-${shopKey}`);
      }
    }

    state.lastItemCount = currentItemCount;
  } catch (error) {
    console.error(`Error monitoreando carrito ${shopKey}:`, error);
  }
}

/**
 * Detiene el monitoreo de todos los carritos activos
 */
export function stopAllCartMonitoring(): void {
  cartStates.clear();
}

/**
 * Estado actual del monitor de un carrito específico
 */
export function getCartMonitorState(shopKey: string): CartState | undefined {
  return cartStates.get(shopKey);
}

/**
 * Lista de shopKeys siendo monitoreados actualmente
 */
export function getMonitoredCarts(): string[] {
  return Array.from(cartStates.keys());
}
