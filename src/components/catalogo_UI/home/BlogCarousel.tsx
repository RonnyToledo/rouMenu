"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext, useRef } from "react";
import { ArrowRight, Calendar } from "lucide-react";
import { logoApp } from "@/lib/image";
import { MyContext } from "@/context/MyContext";

export default function BlogCarousel() {
  const { store } = useContext(MyContext);
  const trackRef = useRef<HTMLDivElement>(null);
  if (!store.blogs || store.blogs.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 p-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-serif text-xl text-foreground">Nuestro blog</h2>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {store.blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/t/${store.sitioweb}/blog/${blog.slug}`}
            className="group w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform active:scale-[0.98] sm:w-85"
          >
            <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
              <Image
                fill
                src={blog.image || logoApp}
                alt={blog.title}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(blog.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h3 className="line-clamp-2 font-serif text-base leading-snug text-foreground">
                {blog.title}
              </h3>

              {blog.abstract && (
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {blog.abstract}
                </p>
              )}

              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent">
                Leer más
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
