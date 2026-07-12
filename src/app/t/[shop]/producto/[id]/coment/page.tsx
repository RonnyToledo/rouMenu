import React from "react";
import CommentsPage from "@/components/catalogo_UI/Specific/ComentProduct";
export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <CommentsPage id={id} />
    </div>
  );
}
