// lib/productMeta.ts
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";

type BuildOpts = {
  siteName?: string;
  canonicalBase?: string;
  imageFallback?: string;
  maxTitleLength?: number;
  maxDescriptionLength?: number;
};

function trimToLength(s = "", max = 155) {
  if (!s) return "";
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim() + "...";
}

/**
 * buildProductMetadata
 * - shop: sitioweb
 * - productId: productId en la tabla Products
 */
export async function buildProductMetadata(
  shop: string,
  productId: string,
  opts?: BuildOpts
): Promise<Metadata & { jsonLd?: unknown }> {
  const siteName = opts?.siteName ?? "rouMenu";
  const canonicalBase = (
    opts?.canonicalBase ?? "https://roumenu.vercel.app"
  ).replace(/\/$/, "");
  const imageFallback =
    opts?.imageFallback ??
    "https://res.cloudinary.com/dbgnyc842/image/upload/v1721753647/kiphxzqvoa66wisrc1qf.jpg";
  const maxTitleLength = opts?.maxTitleLength ?? 70;
  const maxDescLength = opts?.maxDescriptionLength ?? 155;

  if (!shop || !productId) {
    return {
      title: siteName,
      description: `${siteName} — catálogos y productos.`,
    } as Metadata;
  }

  try {
    // Traer solo campos necesarios
    const { data: store, error: errStore } = await supabase
      .from("Sitios")
      .select("name, urlPoster")
      .eq("sitioweb", shop)
      .single();

    if (errStore) throw errStore;

    const { data: product, error: errProd } = await supabase
      .from("Products")
      .select(
        "productId,title,descripcion,image,price,default_moneda,stock,monedas(*)"
      )
      .eq("productId", productId)
      .single();

    if (errProd) throw errProd;
    if (!product) {
      return {
        title: `${siteName} — Producto no encontrado`,
        description: `No se encontró el producto solicitado.`,
      } as Metadata;
    }

    // --- Normalizar datos recibidos ---
    const productTitle = (product.title ?? "").trim();
    const storeName = (store?.name ?? "").trim() || shop;
    const rawTitle = `${productTitle} — ${storeName} | ${siteName}`;
    const title =
      rawTitle.length > maxTitleLength
        ? rawTitle.slice(0, maxTitleLength - 3) + "..."
        : rawTitle;

    const description =
      trimToLength(
        product.descripcion ?? `${productTitle} en ${storeName}.`,
        maxDescLength
      ) || `${siteName} — productos y catálogos.`;

    const image = product.image ?? store?.urlPoster ?? imageFallback;
    const canonical = `${canonicalBase}/t/${encodeURIComponent(shop)}/producto/${encodeURIComponent(productId)}`;

    // --- Obtener currency robustamente ---
    // monedas puede venir como objeto o array; soportamos ambos casos.
    let currencyCode: string | undefined;
    try {
      const m = product.monedas as unknown;
      if (Array.isArray(m) && m.length > 0) {
        const arr = m as Array<Record<string, unknown>>;
        const found = arr.find((x) => {
          if (!x) return false;
          const maybeDefecto = (x as { defecto?: boolean }).defecto;
          return Boolean(maybeDefecto);
        });
        const selected = (found ?? arr[0]) as
          | Record<string, unknown>
          | undefined;
        currencyCode =
          typeof selected?.nombre === "string" ? selected.nombre : undefined;
      } else if (m && typeof m === "object") {
        const obj = m as Record<string, unknown>;
        currencyCode = typeof obj.nombre === "string" ? obj.nombre : undefined;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      currencyCode = undefined;
    }
    // Fallback: si tienes `default_moneda` + tabla monedas separada, ideal mapear fuera de aquí.
    if (!currencyCode && product.default_moneda) {
      // intenta usar default_moneda como código si ya está allí; si no, fallback USD
      currencyCode = String(product.default_moneda);
    }
    // Si currencyCode es una id numérica (ej. "18"), mejor fallback a USD:
    if (!currencyCode || /^\d+$/.test(currencyCode)) currencyCode = "USD";

    // --- Availability mapping simple ---
    // Si stock > 0 => InStock; si stock === 0 => OutOfStock; si null => UnknownAvailability
    const stockNum = Number(product.stock ?? 0);
    const schemaAvailability =
      stockNum > 0
        ? "https://schema.org/InStock"
        : stockNum === 0
          ? "https://schema.org/OutOfStock"
          : undefined;

    // --- OpenGraph (usar 'website' o 'article'; Next valida los tipos permitidos) ---
    const openGraph = {
      title,
      description,
      url: canonical,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${productTitle} — ${storeName}`,
        },
      ],
      type: "website" as const, // <= evita invalid OpenGraph type errors en Next
      locale: "es_ES",
    };

    // --- Twitter card ---
    const twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    };

    // --- JSON-LD Product schema (para inyectar en <head>) ---
    const productJsonLd: Record<string, unknown> = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: productTitle,
      image: [image],
      description,
      sku: product.productId ?? undefined,
      brand: {
        "@type": "Organization",
        name: storeName,
      },
    };

    if (product.price != null) {
      productJsonLd.offers = {
        "@type": "Offer",
        url: canonical,
        price: String(product.price),
        priceCurrency: currencyCode ?? "USD",
        availability: schemaAvailability,
        // bestPrice: puedes añadir priceValidUntil si lo posees
      };
    }

    // Retornamos Metadata + jsonLd para que la página lo inyecte
    return {
      title,
      description,
      alternates: { canonical },
      openGraph,
      twitter,
      robots: { index: true, follow: true },
      jsonLd: productJsonLd,
    } as Metadata & { jsonLd?: unknown };
  } catch (err) {
    console.error("buildProductMetadata error:", err);
    return {
      title: `${siteName} — Error`,
      description: "Ocurrió un error al generar los metadatos del producto.",
    } as Metadata;
  }
}
