"use client";

import React, { useRef } from "react";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";
import type { AllCatalogItem } from "@/types/HomeContentInterface";

export type { AllCatalogItem as CatalogCardData };

interface CatalogCardProps {
  catalog: AllCatalogItem;
  featured?: boolean;
}

function formatPrice(p: number): string {
  return `$${p.toLocaleString()}`;
}

export default function CatalogCard({
  catalog,
  featured = false,
}: CatalogCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateZ(6px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  };

  const priceRange =
    catalog.min_price > 0 && catalog.max_price > 0
      ? `${formatPrice(catalog.min_price)} – ${formatPrice(catalog.max_price)}`
      : null;

  return (
    <Link
      href={catalog.sitioweb ? `/t/${catalog.sitioweb}` : "#"}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group reveal block"
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
        opacity: 0,
        transform: "translateY(16px)",
      }}
    >
      <div
        className="rounded-2xl overflow-hidden h-full transition-all duration-300"
        style={{
          background: "#161616",
          border: featured
            ? "1px solid rgba(200,75,49,0.35)"
            : "1px solid #242424",
          boxShadow: featured
            ? "0 8px 32px rgba(200,75,49,0.12)"
            : "0 2px 12px rgba(0,0,0,0.35)",
        }}
      >
        {/* ── Image ── */}
        <div
          className="relative overflow-hidden"
          style={{ height: featured ? 210 : 168 }}
        >
          {catalog.image ? (
            <AppImage
              src={catalog.image}
              alt={catalog.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "#1e1e1e" }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,248,240,0.08)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          )}

          {/* dark scrim */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(22,22,22,0.85) 0%, rgba(22,22,22,0.2) 55%, transparent 100%)",
            }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {catalog.tipo && (
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(13,13,13,0.75)",
                  color: "#C84B31",
                  border: "1px solid rgba(200,75,49,0.3)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {catalog.tipo}
              </span>
            )}
            {featured && (
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(200,75,49,0.9)",
                  color: "#FFF8F0",
                }}
              >
                Destacado
              </span>
            )}
          </div>

          {/* Verified */}
          {catalog.verified && (
            <div className="absolute top-3 right-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(13,13,13,0.75)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(200,75,49,0.25)",
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C84B31"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <h3
                className="font-serif font-semibold text-sm leading-tight truncate"
                style={{ color: "#FFF8F0" }}
              >
                {catalog.name}
              </h3>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "rgba(255,248,240,0.28)" }}
              >
                {[catalog.tipo, catalog.provincia].filter(Boolean).join(" · ")}
              </p>
            </div>
            {catalog.avg_star > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="#E8A838"
                  stroke="none"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span
                  className="text-xs font-bold"
                  style={{ color: "#E8A838" }}
                >
                  {catalog.avg_star.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {catalog.description && (
            <p
              className="text-xs font-light mb-3 leading-relaxed line-clamp-2"
              style={{ color: "rgba(255,248,240,0.35)" }}
            >
              {catalog.description}
            </p>
          )}

          {/* Footer row */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid rgba(255,248,240,0.06)" }}
          >
            <div>
              {catalog.products_count > 0 && (
                <p
                  className="text-[11px]"
                  style={{ color: "rgba(255,248,240,0.25)" }}
                >
                  {catalog.products_count} productos
                </p>
              )}
              {priceRange ? (
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#E8A838" }}
                >
                  {priceRange}
                </p>
              ) : (
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,248,240,0.18)" }}
                >
                  Sin precio registrado
                </p>
              )}
            </div>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 group-hover:bg-[#C84B31] group-hover:text-[#FFF8F0] group-hover:border-[#C84B31]"
              style={{
                background: "rgba(200,75,49,0.07)",
                border: "1px solid rgba(200,75,49,0.22)",
                color: "#C84B31",
              }}
            >
              Ver
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
