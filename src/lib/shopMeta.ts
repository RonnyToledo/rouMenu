// lib/shopMeta.ts
import { Metadata } from "next";
import { supabase } from "@/lib/supabase"; // ajusta la ruta si tu supabase está en otra parte
import { logoApp } from "./image";

function trimToLength(s: string, max = 155) {
  if (!s) return "";
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim() + "...";
}

function looksLikeProperName(name?: string) {
  if (!name) return false;
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/);
  const firstIsCapital = /^[A-ZÁÉÍÓÚÑ]/.test(trimmed);
  return firstIsCapital || words.length > 1;
}

/**
 * buildShopMetadata
 * @param shop - valor que viene en la url (sitioweb)
 * @param pageName - nombre de la ruta/ seccción (p.ej. "Blog", "Productos")
 * @param opts - opcionales: siteName, forceProperName, imageFallback, maxTitleLength
 */
export async function buildShopMetadata(
  shop: string,
  pageName?: string,
  opts?: {
    siteName?: string;
    forceProperName?: boolean | null;
    imageFallback?: string;
    maxTitleLength?: number;
  }
): Promise<Metadata> {
  const siteName = opts?.siteName ?? "rouMenu";
  const maxTitleLength = opts?.maxTitleLength ?? 60;
  const fallbackImage = opts?.imageFallback ?? logoApp;

  if (!shop) {
    return {
      title: siteName,
      description: `${siteName} — Catálogos y menús digitales.`,
    };
  }

  try {
    const { data: site, error } = await supabase
      .from("Sitios")
      .select("name,parrrafo,urlPoster")
      .eq("sitioweb", shop)
      .single();

    if (error) throw error;

    const name = (site?.name ?? shop).trim();
    const summary = (site?.parrrafo ?? "").trim();
    const image = site?.urlPoster ?? fallbackImage;

    const isProper = looksLikeProperName(name);

    // Construcción del prefijo / keyword (SEO-friendly)
    const keywordPrefix = isProper ? `${name} — Catálogo` : `Catálogo ${name}`;

    // Si nos pasan pageName lo añadimos como contexto (p.ej. "Blog", "Productos")
    const pagePart = pageName ? ` · ${pageName}` : "";

    // Título final: keyword al inicio, marca al final
    const rawTitle = `${keywordPrefix}${pagePart} | ${siteName}`;
    const title = trimToLength(rawTitle, maxTitleLength);

    // Description con límite (CTA suave)
    const defaultDesc =
      summary ||
      `Explora el catálogo de ${name}: productos, precios y novedades.`;
    const description = trimToLength(defaultDesc, 155);

    const canonical = `https://roumenu.vercel.app/t/${encodeURIComponent(shop)}`;

    const metadata: Metadata = {
      title,
      description,
      alternates: { canonical },
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
            alt: `${name} — ${siteName}`,
          },
        ],
        type: "website",
        locale: "es_ES",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
      robots: {
        index: true,
        follow: true,
      },
    };

    return metadata;
  } catch (err) {
    console.error("buildShopMetadata error:", err);
    return {
      title: `${siteName} — Error`,
      description: "No se pudieron cargar los metadatos del sitio.",
    };
  }
}
