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
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { FaHome, FaInfo } from "react-icons/fa";
import { RiCustomerServiceFill } from "react-icons/ri";
import { MdBook, MdContactPage } from "react-icons/md";

export const cardsinfo = [
  { path: "/", name: "Inicio", descripcion: "Ir a Inicio", icon: FaHome },
  {
    path: "/info",
    name: "Info",
    descripcion: "Conoce más acerca de RouMenu",
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
    descripcion: "Contáctenos ante dudas o nuevas ideas",
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
    const id = setTimeout(() => {
      const url = `/buscar${search ? `?buscar=${encodeURIComponent(search)}` : ""}`;
      router.replace(url);
    }, 300);
    return () => clearTimeout(id);
  }, [search, pathname, router]);

  return (
    <div id="header-home">
      {!pathname.includes("/t/") && (
        <div className="sticky top-0 flex items-center bg-background/90 backdrop-blur-lg border-b border-border p-2 gap-2 justify-between z-50 transition-colors">
          <div className=" rounded-full flex items-center gap-2 w-full max-w-3xl mx-auto px-2 border border-border">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarFallback className=" text-muted-foreground text-xs font-medium">
                {"RouMenu".charAt(0)}
              </AvatarFallback>
              <AvatarImage src={logoApp} alt="RouMenu" />
            </Avatar>

            {pathname !== "/buscar" ? (
              <Link
                href="/buscar"
                className="w-full flex items-center min-w-40 h-9"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[10px]  leading-none">Buscar en</span>
                  <span className="text-sm  leading-none mt-0.5">RouMenu</span>
                </div>
              </Link>
            ) : (
              <Input
                placeholder={`Buscar "${generalData.random_title?.toLowerCase() ?? ""}"`}
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                className="flex-1 h-9 border-none bg-transparent text-sm placeholder:text-muted-foreground focus:ring-0 focus:outline-none px-2"
              />
            )}

            {["/info", "/blog", "/contact", "/services", "/"].some((r) =>
              pathname.startsWith(r),
            ) ? (
              <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-8 h-8 shrink-0"
                  >
                    <HiMiniBars3BottomRight className="w-5 h-5 " />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm p-4">
                    <DrawerHeader>
                      <DrawerTitle className="font-serif">rouMenu</DrawerTitle>
                      <DrawerDescription className="text-muted-foreground text-sm">
                        Explora y descubre catálogos con mayor facilidad
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {cardsinfo
                        .filter((obj) => obj.path !== "/info")
                        .map((card, index) =>
                          card.path === pathname ? (
                            <CardDrawerActive
                              key={`Active_${index}`}
                              card={card}
                              onClick={() => setOpen(false)}
                            />
                          ) : (
                            <CardDrawer
                              key={`No_active_${index}`}
                              card={card}
                              onClick={() => setOpen(false)}
                            />
                          ),
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
    <Link href={card.path} className=" p-3.5 rounded-xl" onClick={onClick}>
      <card.icon className="w-5 h-5 mb-2" />
      <h3 className="font-semibold text-xs">{card.name}</h3>
      <p className="text-[10px] opacity-90 mt-0.5">{card.descripcion}</p>
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
      className=" border border-border  p-3.5 rounded-xl hover:bg-muted transition-colors"
      onClick={onClick}
    >
      <card.icon className="w-5 h-5 mb-2 " />
      <h3 className="font-semibold text-xs ">{card.name}</h3>
      <p className="text-[10px]  mt-0.5">{card.descripcion}</p>
    </Link>
  );
}
