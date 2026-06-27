"use client";

/**
 * Wrapper para agregar el sistema de notificaciones al layout.
 * Debe ser client-side ya que maneja hooks.
 */

import { NotificationInitializer } from "@/components/NotificationInitializer";

export function NotificationWrapper({
  autoRequestPermission = false,
  enableAutoMonitoring = true,
}: {
  autoRequestPermission?: boolean;
  enableAutoMonitoring?: boolean;
}) {
  return (
    <NotificationInitializer
      autoRequestPermission={autoRequestPermission}
      enableAutoMonitoring={enableAutoMonitoring}
    />
  );
}

export default NotificationWrapper;
