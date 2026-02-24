"use client";
import React, { useContext, useMemo, memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MyContext } from "@/context/MyContext";
import { useApp } from "@/context/AppContext";
import { useSheet } from "./SheetComponent";
import { logoApp, logoUser } from "@/lib/image";
import { useParams, usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NextChange, StoreState } from "./Hours-TIme";
import { HiMenuAlt3 } from "react-icons/hi";

export default function Header() {
  const { user, smartBack } = useApp();
  const { open } = useSheet();
  const { store, dispatchStore } = useContext(MyContext);

  const handleImageError = useMemo(
    () => () => {
      dispatchStore({ type: "Add", payload: { ...store, urlPoster: "" } });
    },
    [dispatchStore, store],
  );

  return (
    <header className="sticky top-0 z-50 bg-linear-to-b from-slate-50 dark:from-slate-900 to-transparent h-16 p-2 w-full">
      <div className="flex items-center justify-between shadow-md rounded-3xl h-full py-1 px-2 gap-2 bg-white dark:bg-slate-900 dark:shadow-slate-800/50">
        <Button
          variant="ghost"
          onClick={smartBack}
          size="icon"
          className="w-fit text-slate-700 dark:text-slate-300"
        >
          <Image
            alt={`${store?.name || "Rou-Menu"} Logo`}
            width={100}
            height={100}
            className="rounded-full size-8"
            src={store?.urlPoster || logoApp}
            onError={handleImageError}
          />
        </Button>
        <HeaderInfo />
        <Button className="p-2" variant="ghost" onClick={open}>
          {user ? (
            <Avatar className="size-8">
              <AvatarImage
                src={
                  user.user_metadata.picture ||
                  user.user_metadata.avatar_url ||
                  logoUser
                }
                alt={user.user_metadata.full_name || ""}
              />
              <AvatarFallback>
                {user.user_metadata.full_name?.split(" ")[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <HiMenuAlt3 className="size-8 text-slate-700 dark:text-slate-300" />
          )}
        </Button>
      </div>
    </header>
  );
}

const HeaderInfo = memo(function HeaderInfo() {
  const params = useParams();
  const pathname = usePathname();
  const { store } = useContext(MyContext);

  const productId = params?.id as string | undefined;
  const categoryUid = params?.uid as string | undefined;
  const isCommentPage = pathname.includes("/coment");

  const currentProduct = useMemo(
    () => store.products.find((p) => p.productId === productId),
    [store.products, productId],
  );

  const currentCategory = useMemo(
    () =>
      store.categorias.find(
        (c) => c.id === (categoryUid || currentProduct?.caja),
      ),
    [store.categorias, categoryUid, currentProduct?.caja],
  );

  const mainTitle = useMemo(() => {
    if (productId) return isCommentPage ? "Comentarios" : currentProduct?.title;
    if (categoryUid) return currentCategory?.name;
    return store?.name || "Rou-Menu";
  }, [
    productId,
    categoryUid,
    isCommentPage,
    currentProduct?.title,
    currentCategory?.name,
    store?.name,
  ]);

  const subtitle = useMemo(() => {
    if (productId)
      return isCommentPage ? currentProduct?.title : currentCategory?.name;
    if (categoryUid) return store?.name || "Rou-Menu";
    return undefined;
  }, [
    productId,
    categoryUid,
    isCommentPage,
    currentProduct?.title,
    currentCategory?.name,
    store,
  ]);

  return (
    <div className="flex-1 text-center overflow-hidden">
      <span className="font-cinzel text-[16px] text-slate-800 dark:text-slate-100 line-clamp-1 text-center block">
        {mainTitle}
      </span>
      <div className="flex items-center justify-center gap-2">
        {subtitle ? (
          <span className="text-[10px] truncate text-slate-600 dark:text-slate-400">
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
});
