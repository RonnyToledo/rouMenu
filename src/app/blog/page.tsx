import React from "react";
import BlogPage from "@/components/blog/Explore_Blog";
import { BlogService } from "@/services/blogService";
import { Metadata } from "next";
import { buildSiteMetadata } from "@/lib/siteMeta";

export async function generateMetadata(): Promise<Metadata> {
  // Ejemplo para la home:
  return await buildSiteMetadata({
    pageTitle: "Blog",
    description: "rouMenu — Catálogos digitales para tu negocio.",
    image: "/og/home.png",
    url: "https://roumenu.vercel.app",
    path: "/", // opcional
    locale: "es_ES",
    language: "es-ES",
    twitterHandle: "@roumenu",
  });
}

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

  return <BlogPage posts={posts} global={true} />;
}
