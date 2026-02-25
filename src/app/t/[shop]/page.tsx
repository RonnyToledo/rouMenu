import React from "react";
import Products from "@/components/Catalogos/home/Products";
import { CatalogFooter } from "@/components/Catalogos/General/Footer";
import TestimonialCarouselDemo from "@/components/Catalogos/home/Testimonial";
import DrawerCart from "@/components/Catalogos/General/DrawerCart";
import { Metadata } from "next";
import { buildShopMetadata } from "@/lib/shopMeta";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shop: string }>;
}): Promise<Metadata> {
  const { shop } = await params;
  return await buildShopMetadata(shop);
}

export default async function page({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;
  const { jsonLd } = await buildShopMetadata(shop);

  return (
    <div>
      <JsonLd data={jsonLd} />
      <div className="grid grid-cols-1 ">
        <Products />
      </div>
      <DrawerCart />
      <TestimonialCarouselDemo />
      <CatalogFooter />
    </div>
  );
}
