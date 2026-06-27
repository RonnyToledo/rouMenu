"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  HomeCatalogItem,
  ProductItem,
  TopPostItem,
} from "@/types/HomeContentInterface";
import Image from "next/image";

/* ─── tiny helpers ─────────────────────────────────────── */
const fmt = (n: string | number | unknown) => `$${Number(n).toLocaleString()}`;
const disc = (p: number, o: number) =>
  o && o > p ? `-${Math.round(((o - p) / o) * 100)}%` : null;

/* ─── design tokens ─────────────────────────────────────── */
const T = {
  bg: "#0D0D0D",
  card: "#161616",
  line: "#242424",
  cream: "#FFF8F0",
  red: "#C84B31",
  gold: "#E8A838",
  muted: "rgba(255,248,240,0.38)",
  dim: "rgba(255,248,240,0.15)",
};

/* ══════════════════════════════════════════════════════════
   SECTION 1 — HERO
══════════════════════════════════════════════════════════ */
function HeroSection({
  catalogs = [],
  products = [],
}: {
  catalogs: HomeCatalogItem[];
  products: ProductItem[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    {
      value: catalogs.length > 3 ? `${catalogs.length}+` : "340+",
      label: "Catálogos activos",
    },
    {
      value: products.length > 3 ? `${products.length * 40}+` : "12 000+",
      label: "Productos listados",
    },
    { value: "8 500+", label: "Compradores activos" },
  ];

  const fi = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  return (
    <header
      style={{
        background: T.bg,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "120px 20px 80px",
      }}
    >
      {/* grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(${T.line} 1px, transparent 1px), linear-gradient(90deg, ${T.line} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: 0.35,
        }}
      />

      {/* red glow top-left */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          top: -200,
          left: -200,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(200,75,49,0.18) 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* gold glow bottom-right */}
      <div
        style={{
          position: "absolute",
          width: 480,
          height: 480,
          bottom: -180,
          right: -100,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(232,168,56,0.12) 0%, transparent 70%)`,
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 680,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* pill badge */}
        <div
          style={{
            ...fi(0),
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            background: "rgba(200,75,49,0.12)",
            border: "1px solid rgba(200,75,49,0.3)",
            marginBottom: 28,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: T.red,
              boxShadow: `0 0 8px ${T.red}`,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: T.red,
            }}
          >
            Servicio de Catálogos Digitales
          </span>
        </div>

        {/* headline */}
        <h1
          style={{
            ...fi(0.1),
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(3rem, 10vw, 5.8rem)",
            fontWeight: 700,
            lineHeight: 0.9,
            color: T.cream,
            margin: "0 0 28px",
          }}
        >
          Vende más
          <br />
          <span
            style={{
              background: `linear-gradient(120deg, ${T.red} 0%, #E07840 50%, ${T.gold} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            con tu catálogo
          </span>
          <br />
          <span
            style={{
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "0.82em",
              color: "rgba(255,248,240,0.5)",
            }}
          >
            digital
          </span>
        </h1>

        {/* subheadline */}
        <p
          style={{
            ...fi(0.2),
            fontSize: 17,
            lineHeight: 1.65,
            color: "rgba(255,248,240,0.68)",
            maxWidth: 500,
            margin: "0 0 40px",
          }}
        >
          RouMenu te permite crear y publicar un catálogo online profesional en
          minutos — sin conocimientos técnicos. Tus clientes lo exploran,
          comparan precios y te contactan directamente.
        </p>

        {/* CTAs */}
        <div
          style={{
            ...fi(0.3),
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 64,
          }}
        >
          <Link
            href="https://rouadmin.vercel.app/createAccount"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 28px",
              borderRadius: 999,
              background: T.red,
              color: T.cream,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: `0 4px 24px rgba(200,75,49,0.35)`,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 32px rgba(200,75,49,0.45)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = `0 4px 24px rgba(200,75,49,0.35)`;
            }}
          >
            Crear mi catálogo gratis
            <svg
              width="14"
              height="14"
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

          <Link
            href="/catalogs"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 28px",
              borderRadius: 999,
              background: "rgba(255,248,240,0.06)",
              border: `1.5px solid rgba(255,248,240,0.15)`,
              color: T.cream,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,248,240,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,248,240,0.06)";
            }}
          >
            Explorar catálogos
          </Link>
        </div>

        {/* stats bar */}
        <div
          style={{
            ...fi(0.42),
            display: "flex",
            gap: 40,
            flexWrap: "wrap",
            paddingTop: 32,
            borderTop: `1px solid ${T.line}`,
          }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <span
                style={{
                  display: "block",
                  fontFamily: "Georgia, serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: T.cream,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </span>
              <span
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: T.muted,
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* scroll hint */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          animation: "bounce 2s ease-in-out infinite",
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: T.muted,
          }}
        >
          Scroll
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.muted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>

      <style>{`@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-6px)}}`}</style>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 2 — HOW IT WORKS
══════════════════════════════════════════════════════════ */
const STEPS = [
  {
    n: "01",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 12h6M12 9v6" />
      </svg>
    ),
    title: "Crea tu cuenta",
    desc: "Regístrate en segundos. Sin tarjeta de crédito ni conocimientos técnicos. Solo tu nombre y tu negocio.",
  },
  {
    n: "02",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Agrega tus productos",
    desc: "Sube fotos, precios y descripciones. Organiza por categorías. Tu catálogo queda listo y publicado.",
  },
  {
    n: "03",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Comparte tu enlace",
    desc: "Obtén tu URL personalizada. Compártela por WhatsApp, Instagram o donde prefieras. Tus clientes acceden sin instalar nada.",
  },
  {
    n: "04",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: "Recibe pedidos y crece",
    desc: "Tus clientes exploran, comparan y te contactan. Tú gestionas desde el panel de admin en tiempo real.",
  },
];

