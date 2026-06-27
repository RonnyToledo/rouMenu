"use client";

/**
 * Componente que activa el monitoreo local del carrito para la tienda actual.
 *
 * ALCANCE: solo funciona mientras el navegador está abierto.
 * Las notificaciones solo se envían cuando la página NO está visible.
 *
 * Para notificaciones con el navegador cerrado, combinar con
 * PushNotificationInitializer + cron en el servidor.
 */

import { useNotifications } from "@/hooks/useNotifications";
import { useEffect, useState } from "react";

interface ShopCartMonitorProps {
  shopKey: string;
  shopName: string;
  autoMonitor?: boolean;
  onlyNotifyWhenHidden?: boolean;
}

/**
 * Uso en /t/[shop]/layout.tsx:
 *
 * <ShopCartMonitor
 *   shopKey={shop}
 *   shopName={storeOne.name}
 *   autoMonitor={true}
 *   onlyNotifyWhenHidden={true}
 * />
 */
export function ShopCartMonitor({
  shopKey,
  shopName,
  autoMonitor = true,
  onlyNotifyWhenHidden = true,
}: ShopCartMonitorProps) {
  const { monitorCart, isSupported, isPermitted } = useNotifications({
    enableCartMonitoring: true,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      console.info(
        document.hidden
          ? `Página oculta — monitoreo activo: ${shopName}`
          : `Página visible — notificaciones pausadas: ${shopName}`,
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [shopName]);

  useEffect(() => {
    if (!autoMonitor || !isSupported || !isPermitted) return;

    monitorCart(shopKey, shopName, { onlyNotifyWhenHidden });
    setIsMonitoring(true);
  }, [
    isSupported,
    isPermitted,
    shopKey,
    shopName,
    autoMonitor,
    monitorCart,
    onlyNotifyWhenHidden,
  ]);

  return null;
}

export default ShopCartMonitor;
