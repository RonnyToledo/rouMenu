"use client";

import React, { useEffect, useRef } from "react";
import AppImage from "@/components/ui/AppImage";
import type { SpotlightItem } from "@/types/HomeContentInterface";

interface FeaturedSpotlightProps {
  spotlight?: SpotlightItem[];
}

function formatPrice(p: number): string {
  return `$${p.toLocaleString()}`;
}

export default function FeaturedSpotlight({
  spotlight = [],
}: FeaturedSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const item = spotlight[0];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(
                () =>
                  ((el as HTMLElement).style.cssText +=
                    "opacity:1;transform:translateY(0)"),
                i * 100,
              );
            });
          }
        });
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!item) return null;

  const bgImage = item.banner || item.image;
  const priceRange =
    item.min_price > 0 && item.max_price > 0
      ? `${formatPrice(item.min_price)} – ${formatPrice(item.max_price)}`
      : null;

  const stats = [
    {
      value: item.products_count > 0 ? `${item.products_count}` : "—",
      label: "Productos",
      unit: "",
    },
    {
      value: item.avg_star > 0 ? item.avg_star.toFixed(1) : "—",
      label: "Calificación",
      unit: "/5",
    },
    {
      value: item.satisfaction_pct > 0 ? `${item.satisfaction_pct}%` : "—",
      label: "Satisfacción",
      unit: "",
    },
  ];

  const highlights = (
    [
      item.products_count > 0 && {
        label: `${item.products_count} productos`,
        icon: "📦",
      },
      item.avg_star > 0 && {
        label: `${item.avg_star.toFixed(1)} estrellas`,
        icon: "⭐",
      },
      item.domicilio && { label: "Envío a domicilio", icon: "🚚" },
      item.provincia && { label: item.provincia, icon: "📍" },
    ] as (false | { label: string; icon: string })[]
  ).filter((x): x is { label: string; icon: string } => Boolean(x));

  return (
    <div
      ref={ref}
      className="relative rounded-3xl overflow-hidden mb-10"
      style={{ minHeight: "320px" }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <AppImage
          src={bgImage}
          alt={item.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Light-friendly scrim: stronger left, fades right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(253,248,242,0.97) 0%, rgba(253,248,242,0.82) 45%, rgba(253,248,242,0.35) 100%)",
          }}
        />
      </div>

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(160,100,50,0.07) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: text */}
        <div className="flex-1">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 reveal"
            style={{
              opacity: 0,
              transform: "translateY(10px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
              background: "rgba(200,75,49,0.08)",
              border: "1px solid rgba(200,75,49,0.22)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#C84B31" }}
            />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#C84B31" }}
            >
              Catálogo Destacado
            </span>
          </div>

          {/* Title */}
          <h2
            className="font-display text-3xl md:text-5xl font-bold leading-tight mb-2 reveal"
            style={{
              color: "#1A1208",
              opacity: 0,
              transform: "translateY(10px)",
              transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
            }}
          >
            {item.name}
          </h2>

          {/* Tipo + provincia */}
          <p
            className="text-sm mb-3 reveal"
            style={{
              color: "rgba(90,55,20,0.45)",
              opacity: 0,
              transform: "translateY(10px)",
              transition: "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s",
            }}
          >
            {[item.tipo, item.provincia].filter(Boolean).join(" · ")}
          </p>

          {/* Description */}
          {item.description && (
            <p
              className="text-base font-light mb-6 line-clamp-3 reveal"
              style={{
                color: "rgba(90,55,20,0.75)",
                maxWidth: "420px",
                opacity: 0,
                transform: "translateY(10px)",
                transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
              }}
            >
              {item.description}
            </p>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <div
              className="flex flex-wrap gap-5 mb-6 reveal"
              style={{
                opacity: 0,
                transform: "translateY(10px)",
                transition:
                  "opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s",
              }}
            >
              {highlights.slice(0, 4).map((h) => (
                <div key={h.label} className="flex items-center gap-2">
                  <span>{h.icon}</span>
                  <span
                    className="text-sm"
                    style={{ color: "rgba(90,55,20,0.7)" }}
                  >
                    {h.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <a
            href={item.sitioweb ? `/t/${item.sitioweb}` : "#"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl reveal"
            style={{
              background: "#C84B31",
              color: "#FFF8F0",
              boxShadow: "0 4px 20px rgba(200,75,49,0.28)",
              opacity: 0,
              transform: "translateY(10px)",
              transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
            }}
          >
            Explorar {item.name}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Right: stats card */}
        <div
          className="reveal shrink-0 rounded-2xl p-6 w-full md:w-56"
          style={{
            background: "rgba(255,248,240,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(200,75,49,0.12)",
            boxShadow: "0 8px 32px rgba(90,55,20,0.1)",
            opacity: 0,
            transform: "translateY(10px)",
            transition: "opacity 0.5s ease 0.35s, transform 0.5s ease 0.35s",
          }}
        >
          <div className="space-y-5">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span
                    className="font-display text-2xl font-bold"
                    style={{ color: "#1A1208" }}
                  >
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span
                      className="text-xs"
                      style={{ color: "rgba(90,55,20,0.4)" }}
                    >
                      {stat.unit}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "rgba(90,55,20,0.4)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
            {priceRange && (
              <div>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span
                    className="font-display text-base font-bold"
                    style={{ color: "#C84B31" }}
                  >
                    {priceRange}
                  </span>
                </div>
                <p
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "rgba(90,55,20,0.4)" }}
                >
                  Rango de precios
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
