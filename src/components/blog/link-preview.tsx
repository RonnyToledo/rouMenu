"use client";

import { ExternalLink, Globe, Loader2 } from "lucide-react";
import useSWR from "swr";
import Image from "next/image";
import { logoApp } from "@/lib/image";

interface OGData {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

function LinkPreviewCard({ url }: { url: string }) {
  const { data, error, isLoading } = useSWR<OGData>(
    `/api/link-preview?url=${encodeURIComponent(url)}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      errorRetryCount: 1,
    },
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 my-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Cargando vista previa...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 my-3 text-sm text-muted-foreground hover:bg-accent/50 transition-colors no-underline"
      >
        <Globe className="h-4 w-4 shrink-0" />
        <span className="truncate">{url}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-auto" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex overflow-hidden rounded-lg border border-border bg-card my-3 hover:border-foreground/20 transition-all no-underline"
    >
      {data.image && (
        <div className="relative block w-24 shrink-0 bg-muted">
          <Image
            src={data.image || logoApp}
            alt={data.title || "Link preview"}
            width={100}
            height={100}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center gap-1 p-3 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {data.favicon && (
            <Image
              src={data.favicon || logoApp}
              alt=""
              width={100}
              height={100}
              className="h-4 w-4 rounded-sm"
              crossOrigin="anonymous"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="truncate">{data.siteName}</span>
        </div>
        {data.title && (
          <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {data.title}
          </p>
        )}
        {data.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {data.description}
          </p>
        )}
      </div>
      <div className="flex items-center pr-3">
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </a>
  );
}

export function extractLinksFromHTML(html: string): string[] {
  if (!html) return [];
  const regex = /<a\s[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const urls: string[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    // Only include http/https URLs
    if (url.startsWith("http://") || url.startsWith("https://")) {
      if (!urls.includes(url)) {
        urls.push(url);
      }
    }
  }

  return urls;
}

/**
 * Splits HTML so that each <a href="https://..."> gets a preview card
 * rendered immediately after it in the flow.
 *
 * Strategy: walk the HTML string, find every <a> that points to an external
 * URL, and split around the *closing block element* that contains it
 * (e.g. </p>, </li>, </h1>…). This way the card appears right below the
 * paragraph / list-item / heading that contains the link.
 */

interface HTMLSegment {
  html: string;
  linkUrl: string | null; // URL to preview after this segment, or null
}

function splitHTMLByLinks(html: string): HTMLSegment[] {
  // Regex that matches a full <a ...href="https://..."...>...</a> tag
  const linkRegex =
    /<a\s[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>[\s\S]*?<\/a>/gi;

  const segments: HTMLSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const matchEnd = match.index + match[0].length;

    // Find the next closing block tag after this <a> to split there
    const afterLink = html.slice(matchEnd);
    const closingBlockRegex =
      /(<\/(?:p|li|div|h[1-6]|blockquote|section|article|td|th|figcaption|dd|dt)>)/i;
    const closingMatch = closingBlockRegex.exec(afterLink);

    let splitPoint: number;
    if (closingMatch) {
      splitPoint = matchEnd + closingMatch.index + closingMatch[0].length;
    } else {
      // No closing block found — split right after the </a>
      splitPoint = matchEnd;
    }

    // Grab everything from lastIndex to splitPoint as one segment
    const segmentHtml = html.slice(lastIndex, splitPoint);
    segments.push({ html: segmentHtml, linkUrl: url });
    lastIndex = splitPoint;
  }

  // Push any remaining HTML after the last link
  if (lastIndex < html.length) {
    segments.push({ html: html.slice(lastIndex), linkUrl: null });
  }

  // If no links were found at all, return a single segment with the full HTML
  if (segments.length === 0) {
    segments.push({ html, linkUrl: null });
  }

  return segments;
}
function styledHTML(html: string): string {
  return html.replace(
    /<a\s([^>]*href=["'](?:https?:\/\/[^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi,
    '<a $1 target="_blank" rel="noopener noreferrer" style="color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px;">$2</a>',
  );
}

export function HTMLPreviewWithLinkPreviews({ html }: { html: string }) {
  const segments = splitHTMLByLinks(html);

  return (
    <div>
      {segments.map((segment, i) => (
        <div key={i}>
          {/* Render the HTML chunk */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: styledHTML(segment.html) }}
          />

          {/* Inline link preview card right after */}
          {segment.linkUrl && <LinkPreviewCard url={segment.linkUrl} />}
        </div>
      ))}
    </div>
  );
}
