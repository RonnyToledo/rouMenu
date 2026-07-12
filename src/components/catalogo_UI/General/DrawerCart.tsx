"use client";

import React, { useContext, useState, useMemo, useCallback } from "react";
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
import { Categoria, Product, ProductVariant } from "@/types/InitialStatus";
import {
  MdOutlineShoppingCart,
  MdOutlineShoppingCartCheckout,
} from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { getTotalFinal } from "@/functions/getTotalPedido";
import { toast } from "sonner";
import { ScrollTo } from "@/functions/ScrollTo";
import { buildCartTitle } from "@/lib/variantUtils";
import { discountLabel, getApplicableDiscount } from "@/lib/discountUtils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Share2, Copy, Check, Trash2 } from "lucide-react";
import { buildShareCartUrl } from "@/lib/shareCart";
import { cartKey, isDefaultVariant } from "@/reducer/reducerGeneral";
import { useShareOrCopy } from "@/hooks/useShareOrCopy";
import FloatingDock from "@/components/cart/FloatingDock";

const EXCLUDED_ROUTE_SEGMENTS = ["/carrito", "/blog"];

export default function DrawerCart() {
  const { store, dispatchStore } = useContext(MyContext);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { share, copied } = useShareOrCopy();

  const handleToCart = useCallback(
    (productToCart: Product) => {
      dispatchStore({
        type: "AddCart",
        payload: JSON.stringify(productToCart),
      });
    },
    [dispatchStore],
  );

  const totalItems = useMemo(
    () =>
      store.products.reduce(
        (total, item) => total + (item.selected_variant?.Cant || 0),
        0,
      ),
    [store.products],
  );

  // FIX: derivar contentCart directo del store con useMemo en lugar de
  // useState+useEffect. El problema anterior: el componente no montaba cuando
  // contentCart era 0, asi el useEffect nunca corria al hidratar desde IDB,
  // y el drawer permanecia oculto aunque hubiera productos en el carrito.
  const contentCart = useMemo(
    () =>
      store.products.reduce((total, item) => {
        const effectivePrice = item.selected_variant?.price ?? 0;
        const productLine =
          (effectivePrice + (item.selected_variant?.embalaje ?? 0)) *
          (item.selected_variant?.Cant ?? 0);
        return total + productLine;
      }, 0),
    [store.products],
  );

  const cartTotal = useMemo(
    () => getTotalFinal(store, store.products),
    [store],
  );

  const redirectToProductOrCategory = useCallback(
    (id: string, categoria: string) => {
      if (DetectCategoria(categoria, store.categorias)) {
        if (pathname.includes("/category/")) ScrollTo(id, 70);
        else router.push(`/t/${store.sitioweb}/category/${categoria}#${id}`);
      } else {
        if (!pathname.includes("/category/")) ScrollTo(id, 70);
        else router.push(`/t/${store.sitioweb}#${id}`);
      }
      setOpenDrawer(false);
    },
    [store.categorias, store.sitioweb, pathname, router],
  );

  const goToCart = useCallback(async () => {
    if (contentCart < store.limite) {
      toast.info(`Esta tienda tiene un mínimo de compra de ${store.limite}`);
      return;
    }
    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 1700));
    setIsAddingToCart(false);
    setShowSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setShowSuccess(false);
    router.push(`/t/${store.sitioweb}/carrito`);
    setOpenDrawer(false);
  }, [contentCart, store.limite, store.sitioweb, router]);

  const handleShareCart = useCallback(() => {
    const items = store.products
      .filter((p) => (p.selected_variant?.Cant ?? 0) > 0)
      .map((p) => ({
        id: p.productId,
        ...(p.selected_variant?.id && !isDefaultVariant(p.selected_variant)
          ? { vid: p.selected_variant.id }
          : {}),
        qty: p.selected_variant?.Cant ?? 1,
      }));

    const url = buildShareCartUrl(store.sitioweb || "", items);
    share({ title: "Mi carrito", url });
  }, [store.products, store.sitioweb, share]);

  const isExcludedRoute = EXCLUDED_ROUTE_SEGMENTS.some((segment) =>
    pathname.includes(segment),
  );

  if (contentCart === 0 || isExcludedRoute) return null;

  return (
    <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
      <FloatingDock>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 rounded-full bg-background/90 backdrop-blur-lg border border-border shadow-lg px-3 py-2 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center">
                  <Shop />
                </div>
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                  {totalItems}
                </Badge>
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {totalItems} {totalItems === 1 ? "producto" : "productos"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total: ${cartTotal}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 shrink-0 h-9 px-4 rounded-full bg-primary text-background text-xs font-semibold">
              <MdOutlineShoppingCart className="size-4" />
              Ver Pedido
            </span>
          </button>
        </DrawerTrigger>
      </FloatingDock>

      <DrawerContent className="max-h-[75vh] max-w-md mx-auto border-border bg-background">
        <DrawerHeader className="py-2 px-4">
          <DrawerTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Shop />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center text-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    {totalItems} {totalItems === 1 ? "producto" : "productos"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total: ${cartTotal}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full shrink-0"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    <span className="sr-only">Más opciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleShareCart}
                    className="gap-2 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ¡Enlace copiado!
                        </span>
                      </>
                    ) : (
                      <>
                        {typeof navigator !== "undefined" ? (
                          <Share2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        Compartir carrito
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DrawerTitle>
          <DrawerDescription />
        </DrawerHeader>

        <div className="max-h-80 overflow-y-auto">
          <ScrollArea className="max-h-52">
            {store.products.map((item) => (
              <div key={cartKey(item)}>
                {item.selected_variant?.Cant !== 0 && (
                  <ListCard
                    productId={item.productId || ""}
                    caja={item.caja || ""}
                    default_moneda={item.default_moneda}
                    RedirectLink={redirectToProductOrCategory}
                    title={buildCartTitle(
                      item.title || "Producto",
                      item.selected_variant,
                    )}
                    image={
                      item.selected_variant?.image || store.urlPoster || logoApp
                    }
                    cantidad={item.selected_variant?.Cant || 0}
                    embalaje={item.selected_variant?.embalaje || 0}
                    price={smartRound(item.selected_variant?.price ?? 0)}
                    discountLabelText={
                      getApplicableDiscount(
                        item.selected_variant,
                        item.selected_variant?.Cant || 0,
                      )
                        ? discountLabel(
                            getApplicableDiscount(
                              item.selected_variant,
                              item.selected_variant?.Cant || 0,
                            )!,
                          )
                        : ""
                    }
                    handleToCart={() =>
                      handleToCart({
                        ...item,
                        selected_variant: {
                          ...item.selected_variant,
                          Cant: 0,
                        } as ProductVariant,
                      })
                    }
                  />
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
              ${cartTotal}
            </span>
          </div>
          <Button
            onClick={goToCart}
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
  discountLabelText?: string;
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
  discountLabelText,
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
            {discountLabelText ? (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                {discountLabelText}
              </p>
            ) : null}
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
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}
