/**
 * Hook personalizado para gestionar notificaciones del navegador
 */

import { useEffect, useRef, useCallback, useState } from "react";
import {
  isNotificationSupported,
  requestNotificationPermission,
  sendNotification,
  NotificationConfig,
  clearNotificationsByTag,
} from "@/lib/notificationService";
import {
  startCartMonitoring,
  stopAllCartMonitoring,
  getMonitoredCarts,
} from "@/services/cartNotificationMonitor";

interface UseNotificationsOptions {
  autoRequest?: boolean;
  enableCartMonitoring?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { autoRequest = true, enableCartMonitoring = true } = options;

  const [isClient, setIsClient] = useState(false);

  const notificationStateRef = useRef({
    isSupported: false,
    isPermitted: false,
    isInitialized: false,
  });

  const [permissionState, setPermissionState] = useState(false);
  const [supportedState, setSupportedState] = useState(false);

  const cleanupFnsRef = useRef<Array<() => void>>([]);

  /**
   * Registra el Service Worker y solicita permiso si corresponde
   */
  const initialize = useCallback(
    async (forceRequestPermission = false) => {
      if (!notificationStateRef.current.isSupported) {
        console.warn("Notificaciones no soportadas en este navegador");
        return;
      }

      try {
        if (
          !notificationStateRef.current.isInitialized &&
          "serviceWorker" in navigator
        ) {
          const registration = await navigator.serviceWorker.register(
            "/sw.js",
            {
              scope: "/",
            },
          );
          console.info("Service Worker registrado:", registration);
          notificationStateRef.current.isInitialized = true;
        }

        if (autoRequest || forceRequestPermission) {
          const perm = await requestNotificationPermission();
          notificationStateRef.current.isPermitted = perm === "granted";
          setPermissionState(perm === "granted");
          console.info("Permiso de notificaciones:", perm);
        }
      } catch (error) {
        console.error("Error inicializando notificaciones:", error);
      }
    },
    [autoRequest],
  );

  /**
   * Activa el monitoreo del carrito de una tienda.
   * Solo dispara notificaciones locales (requiere navegador abierto).
   * Para navegador cerrado usa usePushNotifications + cron en servidor.
   */
  const monitorCart = useCallback(
    (
      shopKey: string,
      shopName: string,
      opts?: {
        checkIntervalMs?: number;
        onlyNotifyWhenHidden?: boolean;
      },
    ) => {
      if (!notificationStateRef.current.isSupported) return;

      startCartMonitoring({
        shopKey,
        shopName,
        checkIntervalMs: opts?.checkIntervalMs ?? 5 * 60 * 1000,
        onlyNotifyWhenHidden: opts?.onlyNotifyWhenHidden ?? true,
      }).then((cleanup) => {
        cleanupFnsRef.current.push(cleanup);
      });
    },
    [],
  );

  /**
   * Envía una notificación personalizada
   */
  const send = useCallback(async (config: NotificationConfig) => {
    if (!notificationStateRef.current.isPermitted) {
      console.warn("Permiso de notificación no concedido");
      return;
    }
    try {
      await sendNotification(config);
    } catch (error) {
      console.error("Error enviando notificación:", error);
    }
  }, []);

  /**
   * Limpia notificaciones cuyo tag empiece con el prefijo dado
   */
  const clearByTag = useCallback(async (tagPrefix: string) => {
    await clearNotificationsByTag(tagPrefix);
  }, []);

  const getState = useCallback(
    () => ({
      ...notificationStateRef.current,
      monitoredCarts: getMonitoredCarts(),
    }),
    [],
  );

  const cleanup = useCallback(() => {
    cleanupFnsRef.current.forEach((fn) => fn());
    cleanupFnsRef.current = [];
    stopAllCartMonitoring();
  }, []);

  useEffect(() => {
    setIsClient(true);

    const supported = isNotificationSupported();
    notificationStateRef.current.isSupported = supported;
    setSupportedState(supported);

    if (!supported) {
      console.warn(
        "Notificaciones no soportadas en este navegador/dispositivo",
      );
      return;
    }

    if (
      "Notification" in window &&
      window.Notification.permission === "granted"
    ) {
      notificationStateRef.current.isPermitted = true;
      setPermissionState(true);
    }

    initialize();

    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

  return {
    initialize,
    monitorCart,
    send,
    // FIX: renombrado de clearByType → clearByTag (más preciso)
    clearByTag,
    getState,
    cleanup,
    isSupported: supportedState,
    isPermitted: permissionState,
  };
}
