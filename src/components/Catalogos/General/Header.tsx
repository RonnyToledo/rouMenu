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
import { NextChange, StoreState } from "./Hours-TIme";

export default function Header() {
  const { user, smartBack } = useApp();
  const { open } = useSheet();
  const { store, dispatchStore } = useContext(MyContext);

  return (
    <header className="sticky top-0 z-50  backdrop-blur-lg h-16 p-2 w-full  transition-colors">
      <div className="flex items-center justify-between rounded-full h-full py-1 px-3 gap-2 bg-background border border-border shadow-sm">
        {/* Logo / back */}
        <Button
          variant="ghost"
          onClick={smartBack}
          size="icon"
          className="rounded-full w-9 h-9 p-0 shrink-0"
        >
          <Image
            alt={`${store?.name || "Rou-Menu"} Logo`}
            width={36}
            height={36}
            className="rounded-full w-9 h-9 object-cover border border-border"
            src={store?.urlPoster || logoApp}
            onError={() => {
              dispatchStore({
                type: "Add",
                payload: { ...store, urlPoster: "" },
              });
            }}
          />
        </Button>

        <HeaderInfo />

        {/* Avatar / menu */}
        <Button
          className="p-0 rounded-full w-9 h-9"
          variant="ghost"
          onClick={open}
        >
          {user ? (
            <Avatar className="w-9 h-9 border border-border">
              <AvatarImage
                src={
                  user.user_metadata.picture ||
                  user.user_metadata.avatar_url ||
                  logoUser
                }
                alt={user.user_metadata.full_name || ""}
              />
              <AvatarFallback className="text-xs">
                {user.user_metadata.full_name?.split(" ")[0]}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="w-9 h-9 border border-border">
              <AvatarImage src={logoUser} alt="@shadcn" />
              <AvatarFallback className="text-xs">U</AvatarFallback>
            </Avatar>
          )}
        </Button>
      </div>
    </header>
  );
}

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

  let subtitle: string | undefined = "";
  if (params?.id)
    subtitle = isCommentPage ? currentProduct?.title : currentCategory?.name;
  else if (params?.uid) subtitle = store?.name || "Rou-Menu";

  return (
    <div className="text-center flex-1 min-w-0">
      <span className="text-sm font-semibold text-foreground line-clamp-1">
        {mainTitle}
      </span>
      <div className="flex items-center justify-center gap-1.5">
        {subtitle ? (
          <span className="text-[10px] text-muted-foreground line-clamp-1">
            {subtitle}
          </span>
        ) : (
          <>
            <StoreState schedule={store.horario} />
            <NextChange schedule={store.horario} />
          </>
        )}
      </div>
    </div>
  );
};
