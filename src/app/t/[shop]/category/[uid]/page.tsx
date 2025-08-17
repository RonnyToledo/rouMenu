import Category from "@/components/Catalogos/Categorias/Category";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  return (
    <div>
      <Category categoria={uid} />
    </div>
  );
}
