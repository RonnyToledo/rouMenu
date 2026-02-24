// MenuBar.tsx
"use client";
import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import MenuScreen from "./MenuScreen";
import { useHistory } from "@/context/AppContext";
import { getReversedUniqueRoutes } from "@/functions/getReversedUniqueRoutes";

const MAX_STACK_ROUTES = 2;

const STACK_STYLES = [
  "translate-x-[240px] scale-85",
  "translate-x-[190px] scale-75",
] as const;

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
    () => getReversedUniqueRoutes(record, pathname).slice(0, MAX_STACK_ROUTES),
    [record, pathname],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const root = document.getElementById("menu-bar-root");
    if (root) {
      root.style.overflow = isMenuOpen ? "hidden" : "";
    }
  }, [isMenuOpen, isMounted]);

  const handleNavigate = useCallback(
    (path: string) => {
      setIsMenuOpen(false);
      setTimeout(() => router.push(path), 300);
    },
    [router, setIsMenuOpen],
  );

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  return (
    <div id="menu-bar-root" className="relative min-h-dvh">
      <div className="fixed inset-0 z-10 pointer-events-none">
        <MenuScreen isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>

      {isMounted &&
        routes.length > 0 &&
        routes.map((rec, index) => (
          <StackCard
            key={`${rec.path}-${index}`}
            path={rec.path}
            isMenuOpen={isMenuOpen}
            stackStyle={STACK_STYLES[index]}
            zIndex={29 - index}
            onNavigate={handleNavigate}
          />
        ))}

      {/* Pantalla principal */}
      <div
        className="fixed inset-0 bg-white dark:bg-slate-950 min-h-dvh transition-all duration-500 ease-out"
        style={{
          zIndex: 30,
          transform:
            isMounted && isMenuOpen
              ? "translateX(300px) scale(0.95)"
              : "translateX(0) scale(1)",
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
          className={`relative h-full ${
            isMounted && isMenuOpen ? "overflow-y-hidden" : "overflow-y-scroll"
          }`}
        >
          {isMounted && isMenuOpen && (
            <button
              aria-label="Cerrar menú"
              className="absolute w-full h-full z-31 cursor-default"
              onClick={handleCloseMenu}
            />
          )}
          <div
            style={{
              pointerEvents: isMounted && isMenuOpen ? "none" : "auto",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const StackCard = memo(function StackCard({
  path,
  isMenuOpen,
  stackStyle,
  zIndex,
  onNavigate,
}: {
  path: string;
  isMenuOpen: boolean;
  stackStyle: string;
  zIndex: number;
  onNavigate: (path: string) => void;
}) {
  const label = useMemo(() => {
    const segments = path.split("/").filter(Boolean);
    return segments[segments.length - 1] || "Inicio";
  }, [path]);

  return (
    <button
      onClick={() => onNavigate(path)}
      aria-label={`Volver a ${label}`}
      className={`fixed inset-0 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 group ${
        isMenuOpen ? stackStyle : "translate-x-0"
      }`}
      style={{
        opacity: isMenuOpen ? 1 : 0,
        zIndex,
        borderRadius: isMenuOpen ? "1.5rem" : "0",
        boxShadow: isMenuOpen ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
        overflow: "hidden",
        transition: "all 500ms ease-out",
        pointerEvents: isMenuOpen ? "auto" : "none",
      }}
    >
      <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-2">
        <div className="w-16 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
        <div className="w-24 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
        <div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
      </div>

      <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 dark:bg-white/10 text-white px-4 py-2 rounded-lg text-sm capitalize">
          ← {label}
        </div>
      </div>
    </button>
  );
});
