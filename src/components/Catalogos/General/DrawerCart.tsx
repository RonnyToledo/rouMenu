"use client";

import React, { useContext, useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MyContext } from "@/context/MyContext";
import { smartRound } from "@/functions/precios";
import { Categoria, Product } from "@/context/InitialStatus";
import {
  MdOutlineShoppingCart,
  MdOutlineShoppingCartCheckout,
} from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function DrawerCart() {
  const { store, dispatchStore } = useContext(MyContext);
  const [contentCart, setContentCart] = useState<number>(0);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleToCart = (productToCart: Product) => {
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify(productToCart),
    });
  };

  const getTotalItems = () => {
    return store.products.reduce((total, item) => total + item.Cant, 0);
  };

  const getTotalPrice = () => {
    return store.products.reduce(
      (total, item) => total + (item.price || 0) * item.Cant,
      0
    );
  };
  useEffect(() => {
    const value = store.products.reduce(
      (sum, product) => (sum = sum + (product.Cant || 0)),
      0
    );
    setContentCart(value);
    if (value === 0) setOpenDrawer(false);
  }, [store.products]);

  function RedirectLink(Id: string, categoria: string) {
    if (DetectCategoria(categoria, store.categorias)) {
      //IR a categoria especifica
      if (pathname.includes("/category/")) {
        // Si estamos en la pagina de categorias
        const element = document.getElementById(Id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        router.push(`/t/${store.sitioweb}/category/${categoria}#${Id}`);
      }
    } else {
      // IR a home"
      if (!pathname.includes("/category/")) {
        // Si estamos en la pagina de home
        const element = document.getElementById(Id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        router.push(`/t/${store.sitioweb}#${Id}`);
      }
    }
    setOpenDrawer(false);
  }
  const GoToCart = async () => {
    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 1700));
    setIsAddingToCart(false);
    setShowSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setShowSuccess(false);
    router.push(`/t/${store.sitioweb}/carrito`);
    setOpenDrawer(false);
  };

  return (
    contentCart > 0 &&
    !(pathname.includes("/carrito") || pathname.includes("/producto")) && (
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerTrigger asChild>
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-10 shadow-lg  max-w-md mx-auto">
            <Button
              variant={"ghost"}
              className="flex items-center w-full justify-between py-2 px-4 h-auto"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <Shop />{" "}
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {getTotalItems()}
                  </Badge>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {getTotalItems()}{" "}
                    {getTotalItems() === 1 ? "producto" : "productos"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Total: ${getTotalPrice().toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="border border-gray-400 flex items-center p-1 rounded-lg">
                <MdOutlineShoppingCart />
                Ver Pedido
              </div>
            </Button>
          </div>
        </DrawerTrigger>

        <DrawerContent className="max-h-[75vh] max-w-md mx-auto">
          <DrawerHeader className="py-2 px-4">
            <DrawerTitle>
              <Button
                variant={"ghost"}
                className="flex items-center w-full justify-between p-0 h-auto"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Shop />{" "}
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center text-center p-0 text-xs">
                      {getTotalItems()}
                    </Badge>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {getTotalItems()}{" "}
                      {getTotalItems() === 1 ? "producto" : "productos"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Total: ${getTotalPrice().toFixed(2)}
                    </p>
                  </div>
                </div>
                <div></div>
              </Button>
            </DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>

          <div className="max-h-80 overflow-y-auto">
            <ScrollArea className="max-h-52">
              {store.products
                .filter((item) => item.Cant > 0)
                .map((item, index) => (
                  <div key={item.id}>
                    <div className="flex justify-between items-center px-3 py-2">
                      <Button
                        variant={"ghost"}
                        onClick={() =>
                          RedirectLink(item.productId, item.caja || "")
                        }
                        className="h-10 p-0 justify-between  animate-in slide-in-from-bottom-2 duration-300"
                      >
                        <Image
                          src={item.image || store.urlPoster || logoApp}
                          alt={item.title || "Producto"}
                          className="size-10 object-cover rounded"
                          width={150}
                          height={150}
                        />
                        <div className="flex flex-col items-start justify-center">
                          <p className="text-sm font-medium text-gray-900 truncate text-center">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 text-center">
                            ${smartRound(item.price || 0)} × {item.Cant}
                          </p>
                        </div>
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium  text-center">
                          {item.Cant}
                        </span>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleToCart({
                              ...item,
                              Cant: 0,
                            })
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3 text-red-700" />
                        </Button>
                      </div>
                    </div>
                    {store.products.filter((item) => item.Cant > 0).length !==
                      index + 1 && <Separator />}
                  </div>
                ))}
            </ScrollArea>
          </div>

          <DrawerFooter>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
            <Button
              onClick={() => GoToCart()}
              className={`w-full h-12 text-base font-medium rounded-3xl transition-all duration-300 ${
                showSuccess
                  ? "bg-green-600 hover:bg-green-700"
                  : "hover:scale-105"
              } ${isAddingToCart ? "scale-95" : ""}`}
            >
              {isAddingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Agregando porductos...
                </div>
              ) : showSuccess ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  Carrito listo
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Proceder al Checkout
                  <MdOutlineShoppingCartCheckout />
                </div>
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  );
}
function DetectCategoria(
  categoria: string,
  allCAtegorias: Categoria[]
): boolean {
  return allCAtegorias.find((cat) => cat.id === categoria)?.subtienda || false;
}
function Shop() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}
