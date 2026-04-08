"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import { HomeCatalogItem } from "@/types/HomeContentInterface";

interface TopCatalogsSectionProps {
  catalogs?: HomeCatalogItem[];
}

export default function TopCatalogsSection({
  catalogs = [],
}: TopCatalogsSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(
                () =>
                  ((el as HTMLElement).style.cssText +=
                    "opacity:1;transform:translateY(0)"),
                i * 100,
              );
            });
          }
        });
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSelect = (idx: number) => {
    if (idx === activeIdx) return;
    setFading(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setFading(false);
    }, 250);
  };

  if (catalogs.length === 0) return null;

  const active = catalogs[activeIdx];
  const previewImage = active.banner || active.image;

  return (
    <section
      ref={sectionRef}
      className="py-20 px-5"
      style={{ background: "#FFF8F0" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="mb-10 reveal"
          style={{
            opacity: 0,
            transform: "translateY(16px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <span
            className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#C84B31" }}
          >
            Los Más Populares
          </span>
          <h2
            className="font-display text-4xl md:text-5xl font-bold"
            style={{ color: "#1A1208" }}
          >
            Catálogos{" "}
            <span
              className="italic font-light"
              style={{ color: "rgba(90,55,20,0.45)" }}
            >
              destacados
            </span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch h-auto lg:h-130">
          {/* Image preview */}
          <Link href={`/t/${active.sitioweb}`}>
            <div
              className="reveal relative rounded-3xl overflow-hidden flex-1"
              style={{
                minHeight: "300px",
                opacity: 0,
                transform: "translateY(16px)",
                transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
              }}
            >
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{ opacity: fading ? 0 : 1 }}
              >
                <AppImage
                  src={previewImage}
                  alt={`${active.name} - ${active.tipo}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(30,15,5,0.8) 0%, rgba(30,15,5,0.25) 55%, transparent 100%)",
                  }}
                />
              </div>

              {/* Info overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-300"
                style={{ opacity: fading ? 0 : 1 }}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <span
                      className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3"
                      style={{
                        background: "rgba(200,75,49,0.9)",
                        color: "#FFF8F0",
                        fontSize: "10px",
                      }}
                    >
                      {active.tipo}
                    </span>
                    <h3
                      className="font-display text-3xl font-bold"
                      style={{ color: "#FFF8F0" }}
                    >
                      {active.name}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255,248,240,0.6)" }}
                    >
                      {active.provincia}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#E8A838"
                        stroke="none"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="font-bold" style={{ color: "#E8A838" }}>
                        {active.avg_star.toFixed(1)}
                      </span>
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: "rgba(255,248,240,0.5)" }}
                    >
                      {active.visitas} visitas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Catalog menu */}
          <div
            className="reveal flex flex-col gap-2 w-full lg:w-72"
            style={{
              opacity: 0,
              transform: "translateY(16px)",
              transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
            }}
          >
            {catalogs.map((cat, idx) => (
              <button
                key={cat.UUID}
                onMouseEnter={() => handleSelect(idx)}
                onClick={() => handleSelect(idx)}
                className="w-full text-left group transition-all duration-250 rounded-2xl"
                style={{
                  background:
                    idx === activeIdx
                      ? "rgba(200,75,49,0.07)"
                      : "rgba(90,55,20,0.03)",
                  border:
                    idx === activeIdx
                      ? "1.5px solid rgba(200,75,49,0.3)"
                      : "1.5px solid rgba(90,55,20,0.08)",
                  padding: "14px 16px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm">
                    <AppImage
                      src={cat.image}
                      alt={cat.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm truncate"
                      style={{
                        color:
                          idx === activeIdx ? "#1A1208" : "rgba(90,55,20,0.6)",
                      }}
                    >
                      {cat.name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(90,55,20,0.38)", fontSize: "11px" }}
                    >
                      {cat.tipo} · {cat.provincia}
                    </p>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={
                      idx === activeIdx ? "#C84B31" : "rgba(90,55,20,0.2)"
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 transition-transform group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}

            <Link
              href="/catalogs"
              className="w-full mt-2 py-3.5 rounded-2xl text-sm font-semibold text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: "#C84B31",
                color: "#FFF8F0",
                boxShadow: "0 4px 16px rgba(200,75,49,0.22)",
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