function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && ref.current) {
          ref.current
            .querySelectorAll<HTMLElement>(".step-card")
            .forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
              }, i * 100);
            });
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        background: T.card,
        padding: "100px 20px",
        borderTop: `1px solid ${T.line}`,
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <span
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: T.red,
              marginBottom: 12,
            }}
          >
            Cómo funciona
          </span>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(2rem, 6vw, 3rem)",
              fontWeight: 700,
              color: T.cream,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Tu catálogo online{" "}
            <span
              style={{ fontStyle: "italic", fontWeight: 300, color: T.muted }}
            >
              en 4 pasos
            </span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 2,
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="step-card"
              style={{
                opacity: 0,
                transform: "translateY(20px)",
                transition: "opacity 0.55s ease, transform 0.55s ease",
                padding: "28px 24px",
                background:
                  i % 2 === 0 ? "rgba(255,248,240,0.03)" : "transparent",
                border: `1px solid ${T.line}`,
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.red,
                    letterSpacing: 2,
                    marginTop: 2,
                  }}
                >
                  {s.n}
                </span>
                <div style={{ color: T.gold }}>{s.icon}</div>
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: T.cream,
                  margin: "0 0 8px",
                  lineHeight: 1.3,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: T.muted,
                  margin: 0,
                }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 3 — FEATURES
══════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Sin instalaciones",
    desc: "Tus clientes acceden desde cualquier dispositivo con solo un enlace.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
    title: "Siempre actualizado",
    desc: "Edita precios y productos al instante. Los cambios se reflejan en tiempo real.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Diseño profesional",
    desc: "Plantillas modernas que hacen lucir tu negocio desde el primer día.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
      </svg>
    ),
    title: "Pedidos directos",
    desc: "Conecta con tus clientes por WhatsApp o redes sociales sin intermediarios.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Estadísticas y visitas",
    desc: "Sabe cuántas personas ven tu catálogo y qué productos generan más interés.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Visibilidad local",
    desc: "Tu negocio aparece en RouMenu y lo encuentran compradores de tu zona.",
  },
];

function FeaturesSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && ref.current) {
          ref.current
            .querySelectorAll<HTMLElement>(".feat")
            .forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
              }, i * 70);
            });
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        background: T.bg,
        padding: "100px 20px",
        borderTop: `1px solid ${T.line}`,
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: 52 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: T.gold,
              display: "block",
              marginBottom: 12,
            }}
          >
            Por qué RouMenu
          </span>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(2rem, 6vw, 3rem)",
              fontWeight: 700,
              color: T.cream,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Todo lo que tu negocio necesita,{" "}
            <span
              style={{ fontStyle: "italic", fontWeight: 300, color: T.muted }}
            >
              en un solo lugar
            </span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="feat"
              style={{
                opacity: 0,
                transform: "translateY(18px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                padding: "22px 20px",
                border: `1px solid ${T.line}`,
                borderRadius: 14,
                background: "rgba(255,248,240,0.025)",
              }}
            >
              <div style={{ color: T.red, marginBottom: 12 }}>{f.icon}</div>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.cream,
                  margin: "0 0 6px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: T.muted,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 4 — FEATURED OFFERS (bento grid)
══════════════════════════════════════════════════════════ */
function OffersSection({
  products = [],
  top_posts = [],
}: {
  products: ProductItem[];
  top_posts: TopPostItem[];
}) {
  const ref = useRef<HTMLElement>(null);
  const items = (top_posts.length > 0 ? top_posts : products).slice(0, 5);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && ref.current) {
          ref.current
            .querySelectorAll<HTMLElement>(".bento")
            .forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = "1";
                el.style.transform = "scale(1)";
              }, i * 80);
            });
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const configs: Array<{
    gridColumn: string;
    gridRow: string;
    featured: boolean;
  }> = [
    { gridColumn: "span 2", gridRow: "span 2", featured: true },
    { gridColumn: "span 1", gridRow: "span 1", featured: false },
    { gridColumn: "span 1", gridRow: "span 1", featured: false },
    { gridColumn: "span 1", gridRow: "span 1", featured: false },
    { gridColumn: "span 1", gridRow: "span 1", featured: false },
  ];

  return (
    <section
      ref={ref}
      id="ofertas"
      style={{
        background: T.card,
        padding: "100px 20px",
        borderTop: `1px solid ${T.line}`,
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: T.red,
                display: "block",
                marginBottom: 12,
              }}
            >
              Ofertas destacadas
            </span>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(2rem, 6vw, 3rem)",
                fontWeight: 700,
                color: T.cream,
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              Precios que
              <br />
              <span
                style={{ fontStyle: "italic", fontWeight: 300, color: T.red }}
              >
                no se repiten
              </span>
            </h2>
          </div>
          <p
            style={{
              fontSize: 13,
              color: T.muted,
              maxWidth: 220,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Las mejores ofertas de los catálogos más populares, actualizadas
            cada día.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridAutoRows: "180px",
            gap: 8,
          }}
        >
          {items.map((item, idx) => {
            const cfg = configs[idx] ?? configs[configs.length - 1];
            const d = disc(item.price, item.oldPrice);
            return (
              <Link
                key={item.productId ?? idx}
                href={`/t/${item.store_sitioweb ?? item.sitioweb}/producto/${item.productId}`}
                className="bento"
                style={{
                  gridColumn: cfg.gridColumn,
                  gridRow: cfg.gridRow,
                  opacity: 0,
                  transform: "scale(0.97)",
                  transition: `opacity 0.5s ease ${idx * 60}ms, transform 0.5s ease ${idx * 60}ms`,
                  position: "relative",
                  borderRadius: 14,
                  overflow: "hidden",
                  display: "block",
                  textDecoration: "none",
                  background: T.bg,
                }}
              >
                {item.image && (
                  <Image
                    width={100}
                    height={100}
                    src={item.image}
                    alt={item.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(13,13,13,0.9) 0%, rgba(13,13,13,0.3) 55%, transparent 100%)",
                  }}
                />

                {/* badges */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    display: "flex",
                    gap: 6,
                    zIndex: 1,
                  }}
                >
                  {item.category_name && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: "rgba(200,75,49,0.9)",
                        color: T.cream,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.category_name}
                    </span>
                  )}
                  {d && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: "rgba(232,168,56,0.95)",
                        color: "#1A0800",
                      }}
                    >
                      {d}
                    </span>
                  )}
                </div>

                {/* info */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: cfg.featured ? "20px 18px" : "12px 14px",
                    zIndex: 1,
                  }}
                >
                  <p
                    style={{ fontSize: 10, color: T.muted, margin: "0 0 3px" }}
                  >
                    {item.store_name}
                  </p>
                  <h3
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: cfg.featured ? 20 : 13,
                      fontWeight: 700,
                      color: T.cream,
                      margin: "0 0 6px",
                      lineHeight: 1.2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </h3>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: cfg.featured ? 18 : 13,
                        color: T.gold,
                      }}
                    >
                      {fmt(item.price)}
                    </span>
                    {item.oldPrice > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          textDecoration: "line-through",
                          color: T.muted,
                        }}
                      >
                        {fmt(item.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 5 — TOP CATALOGS
══════════════════════════════════════════════════════════ */
function CatalogsSection({ catalogs = [] }: { catalogs: HomeCatalogItem[] }) {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && ref.current) {
          ref.current
            .querySelectorAll<HTMLElement>(".cat-reveal")
            .forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
              }, i * 90);
            });
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const select = (i: number): void => {
    if (i === active) return;
    setFading(true);
    setTimeout(() => {
      setActive(i);
      setFading(false);
    }, 220);
  };

  const visible = catalogs.slice(0, 6);
  if (visible.length === 0) return null;
  const cur = visible[active];

  return (
    <section
      ref={ref}
      style={{
        background: T.bg,
        padding: "100px 20px",
        borderTop: `1px solid ${T.line}`,
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div
          className="cat-reveal"
          style={{
            opacity: 0,
            transform: "translateY(18px)",
            transition: "opacity 0.55s ease, transform 0.55s ease",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: T.red,
              display: "block",
              marginBottom: 12,
            }}
          >
            Los más populares
          </span>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(2rem, 6vw, 3rem)",
              fontWeight: 700,
              color: T.cream,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Catálogos{" "}
            <span
              style={{ fontStyle: "italic", fontWeight: 300, color: T.muted }}
            >
              destacados
            </span>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* big preview */}
          <Link
            href={`/t/${cur.sitioweb}`}
            className="cat-reveal"
            style={{
              opacity: 0,
              transform: "translateY(18px)",
              transition:
                "opacity 0.55s ease 0.08s, transform 0.55s ease 0.08s",
              display: "block",
              textDecoration: "none",
              position: "relative",
              borderRadius: 18,
              overflow: "hidden",
              height: 280,
            }}
          >
            {cur.banner || cur.image ? (
              <Image
                src={cur.banner || cur.image}
                alt={cur.name}
                width={100}
                height={100}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: fading ? 0 : 1,
                  transition: "opacity 0.22s ease",
                }}
              />
            ) : (
              <div
                style={{ position: "absolute", inset: 0, background: T.card }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(13,13,13,0.88) 0%, rgba(13,13,13,0.2) 60%, transparent 100%)",
                opacity: fading ? 0 : 1,
                transition: "opacity 0.22s ease",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "24px 22px",
                opacity: fading ? 0 : 1,
                transition: "opacity 0.22s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: "rgba(200,75,49,0.9)",
                      color: T.cream,
                      display: "inline-block",
                      marginBottom: 8,
                    }}
                  >
                    {cur.tipo}
                  </span>
                  <h3
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 26,
                      fontWeight: 700,
                      color: T.cream,
                      margin: 0,
                    }}
                  >
                    {cur.name}
                  </h3>
                  <p
                    style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}
                  >
                    {cur.provincia}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      justifyContent: "flex-end",
                      marginBottom: 4,
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill={T.gold}
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span
                      style={{ fontWeight: 700, color: T.gold, fontSize: 15 }}
                    >
                      {cur.avg_star?.toFixed(1)}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: T.muted }}>
                    {cur.visitas} visitas
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* list */}
          <div
            className="cat-reveal"
            style={{
              opacity: 0,
              transform: "translateY(18px)",
              transition:
                "opacity 0.55s ease 0.16s, transform 0.55s ease 0.16s",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {visible.map((cat, i) => (
              <button
                key={cat.UUID}
                onMouseEnter={() => select(i)}
                onClick={() => select(i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  padding: "12px 14px",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background:
                    i === active
                      ? "rgba(200,75,49,0.09)"
                      : "rgba(255,248,240,0.025)",
                  border: `1px solid ${i === active ? "rgba(200,75,49,0.35)" : T.line}`,
                  transition: "background 0.18s, border-color 0.18s",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: T.line,
                  }}
                >
                  {cat.image && (
                    <Image
                      src={cat.image}
                      width={100}
                      height={100}
                      alt={cat.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      margin: 0,
                      color: i === active ? T.cream : T.muted,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cat.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      margin: 0,
                      color: T.dim,
                      marginTop: 2,
                    }}
                  >
                    {cat.tipo} · {cat.provincia}
                  </p>
                </div>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={i === active ? T.red : T.dim}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ))}

            <Link
              href="/catalogs"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px",
                borderRadius: 12,
                marginTop: 4,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
                color: T.cream,
                background: T.red,
                boxShadow: `0 4px 16px rgba(200,75,49,0.25)`,
              }}
            >
              Ver todos los catálogos →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 6 — SUGGESTED PRODUCTS
══════════════════════════════════════════════════════════ */
function SuggestionsSection({ products = [] }: { products: ProductItem[] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && ref.current) {
          ref.current.querySelectorAll<HTMLElement>(".sug").forEach((el, i) => {
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, i * 70);
          });
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (products.length === 0) return null;

  const getTag = (item: ProductItem): string => {
    if (item.cnt_comments >= 2) return "Más comentado";
    if (item.avg_star >= 5) return "Top rated";
    if (item.score > 155) return "Tendencia";
    return "Sugerido";
  };

  return (
    <section
      ref={ref}
      id="sugerencias"
      style={{
        background: T.card,
        padding: "100px 20px 80px",
        borderTop: `1px solid ${T.line}`,
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div
          className="sug"
          style={{
            opacity: 0,
            transform: "translateY(16px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            marginBottom: 36,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: T.gold,
                display: "block",
                marginBottom: 12,
              }}
            >
              Para ti
            </span>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(2rem, 6vw, 3rem)",
                fontWeight: 700,
                color: T.cream,
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              Productos{" "}
              <span
                style={{ fontStyle: "italic", fontWeight: 300, color: T.muted }}
              >
                sugeridos
              </span>
            </h2>
          </div>
          <p
            style={{
              fontSize: 13,
              color: T.muted,
              maxWidth: 200,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Seleccionados por popularidad y valor en el mercado actual.
          </p>
        </div>

        {/* horizontal scroll */}
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 16,
            scrollSnapType: "x mandatory",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {products.map((item, i) => (
            <Link
              key={item.productId ?? i}
              href={`/t/${item.sitioweb}/producto/${item.productId}`}
              className="sug"
              style={{
                opacity: 0,
                transform: "translateY(16px)",
                transition: `opacity 0.5s ease ${i * 55}ms, transform 0.5s ease ${i * 55}ms`,
                scrollSnapAlign: "start",
                flexShrink: 0,
                width: 220,
                borderRadius: 16,
                border: `1px solid ${T.line}`,
                background: T.bg,
                textDecoration: "none",
                display: "block",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "relative", height: 180 }}>
                {item.image && (
                  <Image
                    src={item.image}
                    width={100}
                    height={100}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(13,13,13,0.55) 0%, transparent 60%)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: "rgba(255,248,240,0.9)",
                    color: T.red,
                    border: "1px solid rgba(200,75,49,0.25)",
                  }}
                >
                  {getTag(item)}
                </span>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontSize: 10, color: T.muted, margin: "0 0 4px" }}>
                  {item.store_name} · {item.category_name}
                </p>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: T.cream,
                    margin: "0 0 10px",
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.title}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: T.red, fontSize: 14 }}>
                    {fmt(item.price)}
                  </span>
                  {item.oldPrice > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        textDecoration: "line-through",
                        color: T.dim,
                      }}
                    >
                      {fmt(item.oldPrice)}
                    </span>
                  )}
                </div>
                {item.avg_star > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: `1px solid ${T.line}`,
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill={T.gold}
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span style={{ fontSize: 11, color: T.muted }}>
                      {item.avg_star.toFixed(1)} · {item.cnt_comments} reseñas
                    </span>
                  </div>
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
   SECTION 7 — CTA FINAL
══════════════════════════════════════════════════════════ */
function CTASection() {
  return (
    <section
      style={{
        background: T.red,
        padding: "100px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(255,248,240,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,248,240,0.06) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          top: -200,
          right: -100,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2.2rem, 7vw, 4rem)",
            fontWeight: 700,
            color: T.cream,
            margin: "0 0 18px",
            lineHeight: 1.05,
          }}
        >
          Tu catálogo digital te espera
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255,248,240,0.75)",
            margin: "0 0 44px",
            lineHeight: 1.6,
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Únete a los negocios que ya venden más con RouMenu. Crea tu catálogo
          en minutos — es gratis para empezar.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="https://rouadmin.vercel.app/createAccount"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 32px",
              borderRadius: 999,
              background: T.cream,
              color: T.red,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            }}
          >
            Crear mi catálogo gratis
            <svg
              width="14"
              height="14"
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
          <Link
            href="/catalogs"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 32px",
              borderRadius: 999,
              background: "rgba(255,248,240,0.12)",
              border: "1.5px solid rgba(255,248,240,0.3)",
              color: T.cream,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Explorar catálogos
          </Link>
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
      style={{
        background: T.bg,
        borderTop: `1px solid ${T.line}`,
        padding: "48px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          {/* brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={T.red}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: T.cream,
                }}
              >
                Rou<span style={{ color: T.red }}>Menu</span>
              </span>
            </div>
            <p
              style={{
                fontSize: 12,
                color: T.muted,
                lineHeight: 1.65,
                maxWidth: 220,
                margin: 0,
              }}
            >
              Catálogos digitales para negocios. Simple, rápido y efectivo.
            </p>
          </div>

          {/* links */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 40px",
            }}
          >
            {[
              { href: "/", label: "Inicio" },
              { href: "/catalogs", label: "Catálogos" },
              { href: "/info", label: "Acerca de" },
              { href: "/services", label: "Servicios" },
              { href: "/blog", label: "Blog" },
              { href: "/contact", label: "Contacto" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontSize: 13,
                  color: T.muted,
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = T.cream)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            paddingTop: 20,
            borderTop: `1px solid ${T.line}`,
          }}
        >
          <p style={{ fontSize: 12, color: T.dim, margin: 0 }}>
            © {year} RouDev — Todos los derechos reservados.
          </p>
          <a
            href="https://www.instagram.com/_roudev"
            style={{ color: T.muted }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT PAGE COMPONENT
══════════════════════════════════════════════════════════ */
export default function HomepageRedesign() {
  const data = useApp()?.generalData ?? {};

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />

      <main>
        <HeroSection
          catalogs={data?.catalogs ?? ([] as HomeCatalogItem[])}
          products={data?.products ?? ([] as ProductItem[])}
        />
        <HowItWorksSection />
        <FeaturesSection />
        <OffersSection
          products={data?.products ?? ([] as ProductItem[])}
          top_posts={data?.top_posts ?? ([] as TopPostItem[])}
        />
        <CatalogsSection
          catalogs={data?.catalogs ?? ([] as HomeCatalogItem[])}
        />
        <SuggestionsSection
          products={data?.products ?? ([] as ProductItem[])}
        />
        <CTASection />
      </main>

      <Footer />
    </>
  );
}
