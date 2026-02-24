"use client";

import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
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
import { sileo } from "sileo";
import { ScrollTo } from "@/functions/ScrollTo";

export default function DrawerCart() {
  const { store, dispatchStore } = useContext(MyContext);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { totalItems, contentCart } = useMemo(() => {
    let items = 0;
    let value = 0;

    for (const item of store.products) {
      const aggCant =
        item.agregados?.reduce((sum, agg) => sum + agg.cant, 0) ?? 0;
      const aggValue =
        item.agregados?.reduce(
          (sum, agg) => sum + (agg.price + item.embalaje) * agg.cant,
          0,
        ) ?? 0;

      items += item.Cant + aggCant;
      value += ((item.price || 0) + item.embalaje) * item.Cant + aggValue;
    }

    return { totalItems: items, contentCart: value };
  }, [store.products]);

  useEffect(() => {
    if (contentCart === 0) setOpenDrawer(false);
  }, [contentCart]);

  const totalFinal = useMemo(
    () => getTotalFinal(store, store.products),
    [store],
  );

  const handleToCart = useCallback(
    (productToCart: Product) => {
      dispatchStore({
        type: "AddCart",
        payload: JSON.stringify(productToCart),
      });
    },
    [dispatchStore],
  );

  const RedirectLink = useCallback(
    (Id: string, categoria: string) => {
      if (DetectCategoria(categoria, store.categorias)) {
        if (pathname.includes("/category/")) {
          ScrollTo(Id, 70);
        } else {
          router.push(`/t/${store.sitioweb}/category/${categoria}#${Id}`);
        }
      } else {
        if (!pathname.includes("/category/")) {
          ScrollTo(Id, 70);
        } else {
          router.push(`/t/${store.sitioweb}#${Id}`);
        }
      }
      setOpenDrawer(false);
    },
    [store.categorias, store.sitioweb, pathname, router],
  );

  const GoToCart = useCallback(async () => {
    if (contentCart >= store.limite) {
      setIsAddingToCart(true);
      await new Promise((resolve) => setTimeout(resolve, 1700));
      setIsAddingToCart(false);
      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setShowSuccess(false);
      router.push(`/t/${store.sitioweb}/carrito`);
      setOpenDrawer(false);
    } else {
      sileo.info({
        title: "Mínimo de compra no alcanzado",
        description: `Esta tienda tiene un mínimo de compra de ${store.limite}`,
      });
    }
  }, [contentCart, store.limite, store.sitioweb, router]);

  const isHiddenPage =
    pathname.includes("/carrito") ||
    pathname.includes("/producto") ||
    pathname.includes("/blog");

  if (contentCart === 0 || isHiddenPage) return null;

  const checkoutButtonClass = `w-full h-12 text-base font-medium rounded-3xl transition-all duration-300 dark:text-slate-100 ${
    showSuccess ? "bg-green-600 hover:bg-green-700" : "hover:scale-105"
  } ${isAddingToCart ? "scale-95" : ""}`;

  return (
    <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
      <DrawerTrigger asChild className="translate-y-16">
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-10 max-w-md mx-auto rounded-t-2xl">
          <CartSummaryButton
            totalItems={totalItems}
            totalFinal={totalFinal}
            variant="trigger"
          />
        </div>
      </DrawerTrigger>

      <DrawerContent className="max-h-[75vh] max-w-md mx-auto dark:bg-slate-900 dark:border-slate-700">
        <DrawerHeader className="py-2 px-4">
          <DrawerTitle>
            <CartSummaryButton
              totalItems={totalItems}
              totalFinal={totalFinal}
              variant="header"
            />
          </DrawerTitle>
          <DrawerDescription />
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
                    handleToCart={() => handleToCart({ ...item, Cant: 0 })}
                  />
                )}
                {item.agregados?.map(
                  (agg, index) =>
                    agg.cant !== 0 && (
                      <ListCard
                        key={index}
                        productId={item.productId || ""}
                        caja={item.caja || ""}
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
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Total:
            </span>
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
              ${totalFinal}
            </span>
          </div>
          <Button onClick={GoToCart} className={checkoutButtonClass}>
            {isAddingToCart ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Agregando productos...
              </span>
            ) : showSuccess ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full" />
                </span>
                Carrito listo
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Proceder al Checkout
                <MdOutlineShoppingCartCheckout />
              </span>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function CartSummaryButton({
  totalItems,
  totalFinal,
  variant,
}: {
  totalItems: number;
  totalFinal: number | string;
  variant: "trigger" | "header";
}) {
  const isTrigger = variant === "trigger";
  return (
    <Button
      variant="ghost"
      className={`flex items-center w-full justify-between ${isTrigger ? "py-2 px-4 h-auto" : "p-0 h-auto"}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <ShopIcon />
          <Badge className="absolute -top-2 -right-2 size-3 flex items-center justify-center p-0 text-[8px] dark:text-slate-100">
            {totalItems}
          </Badge>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {totalItems} {totalItems === 1 ? "producto" : "productos"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total: ${totalFinal}
          </p>
        </div>
      </div>
      {isTrigger && (
        <div className="border border-slate-400 dark:border-slate-600 flex items-center p-1 rounded-lg text-slate-700 dark:text-slate-300">
          <MdOutlineShoppingCart />
          Ver Pedido
        </div>
      )}
    </Button>
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

export const ListCard = memo(function ListCard({
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
  const moneda = useMemo(
    () => store.moneda.find((m) => m.id === default_moneda)?.nombre || "",
    [store.moneda, default_moneda],
  );

  return (
    <div className="shadow-sm border-b border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center px-3 py-2">
        <Button
          variant="ghost"
          onClick={() => RedirectLink(productId, caja || "")}
          className="h-10 p-0 justify-between animate-in slide-in-from-bottom-2 duration-300"
        >
          <div className="relative">
            <Image
              src={image}
              alt={title}
              className="size-10 object-cover rounded"
              width={150}
              height={150}
            />
            <Badge className="absolute -bottom-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs dark:text-slate-100">
              {cantidad}
            </Badge>
          </div>
          <div className="flex flex-col items-start justify-center">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate text-start w-[50vw]">
              {title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              ${price}
              {embalaje > 0 ? ` + ${embalaje} embalaje` : ""}
              {" - "}
              {moneda}
            </p>
          </div>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-center text-slate-800 dark:text-slate-200">
            {cantidad}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToCart}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-3 h-3 text-red-700 dark:text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export function DetectCategoria(
  categoria: string,
  allCategorias: Categoria[],
): boolean {
  return allCategorias.find((cat) => cat.id === categoria)?.subtienda ?? false;
}

function ShopIcon() {
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
