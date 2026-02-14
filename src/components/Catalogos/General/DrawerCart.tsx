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
import { getTotalFinal } from "@/functions/getTotalPedido";
import { toast } from "sonner";
import { ScrollTo } from "@/functions/ScrollTo";

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
    return store.products.reduce(
      (total, item) =>
        total +
        item.Cant +
        (item?.agregados.reduce((sum, agg) => (sum = sum + agg.cant), 0) || 0),
      0,
    );
  };

  useEffect(() => {
    const value = store.products.reduce(
      (total, item) =>
        total +
        ((item.price || 0) + item.embalaje) * item.Cant +
        (item?.agregados.reduce(
          (sum, agg) => (sum = sum + (agg.price + item.embalaje)) * agg.cant,
          0,
        ) || 0),
      0,
    );
    setContentCart(value);

    if (value === 0) setOpenDrawer(false);
  }, [store.products]);

  function RedirectLink(Id: string, categoria: string) {
    if (DetectCategoria(categoria, store.categorias)) {
      //IR a categoria especifica
      if (pathname.includes("/category/")) {
        // Si estamos en la pagina de categorias
        ScrollTo(Id, 70);
      } else {
        router.push(`/t/${store.sitioweb}/category/${categoria}#${Id}`);
      }
    } else {
      // IR a home"
      if (!pathname.includes("/category/")) {
        // Si estamos en la pagina de home
        ScrollTo(Id, 70);
      } else {
        router.push(`/t/${store.sitioweb}#${Id}`);
      }
    }
    setOpenDrawer(false);
  }
  const GoToCart = async () => {
    if (contentCart >= store.limite) {
      setIsAddingToCart(true);
      await new Promise((resolve) => setTimeout(resolve, 1700));
      setIsAddingToCart(false);
      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setShowSuccess(false);
      router.push(`/t/${store.sitioweb}/carrito`);
      setOpenDrawer(false);
    } else
      toast.info(`Esta tienda tiene un minimo de compra de ${store.limite}`);
  };

  return (
    contentCart > 0 &&
    !(
      pathname.includes("/carrito") ||
      pathname.includes("/producto") ||
      pathname.includes("/blog")
    ) && (
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerTrigger asChild className="translate-y-16">
          <div className="sticky bottom-0 bg-white border-t z-10   max-w-md mx-auto rounded-t-2xl ">
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
                  <p className="text-sm font-medium text-slate-900">
                    {getTotalItems()}{" "}
                    {getTotalItems() === 1 ? "producto" : "productos"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Total: ${getTotalFinal(store, store.products)}
                  </p>
                </div>
              </div>
              <div className="border border-slate-400 flex items-center p-1 rounded-lg">
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
                    <p className="text-sm font-medium text-slate-900">
                      {getTotalItems()}{" "}
                      {getTotalItems() === 1 ? "producto" : "productos"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Total: ${getTotalFinal(store, store.products)}
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
              {store.products.map((item) => (
                <div key={item.id}>
                  {item.Cant !== 0 && (
                    <ListCard
                      productId={item.productId || ""}
                      caja={item.caja || ""}
                      default_moneda={item.default_moneda}
                      RedirectLink={RedirectLink}
                      title={item.title || "Producto"}
                      image={item.image || store.urlPoster || logoApp}
                      cantidad={item.Cant}
                      embalaje={item.embalaje}
                      price={smartRound(item.price || 0)}
                      handleToCart={() =>
                        handleToCart({
                          ...item,
                          Cant: 0,
                        })
                      }
                    />
                  )}
                  {item.agregados.map(
                    (agg, index) =>
                      agg.cant !== 0 && (
                        <ListCard
                          productId={item.productId || ""}
                          caja={item.caja || ""}
                          key={index}
                          default_moneda={item.default_moneda}
                          embalaje={item.embalaje}
                          RedirectLink={RedirectLink}
                          title={`${item.title}-${agg.name}` || "Producto"}
                          image={item.image || store.urlPoster || logoApp}
                          cantidad={agg.cant}
                          price={smartRound(agg.price || 0)}
                          handleToCart={() =>
                            handleToCart({
                              ...item,
                              agregados: item.agregados.map((obj) =>
                                obj.id === agg.id ? { ...obj, cant: 0 } : obj,
                              ),
                            })
                          }
                        />
                      ),
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>

          <DrawerFooter>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">
                ${getTotalFinal(store, store.products)}
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
interface ListCardInterface {
  RedirectLink: (id: string, caja: string) => void;
  productId: string;
  caja: string;
  image: string;
  default_moneda: number;
  title: string;
  price: number;
  embalaje: number;
  cantidad: number;
  handleToCart: () => void;
}
export function ListCard({
  RedirectLink,
  productId,
  caja,
  image,
  title,
  price,
  default_moneda,
  embalaje,
  cantidad,
  handleToCart,
}: ListCardInterface) {
  const { store } = useContext(MyContext);
  return (
    <div className="shadow-sm">
      <div className="flex justify-between items-center px-3 py-2 ">
        <Button
          variant={"ghost"}
          onClick={() => RedirectLink(productId, caja || "")}
          className="h-10 p-0 justify-between  animate-in slide-in-from-bottom-2 duration-300"
        >
          <div className="relative">
            <Image
              src={image}
              alt={title}
              className="size-10 object-cover rounded"
              width={150}
              height={150}
            />
            <Badge className="absolute -bottom-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {cantidad}
            </Badge>
          </div>
          <div className="flex flex-col items-start justify-center">
            <p className="text-sm font-medium text-slate-900 truncate text-start w-[50vw]">
              {title}
            </p>
            <p className="text-xs text-slate-500 text-center">
              ${price}
              {embalaje > 0 ? ` + ${embalaje} embalaje` : ""}
              {} {" - "}
              {store.moneda.find((m) => m.id == default_moneda)?.nombre || ""}
            </p>
          </div>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium  text-center">{cantidad}</span>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleToCart}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-3 h-3 text-red-700" />
          </Button>
        </div>
      </div>
    </div>
  );
}
export function DetectCategoria(
  categoria: string,
  allCAtegorias: Categoria[],
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
