"use client";

import React, { useContext, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MyContext } from "@/context/MyContext";
import { useApp } from "@/context/AppContext";
import { useSheet } from "./SheetComponent";
import { logoApp, logoUser } from "@/lib/image";
import { useParams, usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// ↓ Importación desde .jsx — sin tipos, sin relative-time en este archivo .ts
import { NextChange, StoreState } from "./Hours-TIme";
import { BiMenuAltRight } from "react-icons/bi";
// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const { user, smartBack, generalData } = useApp();
  const { open } = useSheet();
  const { store, dispatchStore } = useContext(MyContext);
  const params = useParams();
  const isHome = !params?.id && !params?.uid;

  return (
    <>
      <div className="h-12"></div>
      <header
        className="bg-background/80 backdrop-blur-lg h-12 border-b border-border fixed w-full top-0 z-50 transition-transform duration-300"
        style={{
          transform: generalData.top_hidden
            ? "translateY(-100%)"
            : "translateY(0)",
        }}
      >
        <div className="flex justify-between h-full items-center w-full px-3 py-1 max-w-7xl mx-auto relative">
          {/* ── Izquierda: hamburger o back ── */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={smartBack}
              size="icon"
              aria-label={isHome ? "Menú" : "Volver"}
              className="p-0! gap-0! text-foreground transition-all duration-300 rounded-full focus:outline-none"
            >
              {isHome ? (
                /* Logo de la tienda como trigger del menú lateral */
                <Image
                  alt={`${store?.name || "Rou-Menu"} logo`}
                  width={28}
                  height={28}
                  className="rounded-full object-cover border border-border"
                  src={store?.urlPoster || logoApp}
                  onError={() =>
                    dispatchStore({
                      type: "Add",
                      payload: { ...store, urlPoster: "" },
                    })
                  }
                />
              ) : (
                /* Flecha back */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              )}
            </Button>
          </div>

          {/* ── Centro: título + estado horario ── */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <HeaderInfo />
          </div>

          {/* ── Derecha: buscar + avatar ── */}
          <div className="flex items-center gap-1 text-foreground">
            {/* Avatar — abre el Sheet */}
            <Button
              variant="ghost"
              size="icon"
              onClick={open}
              aria-label="Perfil de usuario"
              className="p-1 transition-all duration-300 rounded-full focus:outline-none"
            >
              {user ? (
                <Avatar className="w-8 h-8 border border-border">
                  <AvatarImage
                    src={
                      user?.user_metadata.picture ||
                      user?.user_metadata.avatar_url ||
                      logoUser
                    }
                    alt={user?.user_metadata.full_name || "Usuario"}
                  />
                  <AvatarFallback className="text-xs">
                    {user?.user_metadata.full_name?.split(" ")[0]?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <BiMenuAltRight />
              )}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}

// ─── HeaderInfo ───────────────────────────────────────────────────────────────

const HeaderInfo = () => {
  const params = useParams();
  const pathname = usePathname();
  const { store } = useContext(MyContext);

  const currentProduct = useMemo(
    () => store.products.find((p) => p.productId === params?.id),
    [store.products, params?.id],
  );

  const currentCategory = useMemo(
    () =>
      store.categorias.find(
        (c) => c.id === (params?.uid || currentProduct?.caja),
      ),
    [store.categorias, params?.uid, currentProduct?.caja],
  );

  const isCommentPage = pathname.includes("/coment");
  const isHome = !params?.id && !params?.uid;

  const mainTitle = useMemo(() => {
    if (params?.id)
      return isCommentPage ? "Comentarios" : currentProduct?.title;
    if (params?.uid) return currentCategory?.name;
    return store?.name || "Rou-Menu";
  }, [
    params?.id,
    params?.uid,
    isCommentPage,
    currentProduct?.title,
    currentCategory?.name,
    store?.name,
  ]);

  const subtitle = params?.id
    ? isCommentPage
      ? (currentProduct?.title ?? null)
      : (currentCategory?.name ?? null)
    : params?.uid
      ? (store?.name ?? "Rou-Menu")
      : null;

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Título principal */}
      <p className="text-sm font-semibold text-foreground truncate max-w-45 leading-tight m-0">
        {mainTitle}
      </p>

      {/* Subtítulo / estado de horario */}
      <div className="flex items-center justify-center gap-1.5 min-h-3.5">
        {isHome ? (
          <>
            <StoreState schedule={store.horario} />
            <NextChange schedule={store.horario} />
          </>
        ) : subtitle ? (
          <span className="text-[11px] text-muted-foreground truncate max-w-40 leading-none">
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
};
