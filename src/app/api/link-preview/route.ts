import { NextRequest, NextResponse } from "next/server";

interface OGData {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
}

function extractMetaContent(html: string, property: string): string {
  // Try og: properties
  const ogRegex = new RegExp(
    `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  let match = ogRegex.exec(html);
  if (match) return match[1];

  // Try reversed attribute order (content before property)
  const ogRegexReversed = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`,
    "i",
  );
  match = ogRegexReversed.exec(html);
  if (match) return match[1];

  // Try name= attribute (for twitter: and description)
  const nameRegex = new RegExp(
    `<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  match = nameRegex.exec(html);
  if (match) return match[1];

  const nameRegexReversed = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`,
    "i",
  );
  match = nameRegexReversed.exec(html);
  if (match) return match[1];

  return "";
}

function extractTitle(html: string): string {
  const titleMatch = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
  return titleMatch ? titleMatch[1].trim() : "";
}

function extractFavicon(html: string, baseUrl: string): string {
  // Try link[rel="icon"] or link[rel="shortcut icon"]
  const iconRegex =
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i;
  let match = iconRegex.exec(html);
  if (!match) {
    const iconRegexReversed =
      /<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut )?icon["']/i;
    match = iconRegexReversed.exec(html);
  }

  if (match) {
    const href = match[1];
    if (href.startsWith("http")) return href;
    if (href.startsWith("//")) return `https:${href}`;
    try {
      const url = new URL(baseUrl);
      return `${url.origin}${href.startsWith("/") ? "" : "/"}${href}`;
    } catch {
      return href;
    }
  }

  // Default to /favicon.ico
  try {
    const url = new URL(baseUrl);
    return `${url.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

function resolveUrl(src: string, baseUrl: string): string {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  try {
    const url = new URL(baseUrl);
    return `${url.origin}${src.startsWith("/") ? "" : "/"}${src}`;
  } catch {
    return src;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // Validate URL
    new URL(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://example.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 502 },
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("xhtml")) {
      return NextResponse.json(
        { error: "URL does not return HTML content" },
        { status: 400 },
      );
    }

    const html = await response.text();

    const ogData: OGData = {
      url,
      title:
        extractMetaContent(html, "og:title") ||
        extractMetaContent(html, "twitter:title") ||
        extractTitle(html),
      description:
        extractMetaContent(html, "og:description") ||
        extractMetaContent(html, "twitter:description") ||
        extractMetaContent(html, "description"),
      image: resolveUrl(
        extractMetaContent(html, "og:image") ||
          extractMetaContent(html, "twitter:image"),
        url,
      ),
      siteName:
        extractMetaContent(html, "og:site_name") ||
        new URL(url).hostname.replace("www.", ""),
      favicon: extractFavicon(html, url),
    };

    return NextResponse.json(ogData, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    return NextResponse.json(
      { error: "Failed to fetch link preview" },
      { status: 500 },
    );
  }
}
