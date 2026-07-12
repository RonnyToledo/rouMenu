/**
 * Hook para gestionar Web Push Notifications.
 * Permite recibir notificaciones incluso con el navegador cerrado,
 * sin requerir que el usuario esté autenticado.
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface PushOptions {
  shopKey?: string; // Clave de tienda para asociar la suscripción
  autoRequest?: boolean;
  debug?: boolean;
}

export function usePushNotifications(options: PushOptions = {}) {
  const { shopKey, autoRequest = false, debug = false } = options;

  const [isClient, setIsClient] = useState(false);
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const logRef = useRef((msg: string, data?: unknown) => {});
  const log = logRef.current;

  /**
   * Convierte clave VAPID base64url → Uint8Array
   */
  const urlBase64ToUint8Array = (base64String: string): ArrayBuffer => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const output = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      output[i] = rawData.charCodeAt(i);
    }
    return output.buffer;
  };

  const checkSupport = (): boolean =>
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  /**
   * Solicita permiso y suscribe si se concede
   */
  const requestPermission = async (): Promise<NotificationPermission> => {
    log("Solicitando permiso...");
    try {
      const result = await Notification.requestPermission();
      log("Permiso:", result);
      setPermission(result);
      if (result === "granted") {
        await subscribeToPush();
      }
      return result;
    } catch (error) {
      log("Error solicitando permiso:", error);
      return "denied";
    }
  };

  /**
   * Suscribe al usuario a Web Push y guarda la suscripción en el servidor.
   *
   * FIX: lee Notification.permission directamente de la API en lugar de
   * depender del estado React (que puede estar desactualizado en el closure).
   */
  const subscribeToPush = useCallback(async (): Promise<void> => {
    if (!supported) {
      log("Web Push no soportado");
      return;
    }

    // FIX: lectura directa, no del estado
    if (Notification.permission !== "granted") {
      log("Permiso no concedido");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      log("Service Worker listo");

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY no está configurada");
          return;
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        log("Suscripción creada");
      } else {
        log("Ya estaba suscrito");
      }

      // Envía la suscripción al servidor junto con el shopKey (sin auth requerida)
      const response = await fetch("/api/subscribe-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // shopKey permite notificar a usuarios anónimos por tienda
          ...(shopKey ? { "x-shop-key": shopKey } : {}),
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      log("Suscripción guardada en servidor");
      setIsSubscribed(true);
    } catch (error) {
      log("Error en suscripción:", error);
      throw error;
    }
    // FIX: eliminado `permission` de las dependencias — se lee directamente de la API
  }, [supported, shopKey, log]);

  /**
   * Cancela la suscripción Web Push
   */
  const unsubscribeFromPush = async (): Promise<void> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        await fetch("/api/unsubscribe-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });

        log("Desuscrito de Web Push");
        setIsSubscribed(false);
      }
    } catch (error) {
      log("Error desuscribiendo:", error);
      throw error;
    }
  };

  useEffect(() => {
    setIsClient(true);

    const isSupported = checkSupport();
    setSupported(isSupported);

    if (!isSupported) {
      console.warn("Web Push Notifications no soportadas en este navegador");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        log("Service Worker registrado");

        registration.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
          if (sub) log("Ya estaba suscrito a Web Push");
        });
      })
      .catch((error) => log("Error registrando Service Worker:", error));

    if ("Notification" in window) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);

      if (currentPermission === "granted" && autoRequest) {
        subscribeToPush().catch((error) =>
          log("Error auto-suscribiendo:", error),
        );
      }
    }
  }, [autoRequest, log, subscribeToPush]);

  return {
    isClient,
    supported,
    permission,
    isSubscribed,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    checkSupport,
  };
}
