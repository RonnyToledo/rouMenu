import React from "react";
import Product from "@/components/Catalogos/Specific/ProductSpecific";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <Product id={id} />
    </div>
  );
}
