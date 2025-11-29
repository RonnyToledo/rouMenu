"use client";
import React, { useContext } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MyContext } from "@/context/MyContext";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { useSheet } from "./SheetComponent";
import { TbMenuDeep } from "react-icons/tb";
import { logoApp, logoUser } from "@/lib/image";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IoMdSearch } from "react-icons/io";
import HeroNew from "../home/HeroNew";

export default function Header() {
  const { user, smartBack } = useApp();
  const { open } = useSheet();
  const pathname = usePathname();
  const { store, dispatchStore } = useContext(MyContext);

  return (
    <>
      {pathname == `/t/${store.sitioweb}` ? (
        <>
          <div className="h-12 bg-slate-50 flex items-center justify-between p-2 w-full">
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
            <span className="ml-3 font-cinzel text-xl text-slate-800 font-bold line-clamp-1">
              {store?.name || "Rou-Menu"}
            </span>
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
          </div>
          <HeroNew />
        </>
      ) : null}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-50 to-transparent h-16 p-2 w-full">
        <div className="flex items-center justify-between shadow-md rounded-full h-full py-1 px-3 gap-3 bg-white ">
          <Button
            variant="ghost"
            onClick={smartBack}
            size="icon"
            className="w-fit text-slate-700"
          >
            <IoMdSearch className="size-6" />
          </Button>

          <Link
            href={`/t/${store.sitioweb}/search`}
            className="basis-4/5 w-full flex gap-1 items-start truncate text-base font-cinzel tracking-wider text-slate-700"
          >
            {`Buscar "${store?.productEnStock || "productos"}..."`}
          </Link>

          <Button className={"p-2"} variant="ghost" onClick={open}>
            <TbMenuDeep className="size-6 text-slate-600 cursor-pointer" />
          </Button>
        </div>
      </header>
    </>
  );
}
