"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import {
  AllCatalogItem,
  PlanItem,
  ProductItem,
  TopPostItem,
} from "@/types/HomeContentInterface";
import { MdOutlineReportProblem, MdOutlineTrendingUp } from "react-icons/md";
import { FaCheck, FaArrowRight } from "react-icons/fa";
import { FaBolt } from "react-icons/fa6";
import { iconFor } from "./CatalogsPage";
import { logoApp } from "@/lib/image";

/* ─── layout tokens (márgenes/paddings consistentes) ───── */
const SECTION_X = "px-4 sm:px-6 lg:px-8";
const SECTION_CONTAINER = "mx-auto max-w-[1200px]";
const SECTION_Y = "py-12 md:py-20";
const SECTION_Y_LG = "py-20 md:py-24";

/* ─── helpers ───────────────────────────────────────────── */
const fmt = (n: string | number | unknown) => `$${Number(n).toLocaleString()}`;
const nfmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;

/* ══════════════════════════════════════════════════════════
   SECTION — HERO
   Copy centrado en beneficio (no en "menú"), stats 100% reales
   derivadas de all_catalogs / catalog_total_count.
══════════════════════════════════════════════════════════ */
function HeroSection({
  catalogTotalCount,
  totalProducts,
  totalProvinces,
}: {
  catalogTotalCount: number;
  totalProducts: number;
  totalProvinces: number;
}) {
  return (
    <section
      id="inicio"
      className={`relative overflow-hidden ${SECTION_X} pb-5 pt-20 md:pb-24 md:pt-28`}
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,138,61,0.10) 0%, transparent 70%)",
      }}
    >
      <div
        className={`${SECTION_CONTAINER} grid items-center gap-12 lg:grid-cols-2`}
      >
        <div className="z-10">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E7E0D8] bg-[#F0EBE3] px-3 py-1">
            <FaBolt className="text-[12px] text-[#D9600A]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D9600A]">
              Plataforma de catálogos digitales
            </span>
          </div>

          <h1 className="mb-6 font-[Manrope] text-[30px] font-extrabold leading-[1.1] text-[#1A1613] sm:text-[56px] lg:text-[64px]">
            Tu negocio merece un catálogo digital{" "}
            <span className="italic text-[#D9600A]">que venda por ti.</span>
          </h1>

          <p className="mb-4 max-w-lg font-[Work_Sans] text-[12px] leading-[1.6] text-[#6B5F56]">
            Crea tu catálogo, gestiona inventario y recibe pedidos por WhatsApp
            desde un solo panel. Sin conocimientos técnicos, sin comisiones
            abusivas de terceros.
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            <Link
              href="https://rouadmin.vercel.app/createAccount"
              className="flex items-center gap-2 rounded-lg bg-[#FF8A3D] px-5 py-3 font-bold text-[#682D00] transition-shadow hover:shadow-[0_0_25px_rgba(255,138,61,0.35)]"
            >
              Crear mi catálogo gratis
              <FaArrowRight className="text-[28px] text-[#682D00]" />
            </Link>
            <Link
              href="/catalogs"
              className="rounded-lg border border-[#B0A69B] px-5 py-3 font-bold text-[#1A1613] transition-colors hover:bg-[#F5F1EB]"
            >
              Ver demostración
            </Link>
          </div>

          {/* stats reales — nunca inventadas */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[#E7E0D8] pt-4">
            <div>
              <p className="font-[Manrope] text-lg font-bold text-[#1A1613]">
                {catalogTotalCount > 0 ? `${nfmt(catalogTotalCount)}+` : "—"}
              </p>
              <p className="text-[6px] font-bold uppercase tracking-widest text-[#6B5F56]/70">
                Catálogos activos
              </p>
            </div>
            <div className="h-10 w-px bg-[#E7E0D8]" />
            <div>
              <p className="font-[Manrope] text-lg font-bold text-[#1A1613]">
                {totalProducts > 0 ? `${nfmt(totalProducts)}+` : "—"}
              </p>
              <p className="text-[6px] font-bold uppercase tracking-widest text-[#6B5F56]/70">
                Productos listados
              </p>
            </div>
            {totalProvinces > 0 && (
              <>
                <div className="h-10 w-px bg-[#E7E0D8]" />
                <div>
                  <p className="font-[Manrope] text-lg font-bold text-[#1A1613]">
                    {totalProvinces}
                  </p>
                  <p className="text-[6px] font-bold uppercase tracking-widest text-[#6B5F56]/70">
                    Provincias
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* mockup del panel — UI ilustrativa, no datos falsos */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-[32px] bg-[#FF8A3D]/10 blur-3xl" />
          <div className="relative rounded-xl border border-[#E7E0D8] bg-white p-2 shadow-xl">
            <div className="rounded-lg bg-[#FAF8F5] p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF8A3D]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FABD00]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E7E0D8]" />
                <span className="ml-2 text-[11px] text-[#6B5F56]/70">
                  Gestion de pedidos
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["Ventas", "Visitas", "Pedidos"].map((label, i) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[#E7E0D8] bg-white p-3"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[#6B5F56]/70">
                      {label}
                    </p>
                    <p className="mt-1 font-[Manrope] text-lg font-bold text-[#1A1613]">
                      {i === 0 ? "↑ 24%" : i === 1 ? "1.2k" : "38"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {[80, 55, 68].map((w, i) => (
                  <div key={i} className="h-2 rounded-full bg-[#E7E0D8]">
                    <div
                      className="h-2 rounded-full bg-linear-to-r from-[#FF8A3D] to-[#D9600A]"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-lg border border-[#E7E0D8] bg-white p-4 shadow-lg md:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FABD00]">
                <MdOutlineTrendingUp className="text-[#6A4E00]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1613]">
                  Panel en tiempo real
                </p>
                <p className="text-xs text-[#6B5F56]/70">Supabase Realtime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION — PROBLEMA / SOLUCIÓN
══════════════════════════════════════════════════════════ */
function ProblemSolutionSection() {
  return (
    <section
      className={`border-t border-[#E7E0D8] bg-[#FAF8F5] ${SECTION_X} ${SECTION_Y}`}
    >
      <div className={`${SECTION_CONTAINER} grid gap-10 md:grid-cols-2`}>
        <div className="rounded-xl border border-[#E7E0D8] bg-white p-4">
          <MdOutlineReportProblem className="mb-4 text-[28px] text-[#6B5F56]/70" />

          <h3 className="mb-3 font-[Manrope] text-md font-bold text-[#1A1613]">
            Vender por WhatsApp sin catálogo es caos
          </h3>
          <p className="text-base leading-relaxed text-[#6B5F56]">
            Fotos sueltas, precios desactualizados, clientes preguntando
            disponibilidad uno por uno. Pierdes ventas mientras respondes
            mensajes que un catálogo resolvería solo.
          </p>
        </div>
        <div className="rounded-md border border-[#D9600A]/25 bg-[#D9600A]/5 p-4">
          <FaCheck className="mb-4 text-[28px] text-[#D9600A]" />

          <h3 className="mb-3 font-[Manrope] text-xl font-bold text-[#1A1613]">
            Un enlace. Todo tu catálogo. Siempre al día.
          </h3>
          <p className="text-base leading-relaxed text-[#6B5F56]">
            Publica productos con precio, stock y variantes. Comparte un solo
            enlace por WhatsApp o Instagram. Cuando algo se agota o cambia de
            precio, se actualiza para todos al instante.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION — CÓMO FUNCIONA
══════════════════════════════════════════════════════════ */
const STEPS = [
  {
    n: 1,
    title: "Crea tu cuenta",
    desc: "Regístrate en segundos. Solo necesitas el nombre de tu negocio y tu correo. Sin tarjetas de crédito.",
  },
  {
    n: 2,
    title: "Sube tus productos",
    desc: "Agrega fotos, precios, variantes y stock. Organiza por categorías para que tus clientes encuentren todo fácil.",
  },
  {
    n: 3,
    title: "Comparte y vende",
    desc: "Obtén tu enlace personalizado y compártelo en Instagram, WhatsApp o código QR en tu local.",
  },
];

function HowItWorksSection() {
  return (
    <section
      className={`border-t border-[#E7E0D8] ${SECTION_X} ${SECTION_Y}`}
      id="producto"
    >
      <div
        className={`${SECTION_CONTAINER} grid items-center gap-10 lg:grid-cols-2`}
      >
        <div>
          <p className="mb-4 text-[12px] font-bold uppercase tracking-widest text-[#D9600A]">
            Cómo funciona
          </p>
          <h2 className="mb-8 font-[Manrope] text-[30px] font-bold leading-tight text-[#1A1613] md:text-[44px]">
            Tu catálogo online en{" "}
            <span className="italic text-[#D9600A]">3 simples pasos</span>
          </h2>
          <div className="space-y-10">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-[Manrope] text-[22px] font-bold ${
                    s.n === 1
                      ? "bg-[#FF8A3D] text-[#682D00]"
                      : "border border-[#E7E0D8] bg-[#F0EBE3] text-[#D9600A]"
                  }`}
                >
                  {s.n}
                </div>
                <div>
                  <h4 className="mb-1.5 font-[Manrope] text-md font-bold text-[#1A1613]">
                    {s.title}
                  </h4>
                  <p className="text-[#6B5F56] text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* features list, con iconos, reemplaza "productos falsos" */}
        <div className="rounded-2xl border border-[#E7E0D8] bg-[#FAF8F5] p-4">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-widest text-[#6B5F56]/70">
            Todo incluido en tu panel
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Variantes y stock",
              "Descuentos por cantidad",
              "Cupones",
              "Roles de equipo",
              "Estadísticas",
              "Multi moneda",
              "Blog",
              "Comentarios",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 rounded-lg border border-[#E7E0D8] bg-white px-3 py-2.5"
              >
                <FaCheck className="text-[16px] text-[#D9600A]" />

                <span className="text-xs text-[#6B5F56]">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION — CATÁLOGOS DESTACADOS (datos reales de all_catalogs)
══════════════════════════════════════════════════════════ */
function CatalogsSection({ catalogs = [] }: { catalogs: AllCatalogItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = catalogs.slice(0, 3);
  if (visible.length === 0) return null;

  return (
    <section
      className={`border-t border-[#E7E0D8] bg-[#FAF8F5] ${SECTION_X} ${SECTION_Y}`}
      id="catalogos"
    >
      <div className={SECTION_CONTAINER}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-2">
          <div className="max-w-2xl">
            <p className="mb-2 text-[8px] font-bold uppercase tracking-widest text-[#B98600]">
              Casos reales
            </p>
            <h2 className="font-[Manrope] text-[30px] font-bold text-[#1A1613] md:text-[44px]">
              Catálogos destacados
            </h2>
            <p className="mt-2 text-[#6B5F56] text-xs">
              Negocios que ya venden con RouMenu — datos reales, actualizados
              cada día.
            </p>
          </div>
          <Link
            href="/catalogs"
            className="flex items-center gap-2 font-bold text-[#D9600A] hover:underline"
          >
            Ver todos los catálogos
            <FaArrowRight className=" text-[16px] text-[#D9600A]" />
          </Link>
        </div>

        <div ref={ref} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visible.map((cat) => (
            <Link
              key={cat.UUID}
              href={`/t/${cat.sitioweb}`}
              className="group relative block h-80 overflow-hidden rounded-xl border border-[#E7E0D8] bg-[#F0EBE3] shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              {(cat.banner || cat.image) && (
                <Image
                  src={cat.banner || cat.image}
                  alt={cat.name}
                  width={500}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/85 via-black/25 to-transparent p-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-[#FF8A3D] px-2 py-1 text-[10px] font-bold uppercase text-[#682D00]">
                    {cat.tipo}
                  </span>
                  {cat.avg_star > 0 && (
                    <span className="flex items-center gap-1 text-[#FABD00]">
                      <span
                        className="text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-[13px] font-bold">
                        {cat.avg_star.toFixed(1)}
                      </span>
                    </span>
                  )}
                </div>
                <h4 className="mb-1 font-[Manrope] text-xl font-bold text-white">
                  {cat.name}
                </h4>
                <p className="mb-2 text-sm text-white/60">{cat.provincia}</p>
                {(cat.orders_7d > 0 || cat.revenue_30d > 0) && (
                  <p className="text-[12px] font-semibold text-[#FFB68D]">
                    {cat.orders_7d > 0
                      ? `🔥 ${cat.orders_7d} pedidos esta semana`
                      : `${fmt(cat.revenue_30d)} en ventas (30d)`}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION — TIPOS DE NEGOCIO (reemplaza "Sedes destacadas",
   viene de catalog_types real)
══════════════════════════════════════════════════════════ */
function BusinessTypesSection({
  types = [],
}: {
  types: { tipo: string; count: number }[];
}) {
  if (types.length === 0) return null;
  return (
    <section className={`border-t border-[#E7E0D8] ${SECTION_X} ${SECTION_Y}`}>
      <div className={SECTION_CONTAINER}>
        <p className="mb-4 text-[12px] font-bold uppercase tracking-widest text-[#D9600A]">
          Para todo tipo de negocio
        </p>
        <h2 className="mb-12 font-[Manrope] text-[36px] font-bold text-[#1A1613] md:text-[44px]">
          RouMenu se adapta a lo que vendes
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {types.map((t) => {
            const Icon = iconFor(t.tipo) as React.ElementType;
            return (
              <div
                key={t.tipo}
                className="rounded-xl border border-[#E7E0D8] bg-white p-6 shadow-sm transition-colors hover:border-[#D9600A]/40"
              >
                <Icon className="mb-3 block text-[28px] text-[#D9600A]" />

                <p className="font-[Manrope] font-bold text-[#1A1613]">
                  {t.tipo}
                </p>
                <p className="text-[12px] text-[#6B5F56]/70">
                  {t.count} {t.count === 1 ? "catálogo" : "catálogos"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION — PRODUCTOS DESTACADOS (top_posts reales)
══════════════════════════════════════════════════════════ */
function ProductsSection({
  products = [],
  top_posts = [],
}: {
  products: ProductItem[];
  top_posts: TopPostItem[];
}) {
  const items = (top_posts.length > 0 ? top_posts : products).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section
      className={`border-t border-[#E7E0D8] bg-[#FAF8F5] ${SECTION_X} ${SECTION_Y_LG}`}
    >
      <div className={SECTION_CONTAINER}>
        <div className="mb-14 text-center">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-widest text-[#B98600]">
            Lo más popular esta semana
          </p>
          <h2 className="font-[Manrope] text-[36px] font-bold text-[#1A1613] md:text-[44px]">
            Productos destacados
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          {items.map((item, i) => (
            <Link
              key={item.productId ?? i}
              href={`/t/${item.store_sitioweb ?? item.sitioweb}/producto/${item.productId}`}
              className="group overflow-hidden rounded-2xl border border-[#E7E0D8] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden">
                {item.image && (
                  <Image
                    src={item.image}
                    width={400}
                    height={400}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
              </div>
              <div className="p-6">
                <p className="mb-1 text-[11px] uppercase tracking-widest text-[#6B5F56]/70">
                  {item.store_name}
                </p>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h4
                    className="font-[Manrope] text-lg font-bold text-[#1A1613]"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </h4>
                  <span className="whitespace-nowrap font-bold text-[#D9600A]">
                    {fmt(item.price)}
                  </span>
                </div>
                {item.avg_star > 0 && (
                  <p className="text-[13px] text-[#6B5F56]/70">
                    ⭐ {item.avg_star.toFixed(1)} · {item.cnt_comments} reseñas
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION — PLANES
   plans es opcional: si no se pasa, la sección se omite en vez
   de inventar precios que no coinciden con plan_config real.
══════════════════════════════════════════════════════════ */

function PlansSection({ plans }: { plans?: PlanItem[] }) {
  if (!plans || plans.length === 0) return null;
  return (
    <section
      className={`border-t border-[#E7E0D8] ${SECTION_X} ${SECTION_Y_LG}`}
      id="planes"
    >
      <div className={SECTION_CONTAINER}>
        <div className="mb-14 text-center">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-widest text-[#D9600A]">
            Planes
          </p>
          <h2 className="font-[Manrope] text-[36px] font-bold text-[#1A1613] md:text-[44px]">
            Empieza gratis, crece cuando lo necesites
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans
            .filter((p) => p.id !== "trial")
            .map((p, i) => (
              <div
                key={p.id}
                className={`rounded-2xl border p-8 ${
                  i === 1
                    ? "border-[#D9600A]/40 bg-[#D9600A]/5"
                    : "border-[#E7E0D8] bg-white shadow-sm"
                }`}
              >
                <h3 className="mb-1 font-[Manrope] text-xl font-bold text-[#1A1613]">
                  {p.nombre}
                </h3>
                <p className="mb-6 font-[Manrope] text-3xl font-extrabold text-[#D9600A]">
                  {p.precio_mensual > 0 ? fmt(p.precio_mensual) : "Gratis"}
                  {p.precio_mensual > 0 && (
                    <span className="text-sm font-normal text-[#6B5F56]/70">
                      /mes
                    </span>
                  )}
                </p>
                <ul className="space-y-2.5 text-sm text-[#6B5F56]">
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-[16px] text-[#D9600A]" />
                    Hasta{" "}
                    {p.max_productos >= 0 ? p.max_productos : "Ilimitados"}{" "}
                    productos
                  </li>
                  {p.carrito && (
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-[16px] text-[#D9600A]" />
                      Carrito de compras
                    </li>
                  )}
                  {p.stocks && (
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-[16px] text-[#D9600A]" />
                      Control de inventario
                    </li>
                  )}
                  {p.analitycs && (
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-[16px] text-[#D9600A]" />
                      Estadísticas y analíticas
                    </li>
                  )}
                  {p.soporte_prioritario && (
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-[16px] text-[#D9600A]" />
                      Soporte prioritario
                    </li>
                  )}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION — CTA FINAL
══════════════════════════════════════════════════════════ */
function FinalCTASection({ catalogTotalCount }: { catalogTotalCount: number }) {
  return (
    <section className={`${SECTION_X} ${SECTION_Y_LG}`}>
      <div
        className={`relative ${SECTION_CONTAINER} overflow-hidden rounded-[32px] bg-[#FF8A3D] p-12 text-center md:p-20`}
      >
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="mb-8 font-[Manrope] text-[36px] font-extrabold leading-tight text-[#682D00] md:text-[52px]">
            ¿Listo para llevar tu negocio al siguiente nivel?
          </h2>
          <p className="mb-12 text-[18px] text-[#682D00]/80">
            {catalogTotalCount > 0
              ? `Únete a los más de ${nfmt(catalogTotalCount)} negocios que ya confían en RouMenu.`
              : "Crea tu catálogo hoy mismo."}{" "}
            Es gratis para empezar.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="https://rouadmin.vercel.app/createAccount"
              className="rounded-xl bg-[#1A1613] px-10 py-5 font-bold text-[#FFB68D] shadow-2xl transition-transform hover:scale-105"
            >
              Empezar ahora gratis
            </Link>
            <Link
              href="/catalogs"
              className="rounded-xl border border-[#682D00]/20 bg-[#682D00]/10 px-10 py-5 font-bold text-[#682D00] transition-colors hover:bg-[#682D00]/20"
            >
              Ver demostración
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════ */
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className={`border-t border-[#E7E0D8] bg-[#FAF8F5] ${SECTION_X} py-16`}
    >
      <div className={SECTION_CONTAINER}>
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="mb-6 flex items-center gap-2 font-[Manrope] text-xl font-extrabold text-[#1A1613]"
            >
              <Image
                width={50}
                height={50}
                src={logoApp}
                alt="RouMenu logo"
                className="h-8 w-8 rounded-full object-cover"
              />
              RouMenu
            </Link>
            <p className="text-sm leading-relaxed text-[#6B5F56]/80">
              La plataforma para crear el catálogo digital de tu negocio. Sin
              intermediarios, sin comisiones.
            </p>
          </div>
          {[
            {
              title: "Plataforma",
              links: ["Características", "Catálogos", "Planes", "Blog"],
            },
            {
              title: "Compañía",
              links: ["Sobre nosotros", "Contacto", "Soporte"],
            },
            {
              title: "Legal",
              links: ["Privacidad", "Términos", "Cookies"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h5 className="mb-6 text-[12px] font-bold uppercase tracking-widest text-[#1A1613]">
                {col.title}
              </h5>
              <ul className="space-y-4 text-sm text-[#6B5F56]/80">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="hover:text-[#D9600A]">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E7E0D8] pt-8 md:flex-row">
          <p className="text-xs text-[#6B5F56]/60">
            © {year} RouDev — Todos los derechos reservados.
          </p>
          <span className="flex items-center gap-1 text-xs text-[#6B5F56]/60">
            Hecho con
            <span
              className="text-[12px] text-[#D9600A]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            en Cuba
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT PAGE COMPONENT
══════════════════════════════════════════════════════════ */
export default function HomeLanding() {
  const data = useApp()?.generalData ?? {};
  const catalogTotalCount: number = data?.catalog_total_count ?? 0;
  const allCatalogs: AllCatalogItem[] =
    data?.all_catalogs ?? data?.catalogs ?? [];
  const totalProducts = allCatalogs.reduce(
    (sum: number, c: AllCatalogItem) => sum + (c.products_count ?? 0),
    0,
  );
  const totalProvinces = new Set(
    allCatalogs.map((c: AllCatalogItem) => c.provincia).filter(Boolean),
  ).size;
  const catalogTypes: { tipo: string; count: number }[] =
    data?.catalog_types ?? [];

  return (
    <div
      className="bg-white font-[Work_Sans] text-[#1A1613]"
      style={{ scrollBehavior: "smooth" }}
    >
      <main>
        <HeroSection
          catalogTotalCount={catalogTotalCount}
          totalProducts={totalProducts}
          totalProvinces={totalProvinces}
        />
        <ProblemSolutionSection />
        <HowItWorksSection />
        <CatalogsSection catalogs={allCatalogs} />
        <BusinessTypesSection types={catalogTypes} />
        <ProductsSection
          products={data?.products ?? ([] as ProductItem[])}
          top_posts={data?.top_posts ?? ([] as TopPostItem[])}
        />
        {/* pasa data?.plans (query aparte a plan_config) cuando la tengas */}
        <PlansSection plans={data?.plans} />
        <FinalCTASection catalogTotalCount={catalogTotalCount} />
      </main>
      <Footer />
    </div>
  );
}
