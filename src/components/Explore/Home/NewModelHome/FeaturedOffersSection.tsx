"use client";

import React, { useEffect, useRef } from "react";
import AppImage from "@/components/ui/AppImage";
import { ProductItem, TopPostItem } from "@/types/HomeContentInterface";
import Link from "next/link";

interface FeaturedOffersSectionProps {
  products?: ProductItem[];
  top_posts?: TopPostItem[];
}

const bentoConfig = [
  { colSpan: "md:col-span-2", rowSpan: "md:row-span-2", featured: true },
  { colSpan: "md:col-span-1", rowSpan: "", featured: false },
  { colSpan: "md:col-span-1", rowSpan: "", featured: false },
  { colSpan: "md:col-span-1", rowSpan: "", featured: false },
  { colSpan: "md:col-span-1", rowSpan: "", featured: false },
  { colSpan: "md:col-span-2", rowSpan: "", featured: false },
];

function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}

function calcDiscount(price: number, oldPrice: number): string | null {
  if (!oldPrice || oldPrice <= price) return null;
  return `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`;
}

export default function FeaturedOffersSection({
  products = [],
  top_posts = [],
}: FeaturedOffersSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const items = (top_posts.length > 0 ? top_posts : products).slice(0, 6);

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
                i * 80,
              );
            });
          }
        });
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;
  console.log(items);
  return (
    <section
      id="ofertas"
      ref={sectionRef}
      className="py-20 px-5"
      style={{ background: "#FDF8F2" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 reveal"
          style={{
            opacity: 0,
            transform: "translateY(16px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <div>
            <span
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#C84B31" }}
            >
              Ofertas Destacadas
            </span>
            <h2
              className="font-display text-4xl md:text-5xl font-bold leading-tight"
              style={{ color: "#1A1208" }}
            >
              Precios que
              <br />
              <span className="italic font-light" style={{ color: "#C84B31" }}>
                no se repiten
              </span>
            </h2>
          </div>
          <p
            className="text-sm font-light max-w-xs"
            style={{ color: "rgba(90,55,20,0.55)" }}
          >
            Las mejores ofertas de los catálogos más populares, actualizadas
            cada día.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[220px]">
          {items.map((item, idx) => {
            const config =
              bentoConfig[idx] ?? bentoConfig[bentoConfig.length - 1];
            const discount = calcDiscount(item.price, item.oldPrice);

            return (
              <Link
                href={`/t/${item.store_sitioweb}/producto/${item.productId}`}
                key={item.productId}
                className={`reveal group relative rounded-2xl overflow-hidden cursor-pointer ${config.colSpan} ${config.rowSpan}`}
                style={{
                  transitionDelay: `${idx * 60}ms`,
                  opacity: 0,
                  transform: "translateY(16px)",
                  transition: `opacity 0.5s ease ${idx * 60}ms, transform 0.5s ease ${idx * 60}ms`,
                }}
              >
                {/* Image */}
                <div className="absolute inset-0">
                  <AppImage
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(30,15,5,0.82) 0%, rgba(30,15,5,0.4) 50%, rgba(30,15,5,0.1) 100%)",
                    }}
                  />
                </div>

                {/* Tags */}
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(200,75,49,0.92)",
                      color: "#FFF8F0",
                      fontSize: "10px",
                    }}
                  >
                    {item.category_name}
                  </span>
                  {discount && (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(232,168,56,0.95)",
                        color: "#1A1208",
                        fontSize: "10px",
                        fontWeight: 700,
                      }}
                    >
                      {discount}
                    </span>
                  )}
                </div>

                {/* Store logo */}
                {item.store_logo && (
                  <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full overflow-hidden border-2 border-white/30">
                    <AppImage
                      src={item.store_logo}
                      alt={item.store_name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <p
                    className="text-xs mb-1"
                    style={{ color: "rgba(255,248,240,0.55)" }}
                  >
                    {item.store_name}
                  </p>
                  <h3
                    className={`font-display font-semibold leading-tight mb-2 ${config.featured ? "text-2xl" : "text-base"}`}
                    style={{ color: "#FFF8F0" }}
                  >
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span
                      className="font-bold text-lg"
                      style={{ color: "#E8A838" }}
                    >
                      {formatPrice(item.price)}
                    </span>
                    {item.oldPrice > 0 && (
                      <span
                        className="text-sm line-through"
                        style={{ color: "rgba(255,248,240,0.35)" }}
                      >
                        {formatPrice(item.oldPrice)}
                      </span>
                    )}
                    {item.avg_star > 0 && (
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,248,240,0.5)" }}
                      >
                        ⭐ {item.avg_star.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover border */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    border: "1.5px solid rgba(200,75,49,0.45)",
                    boxShadow: "inset 0 0 24px rgba(200,75,49,0.08)",
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
