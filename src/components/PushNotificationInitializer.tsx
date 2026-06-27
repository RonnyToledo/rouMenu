"use client";

/**
 * Componente para inicializar Web Push Notifications.
 * Debe colocarse en el layout de cada tienda (/t/[shop]/layout.tsx).
 * NO renderiza nada — solo configura el sistema en background.
 */

import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface PushInitializerProps {
  shopKey?: string; // Clave de tienda — permite suscripciones anónimas por tienda
  autoRequest?: boolean;
  debug?: boolean;
}

export function PushNotificationInitializer({
  shopKey,
  autoRequest = false,
  debug = false,
}: PushInitializerProps) {
  const [mounted, setMounted] = useState(false);

  const { isClient, supported, permission, isSubscribed } =
    usePushNotifications({
      shopKey, // FIX: se pasa el shopKey para asociar suscripción anónima
      autoRequest,
      debug,
    });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isClient) return;

    if (!supported) {
      if (debug) {
        console.info(
          "Web Push Notifications no soportadas en este dispositivo",
        );
      }
      return;
    }

    if (debug) {
      console.info("Sistema de Web Push inicializado");
      console.info(`  - Permiso: ${permission}`);
      console.info(`  - Suscrito: ${isSubscribed ? "Sí" : "No"}`);
      console.info(`  - ShopKey: ${shopKey ?? "no especificado"}`);
    }
  }, [isClient, supported, permission, isSubscribed, mounted, debug, shopKey]);

  return null;
}

export { usePushNotifications } from "@/hooks/usePushNotifications";
