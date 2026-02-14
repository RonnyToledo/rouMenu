import React from "react";
import PostPage from "@/components/blog/PostPage";
import { BlogService } from "@/services/blogService";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPostMetadata } from "@/lib/postMeta";

interface PageProps {
  params: Promise<{ slug_blog: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug_blog: string }>;
}): Promise<Metadata> {
  const { slug_blog } = await params;
  const slug = await buildPostMetadata(slug_blog);
  console.log("generateStaticParams - slugs:", slug);

  // Si quieres pasar opciones: buildPostMetadata(params.slug_blog, { siteName: "rouMenu", canonicalBase: "https://roumenu.vercel.app" });
  return slug;
}

export default async function Page({ params }: PageProps) {
  const { slug_blog } = await params;
  const { post, error } = await BlogService.getPostBySlug(slug_blog);
  console.log(post, error);

  if (error || !post) {
    console.log("Not found:", slug_blog);
    notFound();
  }

  return <PostPage post={post} />;
}
