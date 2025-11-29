import React from "react";
import MyProvider from "@/context/MyContext";
import { AppState } from "@/context/InitialStatus";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Unavailable from "@/components/Catalogos/General/Unavailable";
import { Metadata } from "next";
import { buildShopMetadata } from "@/lib/shopMeta";

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
  const { data: storeOne, error } = await supabase.rpc(
    "get_store_with_transform",
    { tienda_slug: shop }
  );

  if (error) {
    console.error("Error al obtener tienda:", error);
    notFound();
  } else {
    console.info("Store listo");
  }
  let store = transformData(storeOne);
  if (typeof storeOne.edit == "string") {
    store = transformData({ ...storeOne, edit: JSON.parse(storeOne.edit) });
  }
  if (!store.sitioweb) notFound();

  if (!storeOne.active) return <Unavailable />;
  return (
    <div>
      <MyProvider storeSSD={store}>
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
        Cant: 0,
        comparar: false,
      })) ?? [],
    envios:
      store.envios?.map((env) => ({
        ...env,
        precio: Number(env.precio),
      })) ?? [],
  };
}
