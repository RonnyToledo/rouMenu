"use client";
import React, { ReactNode, useEffect, useState } from "react";
import type { IconType } from "react-icons/lib";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ─── design tokens (override as needed) ───────────────── */
const T = {
  bg: "#0D0D0D", // ink black — page background
  card: "#161616", // slightly lifted surface
  line: "#242424", // border / divider
  cream: "#FFF8F0", // warm cream text / surfaces
  red: "#C84B31", // brand coral-red
  gold: "#E8A838", // accent gold
  muted: "rgba(255,248,240,0.38)",
  dim: "rgba(255,248,240,0.15)",
};

export default function Header({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/catalogs", label: "Catálogos" },
    { href: "/services", label: "Servicios" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contacto" },
  ];

  return (
    <>
      {!pathname.includes("/t/") ? (
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: scrolled
              ? "rgba(13,13,13,0.96)"
              : "rgba(13,13,13,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${scrolled ? T.line : "transparent"}`,
            transition: "background 0.3s, border-color 0.3s",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            {/* logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
              }}
            >
              <svg
                width="20"
                height="20"
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
                  fontSize: 17,
                  fontWeight: 700,
                  color: T.cream,
                }}
              >
                Rou<span style={{ color: T.red }}>Menu</span>
              </span>
            </Link>

            {/* desktop nav */}
            <div className="hidden">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 13,
                    color: T.muted,
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: 8,
                    transition: "color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = T.cream;
                    e.currentTarget.style.background = "rgba(255,248,240,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = T.muted;
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="https://rouadmin.vercel.app/createAccount"
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: T.red,
                  color: T.cream,
                  textDecoration: "none",
                }}
              >
                Crear catálogo
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
      {children}
    </>
  );
}

interface CardDrawerInterface {
  name: string;
  descripcion: string;
  path: string;
  icon: IconType;
}

export function CardDrawerActive({
  card,
  onClick,
}: {
  card: CardDrawerInterface;
  onClick: () => void;
}) {
  return (
    <Link href={card.path} className=" p-3.5 rounded-xl" onClick={onClick}>
      <card.icon className="w-5 h-5 mb-2" />
      <h3 className="font-semibold text-xs">{card.name}</h3>
      <p className="text-[10px] opacity-90 mt-0.5">{card.descripcion}</p>
    </Link>
  );
}

export function CardDrawer({
  card,
  onClick,
}: {
  card: CardDrawerInterface;
  onClick: () => void;
}) {
  return (
    <Link
      href={card.path}
      className=" border border-border  p-3.5 rounded-xl hover:bg-muted transition-colors"
      onClick={onClick}
    >
      <card.icon className="w-5 h-5 mb-2 " />
      <h3 className="font-semibold text-xs ">{card.name}</h3>
      <p className="text-[10px]  mt-0.5">{card.descripcion}</p>
    </Link>
  );
}
