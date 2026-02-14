import React from "react";
import SearchPage from "@/components/Catalogos/Search/SearchPage";
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
  const pageName = "Buscar"; // o dedúcelo dinámicamente si lo necesitas
  return await buildShopMetadata(shop, pageName);
}
export default function page() {
  return <SearchPage />;
}
