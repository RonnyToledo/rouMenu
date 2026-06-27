"use client";

import React, { useEffect, useRef } from "react";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";
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
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll<HTMLElement>(".reveal")
              .forEach((el, i) => {
                setTimeout(() => {
                  el.style.opacity = "1";
                  el.style.transform = "translateY(0)";
                }, i * 90);
              });
          }
        });
      },
      { threshold: 0.12 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!item) return null;

  const bgImage = item.banner || item.image;
  const priceRange =
    item.min_price > 0 && item.max_price > 0
      ? `${formatPrice(item.min_price)} – ${formatPrice(item.max_price)}`
      : null;

  const stats: { value: string; label: string; unit?: string }[] = [
    {
      value: item.products_count > 0 ? String(item.products_count) : "—",
      label: "Productos",
    },
    {
      value: item.avg_star > 0 ? item.avg_star.toFixed(1) : "—",
      label: "Calificación",
      unit: "/5",
    },
    {
      value: item.satisfaction_pct > 0 ? `${item.satisfaction_pct}%` : "—",
      label: "Satisfacción",
    },
  ];

  const highlights = (
    [
      item.products_count > 0 && {
        label: `${item.products_count} productos`,
        icon: (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        ),
      },
      item.avg_star > 0 && {
        label: `${item.avg_star.toFixed(1)} estrellas`,
        icon: (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="#E8A838"
            stroke="none"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
      },
      item.domicilio && {
        label: "Envío a domicilio",
        icon: (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        ),
      },
      item.provincia && {
        label: item.provincia,
        icon: (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        ),
      },
    ] as (false | { label: string; icon: React.ReactNode })[]
  ).filter((x): x is { label: string; icon: React.ReactNode } => Boolean(x));

  return (
    <div
      ref={ref}
      className="relative rounded-2xl overflow-hidden mb-10"
      style={{ minHeight: 280, border: "1px solid #242424" }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {bgImage ? (
          <AppImage
            src={bgImage}
            alt={item.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[#161616]" />
        )}
        {/* dark scrim — left solid, right fades to image */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(13,13,13,0.97) 0%, rgba(13,13,13,0.85) 45%, rgba(13,13,13,0.4) 100%)",
          }}
        />
      </div>

      {/* dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,248,240,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 p-7 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
        {/* ── Left: text ── */}
        <div className="flex-1 min-w-0">
          {/* eyebrow */}
          <div
            className="reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{
              opacity: 0,
              transform: "translateY(10px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
              background: "rgba(200,75,49,0.1)",
              border: "1px solid rgba(200,75,49,0.25)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#C84B31", boxShadow: "0 0 6px #C84B31" }}
            />
            <span
              className="text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ color: "#C84B31" }}
            >
              Catálogo Destacado
            </span>
          </div>

          {/* title */}
          <h2
            className="reveal font-serif font-bold leading-tight mb-2"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              color: "#FFF8F0",
              opacity: 0,
              transform: "translateY(10px)",
              transition: "opacity 0.5s ease 0.08s, transform 0.5s ease 0.08s",
            }}
          >
            {item.name}
          </h2>

          {/* tipo · provincia */}
          <p
            className="reveal text-xs mb-4"
            style={{
              color: "rgba(255,248,240,0.38)",
              opacity: 0,
              transform: "translateY(10px)",
              transition: "opacity 0.5s ease 0.14s, transform 0.5s ease 0.14s",
            }}
          >
            {[item.tipo, item.provincia].filter(Boolean).join(" · ")}
          </p>

          {/* description */}
          {item.description && (
            <p
              className="reveal text-sm font-light leading-relaxed line-clamp-2 mb-5 max-w-sm"
              style={{
                color: "rgba(255,248,240,0.58)",
                opacity: 0,
                transform: "translateY(10px)",
                transition:
                  "opacity 0.5s ease 0.18s, transform 0.5s ease 0.18s",
              }}
            >
              {item.description}
            </p>
          )}

          {/* highlights */}
          {highlights.length > 0 && (
            <div
              className="reveal flex flex-wrap gap-3 mb-6"
              style={{
                opacity: 0,
                transform: "translateY(10px)",
                transition:
                  "opacity 0.5s ease 0.22s, transform 0.5s ease 0.22s",
              }}
            >
              {highlights.slice(0, 4).map((h) => (
                <div
                  key={h.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,248,240,0.06)",
                    border: "1px solid rgba(255,248,240,0.1)",
                    color: "rgba(255,248,240,0.55)",
                  }}
                >
                  <span style={{ color: "rgba(255,248,240,0.45)" }}>
                    {h.icon}
                  </span>
                  <span className="text-xs">{h.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <Link
            href={item.sitioweb ? `/t/${item.sitioweb}` : "#"}
            className="reveal inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            style={{
              background: "#C84B31",
              color: "#FFF8F0",
              boxShadow: "0 4px 20px rgba(200,75,49,0.3)",
              opacity: 0,
              transform: "translateY(10px)",
              transition: "opacity 0.5s ease 0.28s, transform 0.5s ease 0.28s",
            }}
          >
            Explorar {item.name}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ── Right: stats card ── */}
        <div
          className="reveal shrink-0 w-full md:w-48 rounded-xl p-5 space-y-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,248,240,0.08)",
            opacity: 0,
            transform: "translateY(10px)",
            transition: "opacity 0.5s ease 0.34s, transform 0.5s ease 0.34s",
          }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div className="flex items-baseline gap-0.5 mb-0.5">
                <span
                  className="font-serif text-2xl font-bold"
                  style={{ color: "#FFF8F0" }}
                >
                  {s.value}
                </span>
                {s.unit && (
                  <span
                    className="text-xs"
                    style={{ color: "rgba(255,248,240,0.3)" }}
                  >
                    {s.unit}
                  </span>
                )}
              </div>
              <p
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "rgba(255,248,240,0.3)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
          {priceRange && (
            <div
              className="pt-4"
              style={{ borderTop: "1px solid rgba(255,248,240,0.07)" }}
            >
              <span
                className="font-serif text-base font-bold"
                style={{ color: "#E8A838" }}
              >
                {priceRange}
              </span>
              <p
                className="text-[10px] uppercase tracking-widest mt-0.5"
                style={{ color: "rgba(255,248,240,0.3)" }}
              >
                Rango de precios
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
