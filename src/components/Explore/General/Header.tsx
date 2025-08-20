"use client";
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, User, Bell, Heart, Search } from "lucide-react";
import { HiMiniBars3BottomRight } from "react-icons/hi2";
import { logoApp } from "@/lib/image";
import { usePathname } from "next/navigation";

export default function Header({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="">
      {!pathname.includes("/t/") && (
        <div className="sticky top-0 flex items-center bg-slate-50 p-2 gap-2 justify-between z-50">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
              {"RouMenu".charAt(0).toUpperCase()}
            </AvatarFallback>
            <AvatarImage src={logoApp} alt={"RouMenu"} />
          </Avatar>
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-2xl h-full overflow-hidden">
              <div
                className="text-[#49739c] flex border-none bg-[#e7edf4] items-center justify-center pl-4 rounded-l-lg border-r-0"
                data-icon="MagnifyingGlass"
                data-size="24px"
                data-weight="regular"
              >
                <Search />
              </div>
              <input
                placeholder="Search"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-2xl text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-full placeholder:text-[#49739c] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              />
            </div>
          </label>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" className="p-0 m-0">
                <HiMiniBars3BottomRight className="size-6 text-gray-700 " />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>rouMenu</DrawerTitle>
                  <DrawerDescription>
                    Explora y descubre catalogos con mayor facilidad
                  </DrawerDescription>
                </DrawerHeader>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-primary text-primary-foreground p-4 rounded-xl shadow-sm">
                    <Settings className="w-6 h-6 mb-2" />
                    <h3 className="font-semibold text-sm">Configuración</h3>
                    <p className="text-xs opacity-90 mt-1">
                      Ajustes del sistema
                    </p>
                  </div>

                  <div className="bg-secondary text-secondary-foreground p-4 rounded-xl shadow-sm">
                    <User className="w-6 h-6 mb-2" />
                    <h3 className="font-semibold text-sm">Perfil</h3>
                    <p className="text-xs opacity-90 mt-1">
                      Información personal
                    </p>
                  </div>

                  <div className="bg-accent text-accent-foreground p-4 rounded-xl shadow-sm">
                    <Bell className="w-6 h-6 mb-2" />
                    <h3 className="font-semibold text-sm">Notificaciones</h3>
                    <p className="text-xs opacity-90 mt-1">
                      Alertas y mensajes
                    </p>
                  </div>

                  <div className="bg-muted text-muted-foreground p-4 rounded-xl shadow-sm">
                    <Heart className="w-6 h-6 mb-2" />
                    <h3 className="font-semibold text-sm">Favoritos</h3>
                    <p className="text-xs opacity-90 mt-1">
                      Elementos guardados
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    Elementos Recientes
                  </h3>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-muted/50 p-4 rounded-xl border border-border hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">
                            Elemento {i + 1}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Descripción del elemento
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-secondary rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}
      {children}
    </div>
  );
}
