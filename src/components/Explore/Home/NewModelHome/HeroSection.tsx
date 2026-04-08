"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import { HeroItem, HomeCatalogItem } from "@/types/HomeContentInterface";

interface HeroSectionProps {
  hero?: HeroItem[];
  catalogs?: HomeCatalogItem[];
}

export default function HeroSection({
  hero = [],
  catalogs = [],
}: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const floatingCatalogs = catalogs.slice(0, 3).map((cat, i) => ({
    ...cat,
    rotate: ["-3deg", "4deg", "-1.5deg"][i] ?? "0deg",
    animClass:
      ["animate-float-a", "animate-float-b", "animate-float-c"][i] ??
      "animate-float-a",
    cardStyle: [
      { top: "8%", right: "4%", width: "196px" },
      { top: "36%", right: "1%", width: "176px" },
      { top: "64%", right: "7%", width: "168px" },
    ][i] ?? { top: "10%", right: "5%", width: "190px" },
  }));

  const heroItem = hero[0];

  useEffect(() => {
    // Small delay so transition is visible
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fadeIn = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  return (
    <header
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(150deg, #FDF8F2 0%, #FFF5EC 45%, #FEF0E4 100%)",
      }}
    >
      {/* Warm background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: "700px",
            height: "700px",
            top: "-250px",
            left: "-200px",
            background:
              "radial-gradient(circle, rgba(200,75,49,0.08) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            bottom: "-180px",
            right: "-80px",
            background:
              "radial-gradient(circle, rgba(232,168,56,0.12) 0%, transparent 65%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "350px",
            height: "350px",
            top: "30%",
            left: "35%",
            background:
              "radial-gradient(circle, rgba(200,75,49,0.05) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(160,100,50,0.1) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 pt-28 pb-16 w-full">
        {/* Max width capped so content never bleeds under the floating cards on large screens */}
        <div className="max-w-2xl lg:max-w-[55%]">
          {/* Eyebrow pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: "rgba(200,75,49,0.08)",
              border: "1px solid rgba(200,75,49,0.2)",
              ...fadeIn(0),
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: "#C84B31",
                boxShadow: "0 0 6px rgba(200,75,49,0.5)",
              }}
            />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#C84B31" }}
            >
              RouMenu · Servicios de Catalogos
            </span>
          </div>

          {/* Main headline */}
          <h1
            className="font-display leading-none mb-6"
            style={{
              fontSize: "clamp(3.2rem, 8.5vw, 7rem)",
              lineHeight: "0.92",
              color: "#1A1208",
              ...fadeIn(0.12),
            }}
          >
            Los mejores
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #C84B31 0%, #E07840 45%, #E8A838 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              catálogos
            </span>
            <br />
            <span
              className="italic font-light"
              style={{ fontSize: "0.88em", color: "#5C3D1E", opacity: 0.65 }}
            >
              de Ventas
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg  leading-relaxed mb-10 max-w-xl"
            style={{ color: "rgba(90,55,20,0.85)", ...fadeIn(0.22) }}
          >
            {
              "Descubre ofertas reales, compara precios y encuentra los mejores catálogos de venta del mercado cubano — todo en un solo lugar."
            }
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4" style={fadeIn(0.32)}>
            <Link
              href="/catalogs"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              style={{
                background: "#C84B31",
                color: "#FFF8F0",
                boxShadow: "0 4px 20px rgba(200,75,49,0.28)",
              }}
            >
              Explorar Catálogos
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
            </Link>
            <a
              href="#ofertas"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "rgba(90,55,20,0.06)",
                border: "1.5px solid rgba(90,55,20,0.15)",
                color: "#3D2010",
              }}
            >
              Ver Ofertas
            </a>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap gap-8 mt-12 pt-10"
            style={{
              borderTop: "1px solid rgba(90,55,20,0.1)",
              ...fadeIn(0.44),
            }}
          >
            {[
              {
                value: catalogs.length > 0 ? `${catalogs.length}+` : "340+",
                label: "Catálogos activos",
              },
              { value: "12K+", label: "Productos listados" },
              {
                value: heroItem ? heroItem.visitas.toLocaleString() : "8.5K",
                label: "Compradores activos",
              },
            ].map((stat) => (
              <div key={stat.label}>
                <span
                  className="block font-display text-3xl font-bold"
                  style={{ color: "#1A1208" }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "rgba(90,55,20,0.42)" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating catalog cards — vertical column, always visible and comfortable */}
      <style>{`
        @keyframes floatA { 0%,100%{transform:translateY(0px) rotate(-2.5deg)} 50%{transform:translateY(-10px) rotate(-2.5deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0px) rotate(3deg)} 50%{transform:translateY(-14px) rotate(3deg)} }
        @keyframes floatC { 0%,100%{transform:translateY(0px) rotate(-1.5deg)} 50%{transform:translateY(-8px) rotate(-1.5deg)} }
        .float-card-a { animation: floatA 5s ease-in-out infinite; }
        .float-card-b { animation: floatB 6.5s ease-in-out infinite 0.8s; }
        .float-card-c { animation: floatC 5.8s ease-in-out infinite 1.6s; }
      `}</style>
      <div
        className="absolute flex flex-col justify-center gap-5 pointer-events-none opacity-50"
        style={{
          right: "3%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "210px",
        }}
      >
        {floatingCatalogs.map((cat, i) => (
          <div
            key={cat.UUID}
            className={`floating-card ${["float-card-a", "float-card-b", "float-card-c"][i]}`}
            style={{
              opacity: mounted ? 1 : 0,
              transition: `opacity 0.7s ease ${0.5 + i * 0.18}s`,
              willChange: "transform",
            }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,253,250,0.92)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(200,120,60,0.13)",
                boxShadow:
                  "0 16px 48px rgba(100,50,15,0.14), 0 2px 8px rgba(100,50,15,0.07)",
              }}
            >
              {/* Image */}
              <div
                className="relative"
                style={{ height: "120px", overflow: "hidden" }}
              >
                <AppImage
                  src={cat.image}
                  alt={`Catálogo ${cat.name}`}
                  fill
                  className="object-cover"
                  sizes="210px"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(255,248,240,0.5) 0%, transparent 60%)",
                  }}
                />
                <span
                  className="absolute top-2 left-2 font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "#C84B31",
                    color: "#FFF8F0",
                    fontSize: "9px",
                    letterSpacing: "0.07em",
                  }}
                >
                  {cat.tipo.toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="px-3 py-2.5">
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: "#1A1208" }}
                >
                  {cat.name}
                </p>
                <p
                  style={{
                    color: "rgba(90,55,20,0.48)",
                    fontSize: "10px",
                    marginTop: "1px",
                  }}
                >
                  {cat.provincia}
                </p>

                {/* Star + visitas row */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
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
                      className="font-bold"
                      style={{ color: "#C84B31", fontSize: "11px" }}
                    >
                      {cat.avg_star.toFixed(1)}
                    </span>
                  </div>
                  <span
                    style={{ color: "rgba(90,55,20,0.38)", fontSize: "10px" }}
                  >
                    {cat.visitas} visitas
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "rgba(90,55,20,0.32)" }}
        >
          Scroll
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(90,55,20,0.28)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </header>
  );
}
