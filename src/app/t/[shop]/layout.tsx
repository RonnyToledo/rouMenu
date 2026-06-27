import React from "react";
import MyProvider from "@/context/MyContext";
import { AppState, ProductVariant } from "@/types/InitialStatus";
import { notFound } from "next/navigation";
import Unavailable from "@/components/Catalogos/General/Unavailable";
import { Metadata } from "next";
import { buildShopMetadata } from "@/lib/shopMeta";
import { getStoreShell } from "@/lib/storeData";
import { ColorExtracted } from "./producto/[id]/page";
import { ShopMonitoringWrapper } from "@/components/ShopMonitoringWrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shop: string }>;
}): Promise<Metadata> {
  const { shop } = await params;
  // pageName lo puedes derivar del pathname que quieras mostrar (por ejemplo "Blog")
  // Aquí lo usamos como ejemplo: tomar "Blog" como nombre de sección
  return await buildShopMetadata(shop);
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;
  const storeOne = await getStoreShell(shop);
  if (!storeOne) notFound();
  const store = transformData(storeOne);
  if (!store.sitioweb) {
    console.info("Tienda no encontrada, redirigiendo a notFound");
    notFound();
  }

  if (!store.active) return <Unavailable />;

  const extractedColor = await ColorExtracted(
    store?.urlPoster || store.banner || "",
  );
  return (
    <div>
      <MyProvider storeSSD={store} color={extractedColor}>
        {/* Monitoreo de carritos para notificaciones de pedidos pendientes */}
        <ShopMonitoringWrapper shop={shop} store={store} />
        <div className="min-h-[80vh]">{children}</div>
      </MyProvider>
    </div>
  );
}
// Memoizar si es posible o hacerlo más eficiente
function transformData(store: AppState): AppState {
  if (!store) return {} as AppState;

  // Evitar JSON.parse si ya viene parseado
  const edit =
    typeof store.edit === "string" ? JSON.parse(store.edit) : store.edit;

  return {
    ...store,
    edit,
    products:
      store.products?.map((obj) => ({
        ...obj,
        selected_variant: {
          ...obj.selected_variant,
          Cant: 0,
          id: String(obj.selected_variant?.id ?? ""),
        } as ProductVariant,
        variants: (obj.variants ?? []).map((variant) => ({
          ...variant,
          Cant: 0,
        })),
        comparar: false,
      })) ?? [],
    envios:
      store.envios?.map((env) => ({
        ...env,
        precio: Number(env.precio),
      })) ?? [],
  };
}
