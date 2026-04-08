import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="border-t py-10 px-5"
      style={{ borderColor: "rgba(90,55,20,0.1)", backgroundColor: "#FFF8F0" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2.5">
          <ShoppingBag size={28} />
          <span
            className="font-display text-base font-semibold tracking-tight"
            style={{ color: "#1A1208" }}
          >
            Rou<span style={{ color: "#C84B31" }}>Menu</span>
          </span>
        </div>

        {/* Links */}
        <div
          className="flex items-center gap-6 text-sm"
          style={{ color: "rgba(90,55,20,0.5)" }}
        >
          <Link
            href="/homepage"
            className="transition-colors hover:text-[#C84B31]"
            style={{ color: "rgba(90,55,20,0.5)" }}
          >
            Inicio
          </Link>
          <Link
            href="/catalogs"
            className="transition-colors hover:text-[#C84B31]"
            style={{ color: "rgba(90,55,20,0.5)" }}
          >
            Catálogos
          </Link>
          <span style={{ color: "rgba(90,55,20,0.2)" }}>·</span>
          <span style={{ color: "rgba(90,55,20,0.35)" }}>
            © 2026 CatálogosCuba
          </span>
        </div>

        {/* Social */}
        <div className="flex items-center gap-3">
          {[
            {
              label: "Instagram",
              icon: (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              ),
            },
            {
              label: "Telegram",
              icon: (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4 20-7z" />
                  <path d="M22 2 11 13" />
                </svg>
              ),
            },
          ].map((s) => (
            <a
              key={s.label}
              href="#"
              aria-label={s.label}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background: "rgba(90,55,20,0.06)",
                color: "rgba(90,55,20,0.45)",
                border: "1px solid rgba(90,55,20,0.08)",
              }}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
