"use client";

import React, { useState, useEffect, useRef } from "react";
import CatalogCard from "./CatalogCard";
import CatalogFilters from "./CatalogFilters";
import type {
  AllCatalogItem,
  CatalogTypeItem,
} from "@/types/HomeContentInterface";

interface CatalogsGridProps {
  catalogs?: AllCatalogItem[];
  types?: CatalogTypeItem[];
  totalCount?: number;
}

export default function CatalogsGrid({
  catalogs = [],
  types = [],
  totalCount,
}: CatalogsGridProps) {
  const [activeType, setActiveType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);

  const filtered = catalogs.filter((cat) => {
    const matchesType =
      activeType === "all" ||
      cat.tipo?.toLowerCase() === activeType.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      cat.name?.toLowerCase().includes(q) ||
      cat.tipo?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q) ||
      cat.provincia?.toLowerCase().includes(q) ||
      cat.municipio?.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  // Animate cards every time filtered list changes
  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll<HTMLElement>(".reveal");
    cards.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      setTimeout(() => {
        el.style.transition = `opacity 0.45s ease ${i * 45}ms, transform 0.45s ease ${i * 45}ms`;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 60);
    });
  }, [filtered]);

  return (
    <div ref={sectionRef}>
      <CatalogFilters
        types={types}
        activeType={activeType}
        onTypeChange={setActiveType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={totalCount}
      />

      {/* ── Results meta ── */}
      <div className="flex items-center justify-between mt-6 mb-6">
        <p className="text-xs" style={{ color: "rgba(255,248,240,0.28)" }}>
          <span
            className="font-semibold"
            style={{ color: "rgba(255,248,240,0.75)" }}
          >
            {filtered.length}
          </span>{" "}
          catálogos encontrados
        </p>

        <div
          className="flex items-center gap-1.5 text-[11px]"
          style={{ color: "rgba(255,248,240,0.22)" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="12" y1="18" x2="12" y2="18" />
          </svg>
          Ordenar por relevancia
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((catalog, idx) => (
            <CatalogCard
              key={catalog.UUID}
              catalog={catalog}
              featured={idx === 0 && activeType === "all" && searchQuery === ""}
            />
          ))}
        </div>
      ) : (
        /* ── Empty state ── */
        <div className="text-center py-24">
          <div
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: "rgba(200,75,49,0.08)",
              border: "1px solid rgba(200,75,49,0.18)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(200,75,49,0.6)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <h3
            className="font-serif text-xl font-semibold mb-2"
            style={{ color: "#FFF8F0" }}
          >
            No encontramos catálogos
          </h3>
          <p
            className="text-sm mb-6"
            style={{ color: "rgba(255,248,240,0.32)" }}
          >
            Intenta con otra búsqueda o tipo
          </p>
          <button
            onClick={() => {
              setActiveType("all");
              setSearchQuery("");
            }}
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "rgba(200,75,49,0.08)",
              border: "1px solid rgba(200,75,49,0.28)",
              color: "#C84B31",
            }}
          >
            Ver todos los catálogos
          </button>
        </div>
      )}
    </div>
  );
}
