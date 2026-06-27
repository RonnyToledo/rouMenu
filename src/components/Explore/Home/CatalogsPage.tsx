"use client";

import React from "react";
import FeaturedSpotlight from "./NewModelCatalogs/FeaturedSpotlight";
import CatalogsGrid from "./NewModelCatalogs/CatalogsGrid";
import { useApp } from "@/context/AppContext";
import type { HomeContentData } from "@/types/HomeContentInterface";

export default function CatalogsPage() {
  const { generalData } = useApp();
  const pageData = generalData as HomeContentData | null;

  const spotlight = pageData?.spotlight ?? [];
  const catalogs = pageData?.all_catalogs ?? [];
  const types = pageData?.catalog_types ?? [];
  const total = pageData?.catalog_total_count ?? 0;

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />

      <main className="min-h-screen bg-[#0D0D0D]">
        {/* ── Hero header ────────────────────────────────── */}
        <div className="relative overflow-hidden border-b border-[#242424] pt-20 pb-14 px-5">
          {/* grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(#242424 1px, transparent 1px), linear-gradient(90deg, #242424 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          {/* red glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 520,
              height: 520,
              top: -200,
              left: "50%",
              transform: "translateX(-50%)",
              background:
                "radial-gradient(circle, rgba(200,75,49,0.16) 0%, transparent 70%)",
              filter: "blur(70px)",
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* pill */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7"
              style={{
                background: "rgba(200,75,49,0.1)",
                border: "1px solid rgba(200,75,49,0.28)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  background: "#C84B31",
                  boxShadow: "0 0 7px #C84B31",
                }}
              />
              <span
                className="text-[10px] font-bold tracking-[0.14em] uppercase"
                style={{ color: "#C84B31" }}
              >
                {total > 0
                  ? `${total}+ catálogos activos`
                  : "Catálogos activos"}
              </span>
            </div>

            <h1
              className="font-serif font-bold leading-[0.92] mb-5"
              style={{ fontSize: "clamp(3rem, 9vw, 5rem)", color: "#FFF8F0" }}
            >
              Todos los
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
                Catálogos
              </span>
            </h1>

            <p
              className="text-sm font-light leading-relaxed max-w-xs"
              style={{ color: "rgba(255,248,240,0.45)" }}
            >
              Explora, filtra y descubre los mejores catálogos del mercado.
            </p>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-5 py-12">
          {spotlight.length > 0 && <FeaturedSpotlight spotlight={spotlight} />}
          <CatalogsGrid catalogs={catalogs} types={types} totalCount={total} />
        </div>
      </main>
    </>
  );
}
