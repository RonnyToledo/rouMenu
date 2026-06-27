"use client";

/**
 * Componente que inicializa el sistema de notificaciones.
 * Se coloca en el layout raíz de la aplicación.
 * Este componente NO renderiza nada.
 */

import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationInitializerProps {
  autoRequestPermission?: boolean;
  enableAutoMonitoring?: boolean;
}

export function NotificationInitializer({
  autoRequestPermission = false,
  enableAutoMonitoring = true,
}: NotificationInitializerProps) {
  const [mounted, setMounted] = useState(false);
  const { initialize, isSupported } = useNotifications({
    autoRequest: autoRequestPermission,
    enableCartMonitoring: enableAutoMonitoring,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isSupported) {
      console.info(
        "Notificaciones del navegador no soportadas en este dispositivo",
      );
      return;
    }

    console.info("Sistema de notificaciones inicializado correctamente");
  }, [isSupported, mounted]);

  return null;
}

export { useNotifications } from "@/hooks/useNotifications";
