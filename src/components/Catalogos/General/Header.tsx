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
  console.log();
  return (
    <>
      <>
        <header className="sticky top-0 z-50 bg-linear-to-b from-slate-50 to-transparent h-16 p-2 w-full">
          <div className="flex items-center justify-between shadow-md rounded-3xl h-full py-1 px-2 gap-2 bg-white ">
            <Button
              variant="ghost"
              onClick={smartBack}
              size="icon"
              className="w-fit text-slate-700"
            >
              <Image
                alt={`${store?.name || "Rou-Menu"} Logo`}
                width={100}
                height={100}
                className="rounded-full size-8"
                src={store?.urlPoster || logoApp}
                onError={() => {
                  dispatchStore({
                    type: "Add",
                    payload: {
                      ...store,
                      urlPoster: "",
                    },
                  });
                }}
              />
            </Button>
            <HeaderInfo />
            <Button className={"p-2"} variant="ghost" onClick={open}>
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
                    {user.user_metadata.full_name.split(" ")[0]}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="size-8">
                  <AvatarImage src={logoUser} alt="@shadcn" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </Button>
          </div>
        </header>
      </>
    </>
  );
}

const HeaderInfo = () => {
  const params = useParams();
  const pathname = usePathname();
  const { store } = useContext(MyContext);
  // Memoizar búsquedas costosas
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

  // Calcular título principal
  const mainTitle = useMemo(() => {
    if (params?.id) {
      return isCommentPage ? "Comentarios" : currentProduct?.title;
    }
    if (params?.uid) {
      return currentCategory?.name;
    }
    return store?.name || "Rou-Menu";
  }, [
    params?.id,
    params?.uid,
    isCommentPage,
    currentProduct?.title,
    currentCategory?.name,
    store?.name,
  ]);

  // Calcular subtítulo
  let subtitle: string | undefined = "";
  if (params?.id) {
    subtitle = isCommentPage ? currentProduct?.title : currentCategory?.name;
  } else if (params?.uid) {
    subtitle = store?.name || "Rou-Menu";
  }

  return (
    <div>
      <span className="font-cinzel text-[16px] text-slate-800 line-clamp-1 text-center">
        {mainTitle}
      </span>
      <div className="flex items-center justify-center gap-2">
        {subtitle ? (
          <span className="text-[10px]">{subtitle}</span>
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
