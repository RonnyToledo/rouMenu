// MenuBar.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MenuScreen from "./MenuScreen";
import { useHistory } from "@/context/AppContext";
import { getReversedUniqueRoutes } from "@/functions/getReversedUniqueRoutes";

export default function MenuBar({
  children,
  isMenuOpen,
  setIsMenuOpen,
}: {
  children: React.ReactNode;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { record } = useHistory();
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const routes = useMemo(
    () => getReversedUniqueRoutes(record, pathname).slice(0, 2),
    [record, pathname],
  );

  useEffect(() => {
    queueMicrotask(() => setIsMounted(true));
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const root = document.getElementById("menu-bar-root");
    if (root) root.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen, isMounted]);

  const stylesFromScreens = [
    `translate-x-[240px] scale-85`,
    `translate-x-[190px] scale-75`,
  ];

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    setTimeout(() => router.push(path), 300);
  };

  return (
    <div id="menu-bar-root" className="relative min-h-dvh">
      <div className="fixed inset-0 z-10 pointer-events-none">
        <MenuScreen isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>

      {/* Ventanas escalonadas */}
      {isMounted &&
        routes.length > 0 &&
        routes.map((rec, index) => (
          <button
            key={`${rec.path}-${index}`}
            onClick={() => handleNavigate(rec.path)}
            className={`fixed inset-0 bg-background transition-all duration-500 ease-out focus:outline-none group ${
              isMenuOpen ? stylesFromScreens[index] : "translate-x-0"
            }`}
            style={{
              opacity: isMenuOpen ? 1 : 0,
              zIndex: 29 - index,
              borderRadius: isMenuOpen ? "1.5rem" : "0",
              boxShadow: isMenuOpen
                ? "0 25px 50px -12px rgba(0,0,0,0.25)"
                : "none",
              overflow: isMenuOpen ? "hidden" : "visible",
              transition: "all 500ms ease-out",
              pointerEvents: isMenuOpen ? "auto" : "none",
            }}
            aria-label={`Navegar a ${rec.path}`}
          >
            <iframe
              src={rec.path}
              width="100%"
              height="100%"
              className="border-0 pointer-events-none"
              sandbox="allow-same-origin"
              loading="lazy"
              tabIndex={-1}
            />
            <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/80 text-background px-4 py-2 rounded-xl text-xs">
                Click para abrir
              </div>
            </div>
          </button>
        ))}

      {/* Pantalla principal */}
      <div
        className="fixed inset-0 bg-background min-h-dvh transition-all duration-500 ease-out"
        style={{
          zIndex: 30,
          transform: isMounted && isMenuOpen ? "scale(0.95)" : "scale(1)",
          transformOrigin: "left",
          borderRadius: isMounted && isMenuOpen ? "1.5rem" : "0",
          boxShadow:
            isMounted && isMenuOpen
              ? "0 25px 50px -12px rgba(0,0,0,0.25)"
              : "none",
          willChange: isMounted && isMenuOpen ? "transform" : "auto",
          overflow: isMounted && isMenuOpen ? "hidden" : "visible",
        }}
      >
        <div
          className={`relative h-full ${isMounted && isMenuOpen ? "overflow-y-hidden" : "overflow-y-scroll"}`}
        >
          {isMounted && isMenuOpen ? (
            <button
              className="absolute w-full h-full z-31"
              onClick={() => setIsMenuOpen(false)}
            />
          ) : null}
          <div
            style={{ pointerEvents: isMounted && isMenuOpen ? "none" : "auto" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
