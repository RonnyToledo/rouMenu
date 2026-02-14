"use client";
import React, { ReactNode, useEffect, useState } from "react";
import type { IconType } from "react-icons/lib";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HiMiniBars3BottomRight } from "react-icons/hi2";
import { logoApp } from "@/lib/image";
import { usePathname, useRouter } from "next/navigation";
import { ExplorationFooter } from "./Footer";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { FaHome, FaInfo } from "react-icons/fa";
import { RiCustomerServiceFill } from "react-icons/ri";
import { MdBook, MdContactPage } from "react-icons/md";

export const cardsinfo = [
  {
    path: "/",
    name: "Inicio",
    descripcion: "Ir a Inicio",
    icon: FaHome,
  },
  {
    path: "/info",
    name: "Info",
    descripcion: " Conoce mas acerca de RouMenu",
    icon: FaInfo,
  },
  {
    path: "/services",
    name: "Servicios",
    descripcion: "Ventajas al usar RouMenu",
    icon: RiCustomerServiceFill,
  },
  {
    path: "/blog",
    name: "Blog",
    descripcion: "Consejos y novedades",
    icon: MdBook,
  },
  {
    path: "/contact",
    name: "Contacto",
    descripcion: "Contactenos ante dudas o nuevas ideas",
    icon: MdContactPage,
  },
];

export default function Header({ children }: { children: ReactNode }) {
  const { generalData } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/buscar" && !search) return;
    const url = `/buscar${search ? `?buscar=${encodeURIComponent(search)}` : ""}`;
    router.replace(url);
  }, [search, pathname, router]);

  return (
    <div id="header-home">
      {/* LoginPopover: se abrirá si no hay user y no se mostró antes */}

      {!pathname.includes("/t/") && (
        <div className="sticky top-0 flex items-center bg-slate-100 p-2 gap-2 justify-between z-50 shadow-lg">
          <div className="bg-white rounded-full flex items-center gap-2 w-full max-w-3xl mx-auto px-2">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-white text-slate-600 text-sm font-medium">
                {"RouMenu".charAt(0).toUpperCase()}
              </AvatarFallback>
              <AvatarImage src={logoApp} alt={"RouMenu"} />
            </Avatar>

            {pathname !== "/buscar" ? (
              <Link
                href={"/buscar"}
                className="w-full flex items-center min-w-40 h-10"
              >
                <div className="w-full flex flex-col text-left">
                  <div className="flex items-center w-full h-full font-normal text-[10px] text-slate-400 gap-0">
                    Buscar en
                  </div>
                  <div className="flex items-center w-full h-full font-normal text-[14px] text-slate-600">
                    RouMenu
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex w-full flex-1 items-stretch rounded-2xl h-full overflow-hidden">
                <Input
                  placeholder={`Buscar "${generalData.random_title?.toLowerCase() ?? ""}"`}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input h-full flex w-full min-w-0 flex-1 resize-none overflow-hidden  text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-white focus:border-none placeholder:text-slate-500 px-4 text-xs font-normal leading-normal line-clamp-1"
                  value={search}
                />
              </div>
            )}
            {["/info", "/blog", "/contact", "/services", "/"].some((r) =>
              pathname.startsWith(r)
            ) ? (
              <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" className="p-0 m-0">
                    <HiMiniBars3BottomRight className="size-6 text-slate-700 " />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm p-2">
                    <DrawerHeader>
                      <DrawerTitle>rouMenu</DrawerTitle>
                      <DrawerDescription>
                        Explora y descubre catalogos con mayor facilidad
                      </DrawerDescription>
                    </DrawerHeader>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {cardsinfo
                        .filter((obj) => obj.path !== "/info")
                        .map((card, index) =>
                          card.path == pathname ? (
                            <CardDrawerActive
                              key={`Active_${index}`}
                              card={card}
                              onClick={() => setOpen(false)}
                            />
                          ) : (
                            <CardDrawer
                              key={`No_acive_${index}`}
                              card={card}
                              onClick={() => setOpen(false)}
                            />
                          )
                        )}
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}
      {children}
      {!pathname.includes("/t/") &&
        !pathname.includes("/buscar") &&
        !pathname.includes("/user") && <ExplorationFooter />}
    </div>
  );
}

interface CardDrawerInterface {
  name: string;
  descripcion: string;
  path: string;
  icon: IconType;
}
export function CardDrawerActive({
  card,
  onClick,
}: {
  card: CardDrawerInterface;
  onClick: () => void;
}) {
  return (
    <Link
      href={card.path}
      className="bg-primary text-primary-foreground p-4 rounded-xl shadow-sm"
      onClick={onClick}
    >
      <card.icon className="w-6 h-6 mb-2" />
      <h3 className="font-semibold text-sm">{card.name}</h3>
      <p className="text-xs opacity-90 mt-1">{card.descripcion}</p>
    </Link>
  );
}
export function CardDrawer({
  card,
  onClick,
}: {
  card: CardDrawerInterface;
  onClick: () => void;
}) {
  return (
    <Link
      href={card.path}
      className="bg-accent text-accent-foreground p-4 rounded-xl shadow-sm"
      onClick={onClick}
    >
      <card.icon className="w-6 h-6 mb-2" />
      <h3 className="font-semibold text-sm">{card.name}</h3>
      <p className="text-xs opacity-90 mt-1">{card.descripcion}</p>
    </Link>
  );
}
