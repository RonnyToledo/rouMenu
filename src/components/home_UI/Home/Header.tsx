"use client";
import React, { ReactNode, useEffect, useRef } from "react";
import type { IconType } from "react-icons/lib";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoApp } from "@/lib/image";
import Image from "next/image";
import { useApp } from "@/context/AppContext";

export default function Header({ children }: { children: ReactNode }) {
  const { generalData, setGeneralData } = useApp();
  const lastScroll = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      const cur = window.pageYOffset;
      const last = lastScroll.current;
      const delta = cur - last;

      // ignorá micro-movimientos (evita jitter)
      if (Math.abs(delta) < 5) return;

      if (cur <= 0) {
        // siempre visible en el top
        setGeneralData((prev) => ({ ...prev, top_hidden: false }));
      } else if (delta > 0) {
        // bajando -> esconder
        setGeneralData((prev) => ({ ...prev, top_hidden: true }));
      } else {
        // subiendo -> mostrar
        setGeneralData((prev) => ({ ...prev, top_hidden: false }));
      }

      lastScroll.current = cur;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setGeneralData]);

  const links = [
    { href: "#producto", label: "Producto" },
    { href: "#catalogos", label: "Catálogos" },
    { href: "#planes", label: "Planes" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <>
      {!pathname.includes("/t/") ? (
        <>
          <div className="h-12"></div>
          <header
            className="fixed left-0 top-0 z-50 w-full border-b h-12 border-white/25 px-2 py-2 backdrop-blur-xl transition-transform duration-300 bg-white/60"
            style={{
              transform: generalData.top_hidden
                ? "translateY(-100%)"
                : "translateY(0)",
            }}
          >
            <nav className="mx-auto flex max-w-300 items-center justify-between">
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-[Manrope] text-xl font-extrabold text-[#1d1c1b]"
                >
                  <Image
                    src={logoApp}
                    alt="RouMenu"
                    width={40}
                    height={40}
                    className="rounded-full size-8 object-cover"
                  />
                  RouMenu
                </Link>
                <div className="hidden gap-6 md:flex">
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="text-[8px] font-bold uppercase tracking-widest text-[#DDC1B3]/70 transition-colors hover:text-[#FFB68D]"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="https://rouadmin.vercel.app/createAccount"
                className="rounded-lg bg-[#FFB68D] px-3 py-2 text-[8px] font-bold uppercase tracking-widest text-[#532200] transition-shadow hover:shadow-[0_0_25px_rgba(255,182,141,0.3)]"
              >
                Comenzar gratis
              </Link>
            </nav>
          </header>
        </>
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
