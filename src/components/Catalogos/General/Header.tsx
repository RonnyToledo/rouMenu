"use client";
import React, { useContext } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MyContext } from "@/context/MyContext";
import { useHistory } from "@/context/AppContext";
import Link from "next/link";
import SheetComponent from "./SheetComponent";

export default function Header() {
  const { smartBack } = useHistory();

  const { store } = useContext(MyContext);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-slate-50 to-slate-100 h-16 p-2 w-full  shadow-md">
      <div className="flex items-center justify-between border rounded-full h-full p-1 gap-3 bg-white ">
        <div className="flex items-center w-full">
          <Button
            variant="ghost"
            onClick={smartBack}
            size="icon"
            className="w-fit"
          >
            <Image
              alt={`${store?.name || "Rou-Menu"} Logo`}
              width={100}
              height={100}
              className="rounded-full size-10"
              src={store?.urlPoster || "/default-logo.png"}
            />
          </Button>
          <Link
            href={`/t/${store.sitioweb}/search`}
            className="ml-4 w-full flex gap-1 items-center text-base font-cinzel tracking-wider text-slate-700"
          >
            <h1 className=" line-clamp-1 truncate">
              {`Buscar en ${store?.name || "Rou-Menu"}`}
            </h1>
            <div className="flex text-[8px] text-[var(--text-muted)] gap-1"></div>
          </Link>
        </div>

        <SheetComponent />
      </div>
    </header>
  );
}
