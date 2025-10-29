import React from "react";
import BlogPage from "@/components/blog/Explore_Blog";
import { BlogService } from "@/services/blogService";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Artículos y Tutoriales",
  description:
    "Descubre las últimas novedades, tutoriales y recursos para desarrolladores.",
};

export default async function Page() {
  const { posts, error } = await BlogService.getAllPosts();

  if (error) {
    // Podrías retornar un componente de error personalizado
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">Error al cargar los posts</p>
      </div>
    );
  }

  return <BlogPage posts={posts} />;
}
