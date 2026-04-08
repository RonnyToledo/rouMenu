"use client";

import React from "react";
import type { CatalogTypeItem } from "@/types/HomeContentInterface";

interface CatalogFiltersProps {
  types?: CatalogTypeItem[];
  activeType: string;
  onTypeChange: (t: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount?: number;
}

export default function CatalogFilters({
  types = [],
  activeType,
  onTypeChange,
  searchQuery,
  onSearchChange,
  totalCount,
}: CatalogFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(90,55,20,0.32)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar catálogos, tipos, provincias..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
          style={{
            background: "rgba(90,55,20,0.04)",
            border: "1.5px solid rgba(90,55,20,0.1)",
            color: "#1A1208",
            fontSize: "14px",
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-[#C84B31]"
            style={{ color: "rgba(90,55,20,0.3)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Type pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {/* Todos */}
        <button
          onClick={() => onTypeChange("all")}
          className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
          style={{
            background:
              activeType === "all" ? "#C84B31" : "rgba(90,55,20,0.05)",
            border:
              activeType === "all"
                ? "1.5px solid #C84B31"
                : "1.5px solid rgba(90,55,20,0.1)",
            color: activeType === "all" ? "#FFF8F0" : "rgba(90,55,20,0.55)",
            boxShadow:
              activeType === "all" ? "0 4px 14px rgba(200,75,49,0.22)" : "none",
          }}
        >
          Todos{totalCount ? ` (${totalCount})` : ""}
        </button>

        {types.map((t) => (
          <button
            key={t.tipo}
            onClick={() => onTypeChange(t.tipo)}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              background:
                activeType === t.tipo ? "#C84B31" : "rgba(90,55,20,0.05)",
              border:
                activeType === t.tipo
                  ? "1.5px solid #C84B31"
                  : "1.5px solid rgba(90,55,20,0.1)",
              color: activeType === t.tipo ? "#FFF8F0" : "rgba(90,55,20,0.55)",
              boxShadow:
                activeType === t.tipo
                  ? "0 4px 14px rgba(200,75,49,0.22)"
                  : "none",
            }}
          >
            {t.tipo}
            <span
              className="ml-1.5"
              style={{
                color:
                  activeType === t.tipo
                    ? "rgba(255,248,240,0.7)"
                    : "rgba(90,55,20,0.3)",
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
