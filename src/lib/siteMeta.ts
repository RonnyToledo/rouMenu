// lib/siteMeta.ts
import { Metadata } from "next";

type SiteMetaOpts = {
  siteName?: string; // nombre de la marca (por defecto "rouMenu")
  pageTitle?: string; // titulo especifico de la página (p.ej. "Inicio", "Blog")
  titleSuffix?: string; // texto al final del título (p.ej. "— rouMenu") si no usas siteName
  description?: string; // descripción meta
  image?: string; // imagen principal para OG/Twitter
  url?: string; // URL canónica base (p.ej. https://roumenu.vercel.app)
  path?: string; // ruta específica (p.ej. "/blog"), añadida a url para canonical
  locale?: string; // p.ej. "es_ES"
  language?: string; // p.ej. "es-ES"
  twitterHandle?: string; // p.ej. "@roumenu"
  keywords?: string[]; // palabras clave (opcional)
  robots?: { index?: boolean; follow?: boolean };
};

function trimToLength(s = "", max = 155) {
  if (!s) return "";
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim() + "...";
}

export async function buildSiteMetadata(
  opts: SiteMetaOpts = {}
): Promise<Metadata & { jsonLd?: unknown }> {
  const siteName = opts.siteName ?? "rouMenu";
  const baseUrl = (opts.url ?? "https://roumenu.vercel.app").replace(/\/$/, "");
  const path = opts.path ? `/${opts.path.replace(/^\//, "")}` : "";
  const canonical = `${baseUrl}${path}`;
  const pageTitle = (opts.pageTitle ?? "").trim();
  const titleSuffix = opts.titleSuffix ?? `| ${siteName}`;

  // Title: si hay pageTitle usar "pageTitle — siteName" ó "siteName" si no
  const title = pageTitle ? `${pageTitle} ${titleSuffix}` : siteName;
  const description = trimToLength(
    opts.description ??
      `${siteName} — crea, administra y comparte catálogos digitales para restaurantes, tiendas y negocios.`,
    155
  );

  const image =
    opts.image ??
    "https://res.cloudinary.com/dbgnyc842/image/upload/v1721753647/kiphxzqvoa66wisrc1qf.jpg";

  const locale = opts.locale ?? "es_ES";
  const language = opts.language ?? "es-ES";
  const twitterHandle = opts.twitterHandle;

  const robots = {
    index: opts.robots?.index ?? true,
    follow: opts.robots?.follow ?? true,
  };

  // JSON-LD: Organization + WebSite
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: siteName,
        url: baseUrl,
        sameAs: [], // puedes añadir redes sociales si las tienes
        logo: {
          "@type": "ImageObject",
          url: image,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: pageTitle ? `${pageTitle} — ${siteName}` : siteName,
        description,
        inLanguage: language,
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
      },
    ],
  };

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${siteName} - ${pageTitle || "Inicio"}`,
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      // handle only if provided
      ...(twitterHandle ? { creator: twitterHandle } : {}),
    },
    robots: {
      index: robots.index,
      follow: robots.follow,
    },
    // meta keywords (nota: muchos motores ya no usan keywords, pero puede incluirse)
    // Next Metadata no tiene campo 'keywords' oficial, lo añadimos en "other" si lo deseas.
    // O lo renderizas manualmente en <head>.
  };

  // adjuntamos jsonLd como campo adicional para que el caller pueda inyectarlo donde prefiera
  return { ...(metadata as Metadata), jsonLd };
}
