import React from "react";
import Product from "@/components/Catalogos/Specific/ProductSpecific";
import { Metadata } from "next";
import { buildProductMetadata } from "@/lib/productMeta";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shop: string; id: string }>;
}): Promise<Metadata> {
  const { shop, id } = await params;
  const meta = await buildProductMetadata(shop, id);
  return meta;
}

export default async function page({
  params,
}: {
  params: Promise<{ shop: string; id: string }>;
}) {
  const { shop, id } = await params;
  const { jsonLd } = await buildProductMetadata(shop, id);

  return (
    <div>
      <JsonLd data={jsonLd} />
      <Product id={id} />
    </div>
  );
}
