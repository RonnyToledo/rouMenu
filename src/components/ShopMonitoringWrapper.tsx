/**
 * Wrapper para agregar monitoreo de carrito en /t/[shop].
 * Combina monitoreo local (navegador abierto) + Web Push (navegador cerrado).
 *
 * Uso en /t/[shop]/layout.tsx:
 *
 * <ShopMonitoringWrapper shop={params.shop} store={storeData} />
 */

import { ShopCartMonitor } from "@/components/ShopCartMonitor";
import { PushNotificationInitializer } from "@/components/PushNotificationInitializer";
import { AppState } from "@/types/InitialStatus";

interface ShopMonitoringWrapperProps {
  shop: string;
  store: AppState;
}

export function ShopMonitoringWrapper({
  shop,
  store,
}: ShopMonitoringWrapperProps) {
  const shopName = store.name || "Tienda";

  return (
    <>
      {/* Monitoreo local: notifica mientras el navegador está abierto */}
      <ShopCartMonitor
        shopKey={shop}
        shopName={shopName}
        autoMonitor={true}
        onlyNotifyWhenHidden={true}
      />

      {/* Web Push: registra suscripción para notificar aunque el navegador esté cerrado */}
      <PushNotificationInitializer shopKey={shop} autoRequest={false} />
    </>
  );
}

export default ShopMonitoringWrapper;
