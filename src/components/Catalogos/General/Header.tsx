"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MyContext } from "@/context/MyContext";
import { ScheduleInterface } from "@/context/InitialStatus";
import "@github/relative-time-element";
import { TbMenuDeep } from "react-icons/tb";
import { isOpen, IsOpenStoreInteface } from "@/functions/time";
import OpenClose from "./OpenClose";
import { useHistory } from "@/context/AppContext";
import ShareButton from "@/components/myUI/buttonShare";
import Link from "next/link";

export default function Header({ onOpen }: { onOpen: () => void }) {
  const { store } = useContext(MyContext);
  const { smartBack } = useHistory();
  const pathname = usePathname();

  const [isOpenStore, setIsOpenStore] = useState<IsOpenStoreInteface>({
    week: 1,
    open: false,
  });

  // Update store open status
  useEffect(() => {
    setIsOpenStore(isOpen((store.horario || []) as ScheduleInterface[]));
  }, [store.horario]);

  // Memoized handlers

  return (
    <header className="sticky top-0 z-50 bg-white h-12 p-4 w-full flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <Button variant="ghost" onClick={smartBack} size="icon">
          <Image
            alt={`${store?.name || "Rou-Menu"} Logo`}
            width={100}
            height={100}
            className="rounded-full w-8 h-8"
            src={store?.urlPoster || "/default-logo.png"}
          />
        </Button>
        <Link href={`/t/${store.sitioweb}`} className="ml-4">
          <h1 className="text-base font-cinzel tracking-wider text-[var(--text-gold)] uppercase line-clamp-1 truncate">
            {store?.name || "Rou-Menu"}
          </h1>
          <div className="flex text-[8px] text-[var(--text-muted)] gap-1">
            <span
              className={
                isOpenStore.open
                  ? "text-green-400 font-bold"
                  : "text-red-400 font-bold"
              }
            >
              {isOpenStore.open ? "ABIERTO" : "CERRADO"}
            </span>
            {" · "}
            <OpenClose open={isOpenStore} newHorario={store.horario || []} />
          </div>
        </Link>
      </div>

      <div className="flex gap-2">
        {pathname.includes("/about") && (
          <ShareButton
            title={store.name}
            text={store.parrrafo}
            url={`https://roumenu.vercel.app/t/${store.sitioweb}`}
          />
        )}
        <Button aria-label="Abrir menú" variant={"ghost"} onClick={onOpen}>
          <TbMenuDeep className="text-[var(--text-gold)] cursor-pointer" />
        </Button>
      </div>
    </header>
  );
}
