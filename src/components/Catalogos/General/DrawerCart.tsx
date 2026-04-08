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
import { Categoria, Product } from "@/types/InitialStatus";
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
import { cartKey } from "@/reducer/reducerGeneral";
import { buildCartTitle } from "@/lib/variantUtils";

export default function DrawerCart() {
  const { store, dispatchStore } = useContext(MyContext);
  const [contentCart, setContentCart] = useState<number>(0);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleToCart = (productToCart: Product) => {
    dispatchStore({ type: "AddCart", payload: JSON.stringify(productToCart) });
  };

  const getTotalItems = () =>
    store.products.reduce(
      (total, item) =>
        total +
        item.Cant +
        (item?.agregados.reduce((sum, agg) => (sum = sum + agg.cant), 0) || 0),
      0,
    );

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
    queueMicrotask(() => {
      setContentCart(value);
      if (value === 0) setOpenDrawer(false);
    });
  }, [store.products]);

  function RedirectLink(Id: string, categoria: string) {
    if (DetectCategoria(categoria, store.categorias)) {
      if (pathname.includes("/category/")) ScrollTo(Id, 70);
      else router.push(`/t/${store.sitioweb}/category/${categoria}#${Id}`);
    } else {
      if (!pathname.includes("/category/")) ScrollTo(Id, 70);
      else router.push(`/t/${store.sitioweb}#${Id}`);
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
      toast.info(`Esta tienda tiene un mínimo de compra de ${store.limite}`);
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
          <div className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-border z-10 max-w-md mx-auto rounded-t-2xl transition-colors">
            <Button
              variant="ghost"
              className="flex items-center w-full justify-between py-2.5 px-4 h-auto text-foreground"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <Shop />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {getTotalItems()}
                  </Badge>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    {getTotalItems()}{" "}
                    {getTotalItems() === 1 ? "producto" : "productos"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total: ${getTotalFinal(store, store.products)}
                  </p>
                </div>
              </div>
              <div className="border border-border flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-foreground">
                <MdOutlineShoppingCart className="w-4 h-4" />
                Ver Pedido
              </div>
            </Button>
          </div>
        </DrawerTrigger>

        <DrawerContent className="max-h-[75vh] max-w-md mx-auto border-border bg-background">
          <DrawerHeader className="py-2 px-4">
            <DrawerTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Shop />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center text-center p-0 text-xs">
                    {getTotalItems()}
                  </Badge>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    {getTotalItems()}{" "}
                    {getTotalItems() === 1 ? "producto" : "productos"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total: ${getTotalFinal(store, store.products)}
                  </p>
                </div>
              </div>
            </DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>

          <div className="max-h-80 overflow-y-auto">
            <ScrollArea className="max-h-52">
              {store.products.map((item) => (
                <div key={cartKey(item)}>
                  {item.Cant !== 0 && (
                    <ListCard
                      productId={item.productId || ""}
                      caja={item.caja || ""}
                      default_moneda={item.default_moneda}
                      RedirectLink={RedirectLink}
                      // buildCartTitle construye "Cafe Capuchino · Rojo · M" desde attributes
                      title={buildCartTitle(
                        item.title || "Producto",
                        item.selected_variant,
                      )}
                      image={
                        item.selected_variant?.image ||
                        item.image ||
                        store.urlPoster ||
                        logoApp
                      }
                      cantidad={item.Cant}
                      embalaje={item.embalaje}
                      price={smartRound(item.price || 0)}
                      handleToCart={() => handleToCart({ ...item, Cant: 0 })}
                    />
                  )}
                  {item.agregados.map(
                    (agg, index) =>
                      agg.cant !== 0 && (
                        <ListCard
                          key={`${cartKey(item)}-agg-${index}`}
                          productId={item.productId || ""}
                          caja={item.caja || ""}
                          default_moneda={item.default_moneda}
                          embalaje={item.embalaje}
                          RedirectLink={RedirectLink}
                          title={`${buildCartTitle(item.title || "Producto", item.selected_variant)}-${agg.name}`}
                          image={
                            item.selected_variant?.image ||
                            item.image ||
                            store.urlPoster ||
                            logoApp
                          }
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
              <span className="text-sm font-semibold text-foreground">
                Total:
              </span>
              <span className="font-bold text-lg text-foreground">
                ${getTotalFinal(store, store.products)}
              </span>
            </div>
            <Button
              onClick={GoToCart}
              className={`w-full h-12 font-semibold rounded-full transition-all duration-300 gap-2 active:scale-[0.98] ${
                showSuccess ? "bg-emerald-600 hover:bg-emerald-700" : ""
              } ${isAddingToCart ? "scale-95" : ""}`}
            >
              {isAddingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Agregando productos...
                </>
              ) : showSuccess ? (
                <>
                  <div className="w-4 h-4 bg-primary-foreground rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                  </div>
                  Carrito listo
                </>
              ) : (
                <>
                  Proceder al Checkout
                  <MdOutlineShoppingCartCheckout className="w-4 h-4" />
                </>
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
    <div className="border-b border-border last:border-0">
      <div className="flex justify-between items-center px-3 py-2 gap-2">
        <Button
          variant="ghost"
          onClick={() => RedirectLink(productId, caja || "")}
          className="h-auto p-0 justify-start gap-3 flex-1 min-w-0 animate-in slide-in-from-bottom-2 duration-300"
        >
          <div className="relative shrink-0">
            <Image
              src={image}
              alt={title}
              className="w-10 h-10 object-cover rounded-xl border border-border"
              width={40}
              height={40}
            />
            <Badge className="absolute -bottom-1.5 -right-1.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
              {cantidad}
            </Badge>
          </div>
          <div className="flex flex-col items-start min-w-0">
            <p className="text-xs font-medium text-foreground truncate w-[45vw] text-start">
              {title}
            </p>
            <p className="text-[10px] text-muted-foreground">
              ${price}
              {embalaje > 0 ? ` + ${embalaje} emb.` : ""} {" · "}
              {store.moneda.find((m) => m.id == default_moneda)?.nombre || ""}
            </p>
          </div>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleToCart}
          className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </Button>
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
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}
