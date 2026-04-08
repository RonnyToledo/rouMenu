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

  useEffect(() => {
    if (!sectionRef.current) return;
    // Reveal cards as they enter viewport
    const cards = sectionRef.current.querySelectorAll<HTMLElement>(".reveal");
    cards.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      setTimeout(() => {
        el.style.transition = `opacity 0.45s ease ${i * 50}ms, transform 0.45s ease ${i * 50}ms`;
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

      {/* Results count */}
      <div className="flex items-center justify-between mt-6 mb-6">
        <p className="text-sm" style={{ color: "rgba(90,55,20,0.45)" }}>
          <span style={{ color: "#1A1208", fontWeight: 600 }}>
            {filtered.length}
          </span>{" "}
          catálogos encontrados
        </p>
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: "rgba(90,55,20,0.32)" }}
        >
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
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="12" y1="18" x2="12" y2="18" />
          </svg>
          Ordenar por relevancia
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((catalog, idx) => (
            <CatalogCard
              key={catalog.UUID}
              catalog={catalog}
              featured={idx === 0 && activeType === "all" && searchQuery === ""}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3
            className="font-display text-2xl font-semibold mb-2"
            style={{ color: "#1A1208" }}
          >
            No encontramos catálogos
          </h3>
          <p className="text-sm" style={{ color: "rgba(90,55,20,0.45)" }}>
            Intenta con otra búsqueda o tipo
          </p>
          <button
            onClick={() => {
              setActiveType("all");
              setSearchQuery("");
            }}
            className="mt-4 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{
              background: "rgba(200,75,49,0.08)",
              border: "1.5px solid rgba(200,75,49,0.25)",
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
