"use client";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTopic } from "@/utils/formatTip";
import { Post } from "@/types/blog";
import { usePathname } from "next/navigation";
import { logoApp } from "@/lib/image";

interface BlogPageProps {
  posts: Post[];
  global?: boolean;
}

export default function BlogPage({ posts, global = false }: BlogPageProps) {
  // Validación temprana
  const pathname = usePathname();
  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16"></div>
        <section className="container mx-auto p-4">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Blog</h1>
            <p className="text-muted-foreground text-lg">
              No hay posts publicados todavía.
            </p>
          </div>
        </section>
      </div>
    );
  }
  const firstPost = posts[0];
  const siteName = firstPost?.Sitios?.name || "Nuestro Sitio";
  const tipo = firstPost?.Sitios?.tipo || "";
  const topicPhrase = formatTopic(tipo);

  return (
    <div className="min-h-screen bg-background">
      <div className="h-16"></div>

      {/* Hero Section */}
      {!global ? (
        <section className="border-b bg-muted/30">
          <div className="container mx-auto p-4">
            <div className="max-w-3xl">
              <h1 className="text-4xlfont-bold tracking-tight text-balance mb-6">
                Blog de {siteName}
              </h1>
              <p className="text-lg  text-muted-foreground leading-relaxed">
                Explora tutoriales, guías y las últimas tendencias {topicPhrase}
                .
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Posts Grid */}
      <section className="container mx-auto p-4 ">
        <div className="grid gap-8 ">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <Image
                  src={post.image || logoApp}
                  alt={post.title || ""}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>

              <CardHeader>
                <CardTitle className="text-xl text-balance">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {post.abstract}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.Sitios.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.created_at}>
                      {new Date(post.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" asChild className="w-full group">
                  <Link href={`${pathname}/${post.slug}`}>
                    Leer más
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
