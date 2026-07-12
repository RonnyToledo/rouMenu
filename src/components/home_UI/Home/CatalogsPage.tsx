"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import type {
  AllCatalogItem,
  HomeContentData,
  ProductItem,
  SpotlightItem,
  TopPostItem,
  TopMunicipioItem,
  TopSalesCatalogItem,
  TrendingCatalogItem,
} from "@/types/HomeContentInterface";
import {
  FaFire,
  FaMapMarkerAlt,
  FaSearch,
  FaComment,
  FaTools,
} from "react-icons/fa";
import {
  MdVerified,
  MdLocalShipping,
  MdDevices,
  MdOutlineTrendingUp,
  MdOutlineCoffeeMaker,
  MdOutlineRestaurantMenu,
  MdMonetizationOn,
} from "react-icons/md";
import { IoColorPaletteOutline } from "react-icons/io5";
import { FaMedrt, FaMoneyBillTransfer } from "react-icons/fa6";
import { GiClothes } from "react-icons/gi";
/* ─── tokens (tema white) ────────────────────────────────
   Paleta propia de esta página (coral/gold), llevada a claro.
──────────────────────────────────────────────────────────*/
const C = {
  primary: "#C84B31",
  primaryDark: "#A83A24",
  gold: "#E8A838",
  goldText: "#9C6A16",
  onSurface: "#1A1613",
  onSurfaceVariant: "#6B5F56",
  outlineVariant: "#E7E0D6",
  surfaceContainer: "#F6F2EC",
  surfaceContainerHigh: "#EFE8DE",
  background: "#FFFFFF",
};

const CONTAINER = "max-w-2xl mx-auto px-3";

/* ─── helpers ─────────────────────────────────────────── */
const fmt = (n: number | string | null | undefined) =>
  n === null || n === undefined ? "—" : `$${Number(n).toLocaleString()}`;

const nfmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;

