"use client";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Post } from "@/types/blog";
import { logoApp } from "@/lib/image";
import { TableOfContents } from "./TableOfContents";
import { useRouter } from "next/navigation";
import { HTMLPreviewWithLinkPreviews } from "./link-preview";

// Utilidades movidas fuera del componente para mejor rendimiento
function extractHeadings(
  html: string,
): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /<h([2-3])>(.*?)<\/h\1>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = Number.parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, "");
    const id = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    headings.push({ id, text, level });
  }

  return headings;
}

function addIdsToHeadings(html: string): string {
  return html.replace(/<h([2-3])>(.*?)<\/h\1>/g, (match, level, content) => {
    const text = content.replace(/<[^>]*>/g, "");
    const id = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `<h${level} id="${id}">${content}</h${level}>`;
  });
}

interface PostPageProps {
  post: Post;
}

export default function PostPage({ post }: PostPageProps) {
  const router = useRouter();
  const headings = extractHeadings(post.description);
  const formattedDate = new Date(post.created_at).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="h-16"></div>

      <article className="container mx-auto px-4 py-2">
        {/* Featured Image */}

        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
            <Image
              src={post.image || logoApp}
              alt={post.title || ""}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <header className="max-w-3xl mx-auto mb-8 text-center">
          <Badge variant="secondary" className="mb-4">
            Artículo
          </Badge>
          <h1 className="text-4xl  font-bold tracking-tight text-balance mb-6">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-3 text-sm">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={post.Sitios.urlPoster || logoApp}
                alt={post.Sitios.name}
              />
              <AvatarFallback>
                {post.Sitios.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground">
                {post.Sitios.name}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <time dateTime={post.created_at}>{formattedDate}</time>
              </div>
            </div>
          </div>
        </header>

        {post.abstract ? (
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-lg text-muted-foreground leading-relaxed line-clamp-10">
              {post.abstract}
            </p>
          </div>
        ) : null}

        <div className="max-w-3xl mx-auto">
          <TableOfContents headings={headings} />
        </div>

        <div className="max-w-3xl mx-auto">
          <HTMLPreviewWithLinkPreviews
            html={addIdsToHeadings(post.description)}
          />
        </div>

        {/* Footer */}
        <footer className="max-w-3xl mx-auto mt-16 pt-8 border-t">
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ver todos los posts
            </Button>
          </div>
        </footer>
      </article>
    </div>
  );
}
