"use client";
import React, { useContext, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MyContext } from "@/context/MyContext";
import { useApp } from "@/context/AppContext";
import { FaSearch } from "react-icons/fa";
import { useSheet } from "./SheetComponent";
import { logoApp, logoUser } from "@/lib/image";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import HeroNew from "../home/HeroNew";
import { Input } from "@/components/ui/input";

export default function Header() {
  const { user, smartBack } = useApp();
  const [searchWord, setSearchWord] = useState("");
  const { open } = useSheet();
  const pathname = usePathname();
  const { store, dispatchStore } = useContext(MyContext);
  const router = useRouter();
  return (
    <>
      {pathname == `/t/${store.sitioweb}` ? (
        <>
          <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-50 to-transparent h-16 p-2 w-full">
            <div className="flex items-center justify-between shadow-md rounded-full h-full py-1 px-3 gap-3 bg-white ">
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

              <span className="ml-3 font-cinzel text-xl text-slate-800 font-bold line-clamp-1">
                {store?.name || "Rou-Menu"}
              </span>

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
          <HeroNew />
        </>
      ) : null}
      <header className="bg-gradient-to-b from-slate-50 to-transparent h-16 p-2 w-full">
        <div className="relative flex items-center justify-between shadow-lg rounded-full h-full p-1 gap-3 bg-white overflow-hidden">
          <Input
            placeholder="Buscar productos..."
            autoFocus
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            className="w-full h-full border-none rounded-xl pl-4 pr-4 py-3 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-0 focus:ring-slate-400 focus:border-transparent transition-all"
          />
          <Button
            className={"p-2 absolute right-4"}
            variant="ghost"
            onClick={() =>
              router.push(`/t/${store.sitioweb}/search?buscar=${searchWord}`)
            }
          >
            <FaSearch className="size-6 text-slate-600 cursor-pointer" />
          </Button>
        </div>
      </header>
    </>
  );
}
