import React from "react";
import Product from "@/components/catalogo_UI/Specific/ProductSpecific";
import { getProductDetail } from "@/lib/storeData";
import { notFound } from "next/navigation";
import axios from "axios";
export default async function page({
  params,
}: {
  params: Promise<{ shop: string; id: string }>;
}) {
  const { shop, id } = await params;
  const product = await getProductDetail(shop, id);

  const extractedColor = await ColorExtracted(
    product?.selected_variant.image || "",
  );
  if (!product) notFound();

  return (
    <Product id={id} initialProductData={product} color={extractedColor} />
  );
}
export async function ColorExtracted(
  imageUrl: string | undefined,
): Promise<string> {
  if (imageUrl === undefined || imageUrl === "") return "#171717";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await axios.post(`${baseUrl}/api/image-color`, {
    imageUrl: imageUrl,
  });

  const data = res.data;
  return data.darkColor;
}
