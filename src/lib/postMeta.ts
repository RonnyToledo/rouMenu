// lib/postMeta.ts
import { Metadata } from "next";
import { BlogService } from "@/services/blogService";

function trimToLength(s = "", max = 155) {
  if (!s) return "";
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim() + "...";
}

/**
 * buildPostMetadata
 * @param slug - slug del post (slug_blog)
 * @param opts - opciones opcionales (siteName, imageFallback, canonicalBase)
 */
export async function buildPostMetadata(
  slug: string,
  opts?: {
    siteName?: string;
    imageFallback?: string;
    canonicalBase?: string; // p.ej. https://roumenu.vercel.app
  }
): Promise<Metadata> {
  const siteName = opts?.siteName ?? "rouMenu";
  const imageFallback =
    opts?.imageFallback ??
    "https://res.cloudinary.com/dbgnyc842/image/upload/v1721753647/kiphxzqvoa66wisrc1qf.jpg";
  const canonicalBase = opts?.canonicalBase ?? "https://roumenu.vercel.app";

  if (!slug) {
    return {
      title: `${siteName} — Blog`,
      description: `${siteName} — artículos, tutoriales y recursos.`,
    };
  }

  try {
    const { post, error } = await BlogService.getPostBySlug(slug);

    if (error || !post) {
      return {
        title: "Post no encontrado",
        description: `${siteName} — No se encontró el artículo.`,
      };
    }

    const postTitle = (post.title ?? "").trim();
    const postDesc = (post.abstract ?? post.description ?? "").trim();
    const authorName = post?.Sitios?.name ?? siteName;
    const postImage = post.image ?? post?.Sitios?.urlPoster ?? imageFallback;
    const publishedTime = post?.created_at ?? undefined;
    const canonical = `${canonicalBase}/blog/${encodeURIComponent(slug)}`;

    // Title: poner el título del artículo al inicio, luego sitio/brand. Mantener compacto.
    const rawTitle = `${postTitle} | ${siteName}`;
    const title =
      rawTitle.length > 70 ? rawTitle.slice(0, 67) + "..." : rawTitle;

    // Description truncada para meta description
    const description = trimToLength(
      postDesc || `Lee "${postTitle}" en ${siteName}.`,
      155
    );

    // Open Graph
    const openGraph = {
      title,
      description,
      url: canonical,
      siteName,
      images: [
        {
          url: postImage,
          width: 1200,
          height: 630,
          alt: `${postTitle} — ${authorName}`,
        },
      ],
      type: "article" as const,
      publishedTime,
      authors: [authorName],
    };

    // Twitter
    const twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [postImage],
    };

    // JSON-LD Article (structured data)
    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: postTitle,
      description,
      image: [postImage],
      datePublished: publishedTime,
      author: {
        "@type": "Person",
        name: authorName,
      },
      publisher: {
        "@type": "Organization",
        name: siteName,
        logo: {
          "@type": "ImageObject",
          url: post?.Sitios?.urlPoster ?? imageFallback,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
    };

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph,
      twitter,
      // include JSON-LD via `other` - Next's Metadata type allows unknown fields but if you want to
      // inject JSON-LD you can render it in the page <head> or return here for your own processing.
      // We add it under `metadataBase` unsupported key so the consumer can pick it, or you can
      // output JSON-LD in the page component directly.
      // For compatibility, let's include it in `openGraph` as `article` fields (already set) and
      // also return the JSON-LD object separately via a custom `jsonLd` prop.
      // (Callers can extract it and render <script type="application/ld+json">...)
      jsonLd: articleJsonLd,
      robots: {
        index: true,
        follow: true,
      },
    } as Metadata & { jsonLd?: unknown };
  } catch (err) {
    console.error("buildPostMetadata error:", err);
    return {
      title: `${siteName} — Error`,
      description: "Ocurrió un error al generar los metadatos del post.",
    };
  }
}
