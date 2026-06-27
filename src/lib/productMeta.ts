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

export async function buildProductMetadata(
  shop: string,
  productId: string,
  opts?: BuildOpts,
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
    // 1. Tienda
    const { data: store, error: errStore } = await supabase
      .from("Sitios")
      .select("name, urlPoster")
      .eq("sitioweb", shop)
      .single();

    if (errStore) throw errStore;

    // 2. Producto + variantes + moneda
    const { data: product, error: errProd } = await supabase
      .from("Products")
      .select(
        `
        productId,
        title,
        descripcion,
        default_moneda,
        monedas(*),
        product_variants (
          price,
          old_price,
          stock,
          image,
          default_variant
        )
      `,
      )
      .eq("productId", productId)
      .single();

    if (errProd) throw errProd;
    if (!product) {
      return {
        title: `${siteName} — Producto no encontrado`,
        description: "No se encontró el producto solicitado.",
      } as Metadata;
    }

    // 3. Elegir variante para metadata:
    //    default con stock → cualquiera con stock → default sin stock → primera
    const variants = (product.product_variants ?? []) as Array<{
      price: number | null;
      old_price: number | null;
      stock: number;
      image: string | null;
      default_variant: boolean;
    }>;

    const selectedVariant =
      variants.find((v) => v.default_variant && v.stock > 0) ??
      variants.find((v) => v.stock > 0) ??
      variants.find((v) => v.default_variant) ??
      variants[0];

    // 4. Normalizar
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
        maxDescLength,
      ) || `${siteName} — productos y catálogos.`;

    const image = selectedVariant?.image ?? store?.urlPoster ?? imageFallback;
    const price = selectedVariant?.price ?? null;
    const stock = selectedVariant?.stock ?? 0;
    const canonical = `${canonicalBase}/t/${encodeURIComponent(shop)}/producto/${encodeURIComponent(productId)}`;

    // 5. Currency
    let currencyCode: string | undefined;
    try {
      const m = product.monedas as unknown;
      if (Array.isArray(m) && m.length > 0) {
        const arr = m as Array<Record<string, unknown>>;
        const found = arr.find((x) =>
          Boolean((x as { defecto?: boolean }).defecto),
        );
        const selected = (found ?? arr[0]) as
          | Record<string, unknown>
          | undefined;
        currencyCode =
          typeof selected?.nombre === "string" ? selected.nombre : undefined;
      } else if (m && typeof m === "object") {
        const obj = m as Record<string, unknown>;
        currencyCode = typeof obj.nombre === "string" ? obj.nombre : undefined;
      }
    } catch {
      currencyCode = undefined;
    }

    if (!currencyCode || /^\d+$/.test(currencyCode)) currencyCode = "USD";

    // 6. Schema availability
    const schemaAvailability =
      stock > 0
        ? "https://schema.org/InStock"
        : stock === 0
          ? "https://schema.org/OutOfStock"
          : undefined;

    // 7. OpenGraph + Twitter
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
      type: "website" as const,
      locale: "es_ES",
    };

    const twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    };

    // 8. JSON-LD
    const productJsonLd: Record<string, unknown> = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: productTitle,
      image: [image],
      description,
      sku: product.productId ?? undefined,
      brand: { "@type": "Organization", name: storeName },
    };

    if (price != null) {
      productJsonLd.offers = {
        "@type": "Offer",
        url: canonical,
        price: String(price),
        priceCurrency: currencyCode,
        availability: schemaAvailability,
      };
    }

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
