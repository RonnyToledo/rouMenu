import React from "react";
import BlogPage from "@/components/blog/Explore_Blog";
import { BlogService } from "@/services/blogService";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Blog | Artículos y Tutoriales",
  description:
    "Descubre las últimas novedades, tutoriales y recursos para desarrolladores.",
};

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
  console.log(posts);
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
