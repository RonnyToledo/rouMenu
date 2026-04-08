// HeroPremium.tsx
"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "@/context/MyContext";
import AppImage from "@/components/ui/AppImage";
import { ScrollTo } from "@/functions/ScrollTo";
import Link from "next/link";

export default function HeroPremium() {
  const { store } = useContext(MyContext);
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const catalog = {
    heroImage: store?.banner || "",
    heroAlt: store?.name || "Hero",
    logo: store?.urlPoster || "",
    logoAlt: store?.name || "",
    badge: store?.tipo || "",
    verified: store?.act_tf ?? false,
    seller: store?.email || "",
    name: store?.name || "",
    number: store?.cell || "",
    description: store?.parrrafo || "",
    tags: (store?.categorias || []).map((c) => c.name || ""),
    stats: [
      { value: store?.visitas ?? 0, unit: "", label: "Visitas" },
      {
        value: store?.comentTienda?.promedio?.toFixed(1) ?? "—",
        unit: "★",
        label: "Valoración",
      },
      { value: store?.comentTienda?.total ?? 0, unit: "", label: "Reseñas" },
    ],
    products: store?.products?.length ?? 0,
    priceRange: (() => {
      const prices = (store?.products || [])
        .map((p: { price: number }) => p.price)
        .filter(Boolean);
      if (!prices.length) return "—";
      return `${Math.min(...prices)} – ${Math.max(...prices)} ${
        store?.moneda?.find(
          (m: { defecto: boolean; nombre: string }) => m.defecto,
        )?.nombre ?? ""
      }`;
    })(),
  };

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Hero background */}
      <div className="absolute inset-0">
        <AppImage
          src={catalog.heroImage}
          alt={catalog.heroAlt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,13,20,0.5) 0%, rgba(13,13,20,0.3) 40%, rgba(13,13,20,0.85) 75%, rgba(13,13,20,1) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(13,13,20,0.6) 0%, transparent 50%, rgba(13,13,20,0.3) 100%)",
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,240,232,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,232,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col justify-end min-h-screen pb-16 px-5 pt-16">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            {/* Left: Logo + Info */}
            <div className="flex-1">
              <h1
                className="font-display font-bold leading-tight mb-2"
                style={{
                  fontSize: "clamp(2rem, 7vw, 5.5rem)",
                  color: "#F5F0E8",
                  textShadow: "0 4px 24px rgba(0,0,0,0.5)",
                }}
              >
                {catalog.name}
              </h1>

              <p
                className="text-xs font-light mb-4 max-w-lg line-clamp-5 leading-relaxed"
                style={{ color: "rgba(245,240,232,0.7)", lineHeight: "1.7" }}
              >
                {catalog.description}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300"
                  style={{
                    background: "#C84B31",
                    color: "#F5F0E8",
                    boxShadow: "0 0 28px rgba(200,75,49,0.4)",
                  }}
                  onClick={() => ScrollTo("products")}
                >
                  Ver todos los productos
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
                </button>
                <Link
                  href={`https://wa.me/${catalog.number}?text=Hola!%20Estoy%20interesado%20en%20conocer%20más%20sobre%20tus%20productos.`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300"
                  style={{
                    background: "rgba(245,240,232,0.06)",
                    border: "1px solid rgba(245,240,232,0.12)",
                    color: "#F5F0E8",
                    backdropFilter: "blur(8px)",
                  }}
                >
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Contactar vendedor
                </Link>
              </div>
            </div>

            {/* Right: Stats card */}
            <div
              className="shrink-0 rounded-2xl p-4 w-full lg:w-60"
              style={{
                background: "rgba(13,13,20,0.75)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(245,240,232,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div className="space-y-2">
                {catalog.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span
                        className="font-display text-3xl font-bold"
                        style={{ color: "#F5F0E8" }}
                      >
                        {stat.value}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(245,240,232,0.4)" }}
                      >
                        {stat.unit}
                      </span>
                    </div>
                    <p
                      className="text-xs uppercase tracking-wider"
                      style={{ color: "rgba(245,240,232,0.4)" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: "1px solid rgba(245,240,232,0.06)",
                    paddingTop: "16px",
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: "rgba(245,240,232,0.4)" }}
                  >
                    Productos
                  </p>
                  <p
                    className="font-display text-2xl font-bold"
                    style={{ color: "#E8A838" }}
                  >
                    {catalog.products}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: "rgba(245,240,232,0.4)" }}
                  >
                    Rango de precios
                  </p>
                  <p
                    className="text-base font-semibold"
                    style={{ color: "#F5F0E8" }}
                  >
                    {catalog.priceRange}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500"
        style={{ opacity: scrolled ? 0 : 1 }}
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(245,240,232,0.35)" }}
        >
          Scroll
        </span>
        <div
          className="w-px h-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(245,240,232,0.4), transparent)",
            animation: "fadeUp 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
