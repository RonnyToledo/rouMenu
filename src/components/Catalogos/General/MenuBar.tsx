// MenuBar.tsx - Versión con useRouter
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

  // Memoizar las rutas para evitar cálculos innecesarios
  const routes = useMemo(
    () => getReversedUniqueRoutes(record, pathname).slice(0, 2),
    [record, pathname]
  );

  // Detectar cuando el componente está montado en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Manejo de overflow SOLO en el contenedor, NO en body
  useEffect(() => {
    if (!isMounted) return;

    const root = document.getElementById("menu-bar-root");
    if (root) {
      if (isMenuOpen) {
        root.style.overflow = "hidden";
      } else {
        root.style.overflow = "";
      }
    }
  }, [isMenuOpen, isMounted]);

  const stylesFromScreens = [
    `translate-x-[240px]  scale-85`,
    `translate-x-[190px]  scale-75`,
  ];

  // Handler para navegación
  const handleNavigate = (path: string) => {
    setIsMenuOpen(false); // Cerrar el menú primero
    setTimeout(() => {
      router.push(path); // Navegar después de la animación
    }, 300); // Tiempo de la animación de cierre
  };

  return (
    <div id="menu-bar-root" className="relative min-h-dvh">
      {/* Menú lateral - renderizado consistente servidor/cliente */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <MenuScreen isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>

      {/* Ventanas escalonadas - clickeables para navegar */}
      {isMounted &&
        routes.length > 0 &&
        routes.map((rec, index) => (
          <button
            key={`${rec.path}-${index}`}
            onClick={() => handleNavigate(rec.path)}
            className={`fixed inset-0 bg-white transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 group ${
              isMenuOpen ? stylesFromScreens[index] : "translate-x-0"
            }`}
            style={{
              opacity: isMenuOpen ? 1 : 0,
              zIndex: 29 - index,
              borderRadius: isMenuOpen ? "1.5rem" : "0",
              boxShadow: isMenuOpen
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                : "none",
              overflow: isMenuOpen ? "hidden" : "visible",
              transition: "all 500ms ease-out",
              pointerEvents: isMenuOpen ? "auto" : "none",
            }}
            aria-label={`Navegar a ${rec.path}`}
          >
            {/* Preview del contenido con iframe */}
            <iframe
              src={rec.path}
              width="100%"
              height="100%"
              className="border-0 pointer-events-none"
              sandbox="allow-same-origin"
              loading="lazy"
              tabIndex={-1}
            />

            {/* Overlay interactivo */}
            <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                Click para abrir
              </div>
            </div>
          </button>
        ))}

      {/* Pantalla principal - renderizado consistente */}
      <div
        className={`fixed inset-0 bg-white min-h-dvh transition-all duration-500 ease-out ${
          isMounted && isMenuOpen ? "translate-x-[300px] " : "translate-x-0"
        }`}
        style={{
          zIndex: 30,
          transform: isMounted && isMenuOpen ? "scale(0.95)" : "scale(1)",
          transformOrigin: "left",
          borderRadius: isMounted && isMenuOpen ? "1.5rem" : "0",
          boxShadow:
            isMounted && isMenuOpen
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
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
          {isMounted && isMenuOpen ? (
            <button
              className="absolute w-full h-full z-[31]"
              onClick={() => setIsMenuOpen(false)}
            ></button>
          ) : null}
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
