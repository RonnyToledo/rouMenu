// components/SeoClient.tsx
"use client";
import { useEffect } from "react";

type SeoClientProps = {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  jsonLd?: object | null;
  ogType?: string;
  twitterCard?: "summary" | "summary_large_image";
};

function ensureMeta(selector: string, attrName: string, attrValue: string) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (selector.startsWith("meta[")) {
      // do nothing, we'll set attributes below
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attrName, attrValue);
  return el;
}

export default function SeoClient({
  title,
  description,
  image,
  canonical,
  jsonLd,
  ogType = "website",
  twitterCard = "summary_large_image",
}: SeoClientProps) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    // description
    if (description) {
      let metaDesc = document.head.querySelector(
        'meta[name="description"]'
      ) as HTMLMetaElement | null;
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // canonical
    if (canonical) {
      let linkCanon = document.head.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement | null;
      if (!linkCanon) {
        linkCanon = document.createElement("link");
        linkCanon.rel = "canonical";
        document.head.appendChild(linkCanon);
      }
      linkCanon.href = canonical;
    }

    // Open Graph tags
    if (title)
      ensureMeta(
        'meta[property="og:title"]',
        "property",
        "og:title"
      ).setAttribute("content", title);
    if (description)
      ensureMeta(
        'meta[property="og:description"]',
        "property",
        "og:description"
      ).setAttribute("content", description);
    if (canonical)
      ensureMeta('meta[property="og:url"]', "property", "og:url").setAttribute(
        "content",
        canonical
      );
    if (image)
      ensureMeta(
        'meta[property="og:image"]',
        "property",
        "og:image"
      ).setAttribute("content", image);
    ensureMeta('meta[property="og:type"]', "property", "og:type").setAttribute(
      "content",
      ogType
    );

    // Twitter
    ensureMeta(
      'meta[name="twitter:card"]',
      "name",
      "twitter:card"
    ).setAttribute("content", twitterCard);
    if (title)
      ensureMeta(
        'meta[name="twitter:title"]',
        "name",
        "twitter:title"
      ).setAttribute("content", title);
    if (description)
      ensureMeta(
        'meta[name="twitter:description"]',
        "name",
        "twitter:description"
      ).setAttribute("content", description);
    if (image)
      ensureMeta(
        'meta[name="twitter:image"]',
        "name",
        "twitter:image"
      ).setAttribute("content", image);

    // JSON-LD injection
    let jsonLdEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      jsonLdEl = document.getElementById(
        "seo-json-ld"
      ) as HTMLScriptElement | null;
      if (!jsonLdEl) {
        jsonLdEl = document.createElement("script");
        jsonLdEl.type = "application/ld+json";
        jsonLdEl.id = "seo-json-ld";
        document.head.appendChild(jsonLdEl);
      }
      try {
        jsonLdEl.text = JSON.stringify(jsonLd);
      } catch (e) {
        console.error("Error serializing jsonLd", e);
      }
    }

    // Cleanup: restore title (optional) and remove the injected json-ld if we added it
    return () => {
      document.title = prevTitle;
      if (jsonLd && jsonLdEl) {
        jsonLdEl.remove();
      }
      // NOTE: we intentionally do NOT remove meta/og/twitter tags as they could be shared by other pages.
      // If you prefer to remove them, track which you created and remove here.
    };
  }, [title, description, image, canonical, ogType, twitterCard, jsonLd]);

  return null;
}
