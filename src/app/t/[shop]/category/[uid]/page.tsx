import Category from "@/components/Catalogos/Categorias/Category";
import React from "react";
import { Metadata } from "next";
import { buildShopMetadata } from "@/lib/shopMeta";
import { supabase } from "@/lib/supabase";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shop: string; uid: string }>;
}): Promise<Metadata> {
  const { shop, uid } = await params;

  try {
    const { data: category } = await supabase
      .from("Categorias")
      .select("name")
      .eq("id", uid)
      .single();

    return await buildShopMetadata(shop, category?.name || "Categoría");
  } catch {
    return await buildShopMetadata(shop, "Categoría");
  }
}

export default async function page({
  params,
}: {
  params: Promise<{ shop: string; uid: string }>;
}) {
  const { shop, uid } = await params;

  let categoryName = "Categoría";
  try {
    const { data: category } = await supabase
      .from("Categorias")
      .select("name")
      .eq("id", uid)
      .single();
    if (category?.name) categoryName = category.name;
  } catch {
    // ignore
  }

  const { jsonLd } = await buildShopMetadata(shop, categoryName);

  return (
    <div>
      <JsonLd data={jsonLd} />
      <Category categoria={uid} />
    </div>
  );
}
