import React from "react";
import BlogPage from "@/components/blog/Explore_Blog";
import { BlogService } from "@/services/blogService";
import { supabase } from "@/lib/supabase";
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
  const pageName = "Blog"; // o dedúcelo dinámicamente si lo necesitas
  return await buildShopMetadata(shop, pageName);
}

interface PageProps {
  params: Promise<{ shop: string }>;
}

export default async function Pagea({ params }: PageProps) {
  const { shop } = await params;
  const { data: uuid, error: err } = await supabase
    .from("Sitios")
    .select("UUID")
    .eq("sitioweb", shop)
    .single();
  if (err || !uuid) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">Tienda no encontrada</p>
      </div>
    );
  }
  const { posts, error } = await BlogService.getPostsBySite(uuid.UUID);
  if (error) {
    // Podrías retornar un componente de error personalizado
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">Error al cargar los posts</p>
      </div>
    );
  }

  return <BlogPage posts={posts || []} />;
}
