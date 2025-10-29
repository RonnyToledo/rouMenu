import React from "react";
import PostPage from "@/components/blog/PostPage";
import { BlogService } from "@/services/blogService";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug_blog: string }>;
}

export async function generateStaticParams() {
  const slugs = await BlogService.getAllSlugs();

  return slugs.map((slug) => ({
    slug_blog: slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug_blog } = await params;
  const { post, error } = await BlogService.getPostBySlug(slug_blog);

  if (error || !post) {
    return {
      title: "Post no encontrado",
    };
  }

  return {
    title: `${post.title} | Blog`,
    description: post.abstract,
    openGraph: {
      title: post.title,
      description: post.abstract,
      images: post.image ? [post.image] : [],
      type: "article",
      publishedTime: post.created_at,
      authors: [post.Sitios.name],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug_blog } = await params;
  const { post, error } = await BlogService.getPostBySlug(slug_blog);

  if (error || !post) {
    notFound();
  }

  return <PostPage post={post} />;
}
