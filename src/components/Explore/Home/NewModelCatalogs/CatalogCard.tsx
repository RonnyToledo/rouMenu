"use client";

import React, { useRef } from "react";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";
import type { AllCatalogItem } from "@/types/HomeContentInterface";

// Re-export so CatalogsGrid can import the type from here
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
    cardRef.current.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 7}deg) translateZ(8px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
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
      className="group cursor-pointer reveal block"
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        opacity: 0,
        transform: "translateY(16px)",
      }}
    >
      <div
        className="rounded-2xl overflow-hidden h-full transition-shadow duration-300"
        style={{
          background: "#FFFCF8",
          border: featured
            ? "1.5px solid rgba(200,75,49,0.3)"
            : "1.5px solid rgba(90,55,20,0.08)",
          boxShadow: featured
            ? "0 8px 32px rgba(200,75,49,0.1)"
            : "0 2px 16px rgba(90,55,20,0.07)",
        }}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden"
          style={{ height: featured ? "220px" : "170px" }}
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
              style={{ background: "rgba(90,55,20,0.04)" }}
            >
              <span style={{ color: "rgba(90,55,20,0.15)", fontSize: "40px" }}>
                🏪
              </span>
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(255,248,240,0.75) 0%, transparent 55%)",
            }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {catalog.tipo && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,248,240,0.92)",
                  color: "#C84B31",
                  fontSize: "10px",
                  border: "1px solid rgba(200,75,49,0.2)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {catalog.tipo}
              </span>
            )}
            {featured && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(200,75,49,0.9)",
                  color: "#FFF8F0",
                  fontSize: "10px",
                }}
              >
                Destacado
              </span>
            )}
          </div>

          {/* Verified badge */}
          {catalog.verified && (
            <div className="absolute top-3 right-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,248,240,0.92)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(200,75,49,0.15)",
                }}
              >
                <svg
                  width="12"
                  height="12"
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

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <h3
                className="font-display font-semibold text-base leading-tight truncate"
                style={{ color: "#1A1208" }}
              >
                {catalog.name}
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(90,55,20,0.42)" }}
              >
                {[catalog.tipo, catalog.provincia].filter(Boolean).join(" · ")}
              </p>
            </div>
            {catalog.avg_star > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="#E8A838"
                  stroke="none"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span
                  className="text-sm font-bold"
                  style={{ color: "#C84B31" }}
                >
                  {catalog.avg_star.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {catalog.description && (
            <p
              className="text-xs font-light mb-3 leading-relaxed line-clamp-2"
              style={{ color: "rgba(90,55,20,0.55)" }}
            >
              {catalog.description}
            </p>
          )}

          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid rgba(90,55,20,0.07)" }}
          >
            <div>
              {catalog.products_count > 0 && (
                <p className="text-xs" style={{ color: "rgba(90,55,20,0.38)" }}>
                  {catalog.products_count} productos
                </p>
              )}
              {priceRange ? (
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#C84B31" }}
                >
                  {priceRange}
                </p>
              ) : (
                <p className="text-xs" style={{ color: "rgba(90,55,20,0.25)" }}>
                  Sin precio registrado
                </p>
              )}
            </div>
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200"
              style={{
                background: "rgba(200,75,49,0.07)",
                border: "1.5px solid rgba(200,75,49,0.2)",
                color: "#C84B31",
              }}
            >
              Ver catálogo
              <svg
                width="11"
                height="11"
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
