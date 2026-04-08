"use client";

import React, { useEffect, useRef } from "react";
import AppImage from "@/components/ui/AppImage";
import { ProductItem } from "@/types/HomeContentInterface";
import Link from "next/link";

interface SuggestionsSectionProps {
  products?: ProductItem[];
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}

function getTag(item: ProductItem): string {
  if (item.cnt_comments >= 2) return "Más comentado";
  if (item.avg_star >= 5) return "Top rated";
  if (item.score > 155) return "Tendencia";
  return "Sugerido";
}

export default function SuggestionsSection({
  products = [],
}: SuggestionsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

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

  if (products.length === 0) return null;
  console.log(products);
  return (
    <section
      id="sugerencias"
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
              style={{ color: "#E8A838" }}
            >
              Para Ti
            </span>
            <h2
              className="font-display text-4xl md:text-5xl font-bold"
              style={{ color: "#1A1208" }}
            >
              Productos
              <br />
              <span
                className="italic font-light"
                style={{ color: "rgba(90,55,20,0.4)" }}
              >
                sugeridos
              </span>
            </h2>
          </div>
          <p
            className="text-sm font-light max-w-xs"
            style={{ color: "rgba(90,55,20,0.52)" }}
          >
            Seleccionados por popularidad y valor en el mercado cubano actual.
          </p>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
          {products.map((item, idx) => (
            <Link
              href={`/t/${item.sitioweb}/producto/${item.productId}`}
              key={item.productId}
              className="reveal snap-center shrink-0 group cursor-pointer"
              style={{
                width: "clamp(240px, 28vw, 272px)",
                opacity: 0,
                transform: "translateY(16px)",
                transition: `opacity 0.5s ease ${idx * 55}ms, transform 0.5s ease ${idx * 55}ms`,
              }}
            >
              <div
                className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(90,55,20,0.08)",
                  boxShadow: "0 4px 20px rgba(120,60,20,0.08)",
                }}
              >
                {/* Image */}
                <div
                  className="relative overflow-hidden"
                  style={{ height: "200px" }}
                >
                  <AppImage
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="272px"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(30,15,5,0.45) 0%, transparent 55%)",
                    }}
                  />

                  {/* Tag */}
                  <span
                    className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(255,248,240,0.92)",
                      color: "#C84B31",
                      fontSize: "10px",
                      border: "1px solid rgba(200,75,49,0.2)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {getTag(item)}
                  </span>

                  {/* Store logo */}
                  {item.store_logo && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full overflow-hidden border-2 border-white/50 shadow">
                      <AppImage
                        src={item.store_logo}
                        alt={item.store_name}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p
                    className="text-xs mb-1"
                    style={{ color: "rgba(90,55,20,0.42)" }}
                  >
                    {item.store_name} · {item.category_name}
                  </p>
                  <h3
                    className="font-semibold text-sm mb-3 leading-tight"
                    style={{ color: "#1A1208" }}
                  >
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: "#C84B31" }}>
                        {formatPrice(item.price)}
                      </span>
                      {item.oldPrice > 0 && (
                        <span
                          className="text-xs line-through"
                          style={{ color: "rgba(90,55,20,0.3)" }}
                        >
                          {formatPrice(item.oldPrice)}
                        </span>
                      )}
                    </div>
                    <button
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{
                        background: "rgba(200,75,49,0.1)",
                        border: "1px solid rgba(200,75,49,0.2)",
                      }}
                      aria-label={`Ver ${item.title}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C84B31"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {item.avg_star > 0 && (
                    <div
                      className="flex items-center gap-1 mt-2 pt-2"
                      style={{ borderTop: "1px solid rgba(90,55,20,0.06)" }}
                    >
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
                        className="text-xs"
                        style={{ color: "rgba(90,55,20,0.42)" }}
                      >
                        {item.avg_star.toFixed(1)} · {item.cnt_comments} reseñas
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Scroll hint */}
        <div
          className="flex items-center justify-center gap-2 mt-6 reveal"
          style={{
            opacity: 0,
            transform: "translateY(8px)",
            transition: "opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s",
          }}
        >
          <div
            className="w-8 h-1 rounded-full"
            style={{ background: "#C84B31" }}
          />
          <div
            className="w-4 h-1 rounded-full"
            style={{ background: "rgba(90,55,20,0.15)" }}
          />
          <div
            className="w-4 h-1 rounded-full"
            style={{ background: "rgba(90,55,20,0.15)" }}
          />
          <span
            className="text-xs ml-2"
            style={{ color: "rgba(90,55,20,0.35)" }}
          >
            Desliza para ver más
          </span>
        </div>
      </div>
    </section>
  );
}
