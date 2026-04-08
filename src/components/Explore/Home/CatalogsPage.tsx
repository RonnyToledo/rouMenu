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
      <main style={{ minHeight: "100vh", background: "#FFF8F0" }}>
        {/* Page hero header */}
        <div
          className="relative py-16 px-5 overflow-hidden"
          style={{
            background:
              "linear-gradient(150deg, #FDF8F2 0%, #FFF5EC 50%, #FEF0E4 100%)",
          }}
        >
          {/* Warm orb */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "600px",
              height: "300px",
              top: "-80px",
              left: "50%",
              transform: "translateX(-50%)",
              background:
                "radial-gradient(circle, rgba(200,75,49,0.08) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(160,100,50,0.09) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
                  style={{
                    background: "rgba(200,75,49,0.08)",
                    border: "1px solid rgba(200,75,49,0.2)",
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
                    {total > 0
                      ? `${total}+ Catálogos activos`
                      : "Catálogos activos"}
                  </span>
                </div>

                <h1
                  className="font-display font-bold leading-none"
                  style={{
                    fontSize: "clamp(3rem, 7vw, 5.5rem)",
                    lineHeight: "0.93",
                    color: "#1A1208",
                  }}
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
              </div>

              <p
                className="text-sm font-light max-w-xs leading-relaxed"
                style={{ color: "rgba(90,55,20,0.65)" }}
              >
                Explora, filtra y descubre los mejores catálogos del mercado.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-5 py-12">
          {spotlight.length > 0 && <FeaturedSpotlight spotlight={spotlight} />}
          <CatalogsGrid catalogs={catalogs} types={types} totalCount={total} />
        </div>
      </main>
    </>
  );
}