const growthPct = (curr: number, prev: number) => {
  if (!prev) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

const isRecent = (createdAt?: string, days = 14) => {
  if (!createdAt) return false;
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
};

export const TIPO_ICON: Record<string, React.ElementType> = {
  Maquillaje: IoColorPaletteOutline,
  Cafetería: MdOutlineCoffeeMaker,
  Restaurante: MdOutlineRestaurantMenu,
  Farmacia: FaMedrt,
  Ferretería: FaTools,
  Remesas: FaMoneyBillTransfer,
  Ropa: GiClothes,
  Tecnología: MdDevices,
};
export const iconFor = (tipo?: string) =>
  TIPO_ICON[tipo ?? ""] ?? MdMonetizationOn;

/* ══════════════════════════════════════════════════════════
   HERO — pill con total real + buscador (placeholder dinámico
   usando random_title, para que nunca se vea vacío/genérico)
══════════════════════════════════════════════════════════ */
function HeroHeader({
  total,
  randomTitle,
  search,
  onSearch,
}: {
  total: number;
  randomTitle?: string;
  search: string;
  onSearch: (v: string) => void;
}) {
  return (
    <div className="relative overflow-hidden border-b border-[#E7E0D6] pt-14 pb-4 px-3">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(#EFE8DE 1px, transparent 1px), linear-gradient(90deg, #EFE8DE 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 520,
          height: 520,
          top: -240,
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgba(200,75,49,0.12) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7"
          style={{
            background: "rgba(200,75,49,0.08)",
            border: "1px solid rgba(200,75,49,0.28)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              background: C.primary,
              boxShadow: "0 0 7px rgba(200,75,49,0.6)",
            }}
          />
          <span
            className="text-[10px] font-bold tracking-[0.14em] uppercase"
            style={{ color: C.primary }}
          >
            {total > 0 ? `${total}+ catálogos activos` : "Catálogos activos"}
          </span>
        </div>

        <h1
          className="font-serif font-bold leading-[0.92] mb-5"
          style={{ fontSize: "clamp(3rem, 9vw, 5rem)", color: C.onSurface }}
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
          className="text-sm font-light leading-relaxed max-w-xs mb-6"
          style={{ color: C.onSurfaceVariant }}
        >
          Explora, filtra y descubre los mejores catálogos del mercado.
        </p>

        <div className="relative">
          <FaSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px]"
            style={{ color: C.onSurfaceVariant }}
          />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={
              randomTitle
                ? `Buscar, ej: "${randomTitle}"`
                : "Buscar catálogos..."
            }
            className="w-full rounded-full border border-[#E7E0D6] bg-white py-3 pl-10 pr-4 text-sm text-[#1A1613] placeholder:text-[#6B5F56]/60 outline-none transition-colors focus:border-[#C84B31]/50"
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SPOTLIGHT — negocio destacado (plan pro), datos reales:
   products_count, cnt_comments, satisfaction_pct, rango precio
══════════════════════════════════════════════════════════ */

function SpotlightSection({ spotlight }: { spotlight: SpotlightItem[] }) {
  const item = spotlight[0];
  if (!item) return null;

  return (
    <section className={`${CONTAINER} py-5`}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9C6A16]">
        ⭐ Catálogo destacado
      </p>
      <Link
        href={`/t/${item.sitioweb}`}
        className="group relative block h-64 overflow-hidden rounded-2xl border border-[#E7E0D6] shadow-sm transition-shadow hover:shadow-md"
      >
        {(item.banner || item.image) && (
          <Image
            src={item.banner || item.image}
            alt={item.name}
            width={700}
            height={500}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-black/20 to-transparent p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded bg-[#C84B31] px-2 py-1 text-[10px] font-bold uppercase text-white">
              {item.tipo}
            </span>
            {item.plan === "pro" && (
              <span className="rounded bg-[#E8A838] px-2 py-1 text-[10px] font-bold uppercase text-[#4A3200]">
                ⭐ Pro
              </span>
            )}
          </div>
          <h3 className="mb-1 font-serif text-2xl font-bold text-white">
            {item.name}
          </h3>
          <p className="mb-3 text-xs text-white/60">
            {item.provincia}
            {item.min_price !== undefined && item.max_price !== undefined
              ? ` · ${fmt(item.min_price)} - ${fmt(item.max_price)}`
              : ""}
          </p>
          <div className="flex flex-wrap gap-4 text-white">
            {item.products_count !== undefined && (
              <span className="text-[12px]">
                <b>{item.products_count}</b> productos
              </span>
            )}
            {item.cnt_comments !== undefined && (
              <span className="text-[12px]">
                <b>{item.cnt_comments}</b> reseñas
              </span>
            )}
            {item.satisfaction_pct !== undefined && (
              <span className="text-[12px]">
                <b>{item.satisfaction_pct}%</b> satisfacción
              </span>
            )}
          </div>
        </div>
      </Link>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   TRENDING — trending_catalogs: crecimiento real de views_7d
   vs views_prev_7d
══════════════════════════════════════════════════════════ */

function TrendingStrip({ items }: { items: TrendingCatalogItem[] }) {
  if (items.length === 0) return null;
  const top = [...items]
    .sort((a, b) => b.trend_score - a.trend_score)
    .slice(0, 6);

  return (
    <section className="py-5 px-4 border-t border-[#E7E0D6]">
      <div className={`${CONTAINER} mb-4 flex items-center gap-2`}>
        <FaFire className="text-[16px] text-[#C84B31]" />
        <h2 className="font-serif text-xl font-bold text-[#1A1613]">
          Tendencia esta semana
        </h2>
      </div>
      <div className="mx-0 flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-none md:scrollbar-auto">
        {top.map((c) => {
          const growth = growthPct(c.views_7d, c.views_prev_7d);
          return (
            <Link
              key={c.UUID}
              href={`/t/${c.sitioweb}`}
              className="group relative w-40 shrink-0 snap-start overflow-hidden rounded-xl border border-[#E7E0D6] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="h-28 w-full overflow-hidden">
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.name}
                    width={200}
                    height={160}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-3">
                <p
                  className="mb-1 text-xs font-bold text-[#1A1613]"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {c.name}
                </p>
                <p className="text-[10px] text-[#6B5F56]">
                  {nfmt(c.views_7d)} visitas
                </p>
                {growth > 0 && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded bg-[#C84B31]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#C84B31]">
                    <MdOutlineTrendingUp className="text-[11px]" />+{growth}%
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   TOP VENTAS 30d — top_sales_catalogs (revenue_30d, units_sold_30d)
══════════════════════════════════════════════════════════ */

function TopSalesSection({ items }: { items: TopSalesCatalogItem[] }) {
  if (items.length === 0) return null;
  const top = items.slice(0, 5);

  return (
    <section className={`${CONTAINER} py-8 border-t border-[#E7E0D6]`}>
      <h2 className="mb-4 font-serif text-xl font-bold text-[#1A1613]">
        Más Actividad · últimos 30 días
      </h2>
      <div className="space-y-2">
        {top.map((c, i) => (
          <Link
            key={c.UUID}
            href={`/t/${c.sitioweb}`}
            className="flex items-center gap-3 rounded-xl border border-[#E7E0D6] bg-white p-3 transition-colors hover:border-[#C84B31]/30"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                i === 0
                  ? "bg-[#E8A838] text-[#4A3200]"
                  : "bg-[#F6F2EC] text-[#6B5F56]"
              }`}
            >
              {i + 1}
            </span>
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
              {c.image && (
                <Image
                  src={c.image}
                  alt={c.name}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#1A1613]">
                {c.name}
              </p>
              <p className="text-[11px] text-[#6B5F56]">
                {c.units_sold_30d} unidades
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   PROVINCIAS — top_provinces (sitios_count, total_visitas,
   top_sites[])
══════════════════════════════════════════════════════════ */

function MunicipiosSection({ items }: { items: TopMunicipioItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="py-5 px-4 border-t border-[#E7E0D6]">
      <div className={`${CONTAINER} mb-4 flex items-center gap-2`}>
        <FaMapMarkerAlt className="text-[15px] text-[#C84B31]" />
        <h2 className="font-serif text-xl font-bold text-[#1A1613]">
          Explora por provincia
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-hide">
        {items.map((p) => (
          <div
            key={p.municipio}
            className="group block w-52 shrink-0 snap-start rounded-xl border border-[#E7E0D6] bg-white p-4 transition-shadow hover:shadow-md"
          >
            <Link href={`/location/${encodeURIComponent(p.municipio)}`}>
              <p className="mb-1 text-sm font-bold text-[#1A1613]">
                {p.municipio}
              </p>
              <p className="mb-3 text-[11px] text-[#6B5F56]">
                {p.sitios_count} {p.sitios_count === 1 ? "negocio" : "negocios"}{" "}
                · {nfmt(p.total_visitas)} visitas
              </p>
            </Link>

            <div className="flex -space-x-2">
              {p.top_sites.slice(0, 4).map((s) => (
                <a
                  key={s.UUID}
                  href={`/t/${s.sitioweb}`}
                  className="h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-[#F6F2EC]"
                  title={s.name}
                >
                  {s.image && (
                    <Image
                      src={s.image}
                      alt={s.name}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   CATEGORÍAS — featured_catalogs + popularCatalogs +
   catalogsYouMightLike (los 3 son categorías de producto,
   no tiendas, aunque el campo se llame distinto)
══════════════════════════════════════════════════════════ */
type CategoryChip = {
  id: string;
  name: string;
  image: string | null;
  visitas: number;
  store_id?: string;
  storeId?: string;
  store_sitioweb?: string;
  avg_product_star?: number;
  cat_score?: number;
  category_id?: string;
  category_name?: string;
};

function CategoryScroller({
  title,
  items,
  labelKey = "name",
  showStars = false,
}: {
  title: string;
  items: CategoryChip[];
  labelKey?: "name" | "category_name";
  showStars?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="py-5 px-4 mb-2">
      <h3 className="mb-3 px-5 text-xs font-bold uppercase tracking-widest text-[#6B5F56]">
        {title}
      </h3>
      <div className="flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-hide">
        {items.map((c, i) => {
          const sitioweb = c.store_sitioweb;
          const name = c[labelKey] ?? c.name ?? c.category_name;
          return (
            <Link
              key={c.id ?? c.category_id ?? i}
              href={sitioweb ? `/t/${sitioweb}` : "/catalogs"}
              className="group w-28 shrink-0 snap-start text-center"
            >
              <div className="mb-2 h-24 w-24 mx-auto overflow-hidden rounded-2xl border border-[#E7E0D6] bg-[#F6F2EC]">
                {c.image && (
                  <Image
                    src={c.image}
                    alt={name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <p
                className="text-[11px] font-semibold text-[#1A1613]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {name}
              </p>
              {showStars &&
                c.avg_product_star !== undefined &&
                c.avg_product_star > 0 && (
                  <p className="text-[10px] text-[#9C6A16]">
                    ★ {c.avg_product_star.toFixed(1)}
                  </p>
                )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PRODUCTOS POPULARES — top_posts (con fallback a products)
══════════════════════════════════════════════════════════ */

function TopProductsSection({
  items,
}: {
  items: TopPostItem[] | ProductItem[];
}) {
  if (items.length === 0) return null;
  const top = items.slice(0, 6);

  return (
    <section className={`${CONTAINER} py-5 px-4 border-t border-[#E7E0D6]`}>
      <h2 className="mb-4 font-serif text-xl font-bold text-[#1A1613]">
        Productos más populares
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {top.map((p, i) => (
          <Link
            key={p.productId ?? i}
            href={`/t/${p.store_sitioweb ?? p.sitioweb}/producto/${p.productId}`}
            className="group overflow-hidden rounded-xl border border-[#E7E0D6] bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square overflow-hidden bg-[#F6F2EC]">
              {p.image && (
                <Image
                  src={p.image}
                  alt={p.title}
                  width={300}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              {p.has_available === false && (
                <span className="absolute left-2 top-2 rounded bg-[#1A1613]/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  Agotado
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="mb-0.5 text-[10px] uppercase tracking-wide text-[#6B5F56]">
                {p.store_name}
              </p>
              <p
                className="mb-1 text-xs font-bold text-[#1A1613]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {p.title}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#C84B31]">
                  {fmt(p.price)}
                </span>
                {p.avg_star > 0 && (
                  <span className="text-[10px] text-[#9C6A16]">
                    ★ {p.avg_star.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   GRID PRINCIPAL — all_catalogs, con filtro por tipo
   (catalog_types), búsqueda y orden
══════════════════════════════════════════════════════════ */

type SortKey = "relevance" | "sales" | "recent" | "rating";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Relevancia" },
  { key: "sales", label: "Más Actividad" },
  { key: "recent", label: "Más recientes" },
  { key: "rating", label: "Mejor valorados" },
];

function CatalogsGridSection({
  catalogs,
  types,
  total,
  search,
}: {
  catalogs: AllCatalogItem[];
  types: { tipo: string; count: number }[];
  total: number;
  search: string;
}) {
  const [activeType, setActiveType] = useState<string>("Todos");
  const [sort, setSort] = useState<SortKey>("relevance");
  const filtered = useMemo(() => {
    let list = catalogs;
    if (activeType !== "Todos")
      list = list.filter((c) => c.tipo === activeType);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    const sorted = [...list];
    switch (sort) {
      case "sales":
        sorted.sort((a, b) => (b.revenue_30d ?? 0) - (a.revenue_30d ?? 0));
        break;
      case "recent":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime(),
        );
        break;
      case "rating":
        sorted.sort((a, b) => (b.avg_star ?? 0) - (a.avg_star ?? 0));
        break;
      default:
        sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
    return sorted;
  }, [catalogs, activeType, search, sort]);

  return (
    <section className={`${CONTAINER} py-5 px-4 border-t border-[#E7E0D6]`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-[#1A1613]">
          Todos los catálogos{" "}
          {total > 0 && <span className="text-[#6B5F56]">({total})</span>}
        </h2>
      </div>

      {/* pills de tipo */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveType("Todos")}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeType === "Todos"
              ? "border-[#C84B31] bg-[#C84B31] text-white"
              : "border-[#E7E0D6] bg-white text-[#6B5F56] hover:border-[#C84B31]/40"
          }`}
        >
          Todos ({total})
        </button>
        {types.map((t) => {
          const Icon = iconFor(t.tipo) as React.ElementType;
          return (
            <button
              key={t.tipo}
              onClick={() => setActiveType(t.tipo)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeType === t.tipo
                  ? "border-[#C84B31] bg-[#C84B31] text-white"
                  : "border-[#E7E0D6] bg-white text-[#6B5F56] hover:border-[#C84B31]/40"
              }`}
            >
              <Icon
                className="material-symbols-outlined text-[14px]"
                style={{ fontSize: 14 }}
              />
              {t.tipo} ({t.count})
            </button>
          );
        })}
      </div>

      {/* orden */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-[11px] text-[#6B5F56]">Ordenar:</span>
        <div className="flex flex-wrap gap-1.5">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                sort === s.key
                  ? "bg-[#F6F2EC] text-[#C84B31]"
                  : "text-[#6B5F56] hover:bg-[#F6F2EC]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#6B5F56]">
          No encontramos catálogos con esos filtros.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((c) => (
            <Link
              key={c.UUID}
              href={`/t/${c.sitioweb}`}
              className="group overflow-hidden rounded-2xl border border-[#E7E0D6] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-36 w-full overflow-hidden bg-[#F6F2EC]">
                {(c.banner || c.image) && (
                  <Image
                    src={c.banner || c.image}
                    alt={c.name}
                    width={400}
                    height={280}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                  {c.plan_badge && (
                    <span className="rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-[#9C6A16] shadow-sm">
                      {c.plan_badge}
                    </span>
                  )}
                  {isRecent(c.created_at) && (
                    <span className="rounded bg-[#C84B31] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      Nuevo
                    </span>
                  )}
                </div>
                {(c.trend_score ?? 0) > 15 && (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-[#C84B31] shadow-sm">
                    <FaFire className="text-[9px]" /> Trending
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <div className="mb-1 flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-[#1A1613]">
                    {c.name}
                  </p>
                  {c.verified && (
                    <MdVerified className="shrink-0 text-[13px] text-[#C84B31]" />
                  )}
                </div>
                <p className="mb-2 flex items-center gap-1 text-[11px] text-[#6B5F56]">
                  <FaMapMarkerAlt className="text-[9px]" />
                  {c.municipio ? `${c.municipio}, ${c.provincia}` : c.provincia}
                  {c.domicilio && (
                    <MdLocalShipping className="ml-1 text-[12px] text-[#6B5F56]" />
                  )}
                </p>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C84B31]">
                    {c.min_price !== undefined && c.max_price !== undefined
                      ? `${fmt(c.min_price)} - ${fmt(c.max_price)}`
                      : ""}
                  </span>
                  {c.avg_star > 0 && (
                    <span className="text-[11px] text-[#9C6A16]">
                      ★ {c.avg_star.toFixed(1)} ({c.cnt_comments})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 border-t border-[#F0EBE3] pt-2 text-[10px] text-[#6B5F56]">
                  <span>{c.products_count} productos</span>
                  {c.orders_7d > 0 && <span>🔥 {c.orders_7d} pedidos/sem</span>}
                  {c.cnt_comments > 0 && (
                    <span className="flex items-center gap-0.5">
                      <FaComment className="text-[9px]" /> {c.cnt_comments}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════════ */
export default function CatalogsPage() {
  const { generalData } = useApp();
  const pageData = generalData as HomeContentData | null;
  const [search, setSearch] = useState("");

  const spotlight = (pageData?.spotlight ?? []) as SpotlightItem[];
  const allCatalogs = (pageData?.all_catalogs ?? []) as AllCatalogItem[];
  const types = pageData?.catalog_types ?? [];
  const total = pageData?.catalog_total_count ?? 0;
  const trending = (pageData?.trending_catalogs ?? []) as TrendingCatalogItem[];
  const topSales = (pageData?.top_sales_catalogs ??
    []) as TopSalesCatalogItem[];
  const municipio = (pageData?.top_municipios ?? []) as TopMunicipioItem[];
  const featuredCategories = (pageData?.featured_catalogs ??
    []) as CategoryChip[];
  const popularCategories = (pageData?.popularCatalogs ?? []) as CategoryChip[];
  const suggestedCategories = (pageData?.catalogsYouMightLike ??
    []) as CategoryChip[];
  const topPosts = (pageData?.top_posts ?? []) as TopPostItem[];
  const products = (pageData?.products ?? []) as ProductItem[];
  const randomTitle = pageData?.random_title as string | undefined;

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />

      <main className="min-h-screen bg-white">
        <HeroHeader
          total={total}
          randomTitle={randomTitle}
          search={search}
          onSearch={setSearch}
        />

        <SpotlightSection spotlight={spotlight} />
        <TrendingStrip items={trending} />
        <TopSalesSection items={topSales} />
        <MunicipiosSection items={municipio} />

        {(featuredCategories.length > 0 ||
          popularCategories.length > 0 ||
          suggestedCategories.length > 0) && (
          <section className="py-8 border-t border-[#E7E0D6]">
            <CategoryScroller
              title="Categorías destacadas"
              items={featuredCategories}
              showStars
            />
            <CategoryScroller
              title="Categorías populares"
              items={popularCategories}
            />
            <CategoryScroller
              title="Quizás te interese"
              items={suggestedCategories}
              labelKey="category_name"
            />
          </section>
        )}

        <TopProductsSection items={topPosts.length > 0 ? topPosts : products} />

        <CatalogsGridSection
          catalogs={allCatalogs}
          types={types}
          total={total}
          search={search}
        />
      </main>
    </>
  );
}
