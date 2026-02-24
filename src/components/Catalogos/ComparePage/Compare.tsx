"use client";

import React, { useEffect, useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/context/InitialStatus";
import Image from "next/image";
import { smartRound } from "@/functions/precios";
import { Minus, Plus } from "lucide-react";
import { logoApp } from "@/lib/image";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import ExpandableText from "../Specific/truncateText";

export default function ComparePage() {
  const { store, dispatchStore } = useContext(MyContext);

  const compareFromStore = store.products.filter((p: Product) => p.comparar);
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [left, setLeft] = useState<Product | null>(null);
  const [right, setRight] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const leftInit = compareFromStore[0] || null;
    const rightInit = compareFromStore[1] || compareFromStore[0] || null;
    setLeft(leftInit || null);
    setRight(rightInit || null);
    setTimeout(() => setIsLoading(false), 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.products]);

  const handleToCart = (productToCart: Product) => {
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify(productToCart),
    });
    dispatchStore({ type: "balanceMode", payload: false });
  };

  const availableOptions = (excludeId?: string | number) =>
    store.products.filter((p: Product) => p.id !== excludeId);

  const replaceProduct = (side: "left" | "right", productId: string) => {
    const found =
      store.products.find((p: Product) => p.productId == productId) || null;
    if (side === "left") setLeft(found);
    else setRight(found);
  };

  function computeWinners(a: Product | null, b: Product | null) {
    if (!a || !b) return null;
    const winners = {
      price: a.price < b.price ? "left" : a.price > b.price ? "right" : "tie",
      rating:
        (a.coment?.promedio ?? 0) > (b.coment?.promedio ?? 0)
          ? "left"
          : (a.coment?.promedio ?? 0) < (b.coment?.promedio ?? 0)
            ? "right"
            : "tie",
      stock:
        a.stock && !b.stock ? "left" : !a.stock && b.stock ? "right" : "tie",
      discount: (() => {
        const da = a.oldPrice > 0 ? (a.oldPrice - a.price) / a.oldPrice : 0;
        const db = b.oldPrice > 0 ? (b.oldPrice - b.price) / b.oldPrice : 0;
        return da > db ? "left" : da < db ? "right" : "tie";
      })(),
    };
    const points = { left: 0, right: 0 };
    (Object.keys(winners) as Array<keyof typeof winners>).forEach((k) => {
      const v = winners[k];
      if (v === "left") points.left += 1;
      else if (v === "right") points.right += 1;
    });
    const global =
      points.left > points.right
        ? "left"
        : points.right > points.left
          ? "right"
          : "tie";
    return { winners, points, global };
  }

  const result = computeWinners(left, right);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg h-80" />
            <div className="bg-white dark:bg-slate-900 rounded-lg h-80" />
          </div>
        </div>
      </div>
    );
  }

  const cellClass = (
    side: "left" | "right",
    field: keyof NonNullable<typeof result>["winners"],
  ) => {
    if (!result) return "p-2 text-center";
    const winner = result.winners[field];
    if (winner === "tie") return "p-2 text-center";
    return winner === side
      ? "p-2 text-center ring-2 ring-green-300 dark:ring-green-700 bg-green-50 dark:bg-green-900/20 rounded-md transition-shadow"
      : "p-2 text-center opacity-90";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 px-3">
      <div className="h-16"></div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden dark:border dark:border-slate-700">
          {/* Column selects */}
          <div className="grid grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-700 p-4 items-center">
            <PopoverComponent
              open1={open1}
              setOpen1={setOpen1}
              title={
                store.products.find((p) => p.productId === left?.productId)
                  ?.title || ""
              }
              array={availableOptions(right?.id)}
              idString={left?.productId || ""}
              replaceProduct={replaceProduct}
              point="left"
            />
            <PopoverComponent
              point="right"
              open1={open2}
              setOpen1={setOpen2}
              title={
                store.products.find((p) => p.productId === right?.productId)
                  ?.title || ""
              }
              array={availableOptions(left?.id)}
              idString={right?.productId || ""}
              replaceProduct={replaceProduct}
            />
          </div>

          <div className="space-y-0">
            {/* IMAGEN */}
            <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800 items-center">
              <div className="p-4 text-center">
                {left ? (
                  <Link
                    href={`/t/${store.sitioweb}/producto/${left.productId}`}
                  >
                    <Image
                      width={160}
                      height={160}
                      src={left.image || logoApp}
                      alt={left.title}
                      className="w-36 h-36 object-cover rounded-lg mx-auto"
                    />
                  </Link>
                ) : (
                  <Skeleton className="w-36 h-36 dark:bg-slate-700" />
                )}
              </div>
              <div className="p-4 text-center">
                {right ? (
                  <Link
                    href={`/t/${store.sitioweb}/producto/${right.productId}`}
                  >
                    <Image
                      width={160}
                      height={160}
                      src={right.image || logoApp}
                      alt={right.title}
                      className="w-36 h-36 object-cover rounded-lg mx-auto"
                    />
                  </Link>
                ) : (
                  <Skeleton className="w-36 h-36 dark:bg-slate-700" />
                )}
              </div>
            </div>

            {/* PRECIO */}
            <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
              <div className={cellClass("left", "price")}>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {left ? (
                      `$${smartRound(left.price)}`
                    ) : (
                      <Skeleton className="w-full h-7 dark:bg-slate-700" />
                    )}
                  </div>
                  {(left?.oldPrice || 0) > (left?.price || 0) && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 line-through">
                      ${smartRound(left?.oldPrice || 0)}
                    </div>
                  )}
                </div>
              </div>
              <div className={cellClass("right", "price")}>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {right ? (
                      `$${smartRound(right.price)}`
                    ) : (
                      <Skeleton className="w-full h-7 dark:bg-slate-700" />
                    )}
                  </div>
                  {(right?.oldPrice || 0) > (right?.price || 0) && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 line-through">
                      ${smartRound(right?.oldPrice || 0)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RATING */}
            <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
              <div className={cellClass("left", "rating")}>
                <div className="flex items-center justify-center gap-2">
                  {left ? (
                    <>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {left?.coment?.promedio ?? 0}
                      </span>
                    </>
                  ) : (
                    <Skeleton className="w-full h-7 dark:bg-slate-700" />
                  )}
                </div>
              </div>
              <div className={cellClass("right", "rating")}>
                <div className="flex items-center justify-center gap-2">
                  {right ? (
                    <>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {right?.coment?.promedio ?? 0}
                      </span>
                    </>
                  ) : (
                    <Skeleton className="w-full h-7 dark:bg-slate-700" />
                  )}
                </div>
              </div>
            </div>

            {/* CATEGORIA */}
            <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3 text-center">
                {left ? (
                  <Badge
                    variant="outline"
                    className="dark:border-slate-600 dark:text-slate-300"
                  >
                    {store.categorias.find((cat) => cat.id == left.caja)?.name}
                  </Badge>
                ) : (
                  <Skeleton className="w-full h-7 dark:bg-slate-700" />
                )}
              </div>
              <div className="p-3 text-center">
                {right ? (
                  <Badge
                    variant="outline"
                    className="dark:border-slate-600 dark:text-slate-300"
                  >
                    {store.categorias.find((cat) => cat.id == right.caja)?.name}
                  </Badge>
                ) : (
                  <Skeleton className="w-full h-7 dark:bg-slate-700" />
                )}
              </div>
            </div>

            {/* DISPONIBILIDAD */}
            <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
              <div className={cellClass("left", "stock")}>
                {left ? (
                  <Badge variant={left.stock ? "default" : "secondary"}>
                    {left.stock ? "En stock" : "Agotado"}
                  </Badge>
                ) : (
                  <Skeleton className="w-full h-7 dark:bg-slate-700" />
                )}
              </div>
              <div className={cellClass("right", "stock")}>
                {right ? (
                  <Badge variant={right.stock ? "default" : "secondary"}>
                    {right.stock ? "En stock" : "Agotado"}
                  </Badge>
                ) : (
                  <Skeleton className="w-full h-7 dark:bg-slate-700" />
                )}
              </div>
            </div>

            {/* DESCUENTO */}
            <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
              <div className={cellClass("left", "discount")}>
                {left ? (
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {left.oldPrice > left.price ? (
                      <span>
                        {Math.round(
                          ((left.oldPrice - left.price) / left.oldPrice) * 100,
                        )}
                        % off
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        Sin descuento
                      </span>
                    )}
                  </div>
                ) : (
                  <Skeleton className="w-full h-7 dark:bg-slate-700" />
                )}
              </div>
              <div className={cellClass("right", "discount")}>
                {right ? (
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {right.oldPrice > right.price ? (
                      <span>
                        {Math.round(
                          ((right.oldPrice - right.price) / right.oldPrice) *
                            100,
                        )}
                        % off
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        Sin descuento
                      </span>
                    )}
                  </div>
                ) : (
                  <Skeleton className="w-full h-7 dark:bg-slate-700" />
                )}
              </div>
            </div>

            {/* ACCIONES */}
            <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-4 text-center">
                {left ? (
                  left.Cant == 0 ? (
                    <Button
                      variant="outline"
                      className="text-xs w-full dark:border-slate-600 dark:text-slate-300"
                      disabled={!left.stock}
                      onClick={() =>
                        handleToCart({
                          ...left,
                          Cant: (left?.Cant || 0) + 1,
                        } as Product)
                      }
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {left.stock ? "Agg Carrito" : "No disponible"}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:border-slate-600 dark:text-slate-300"
                        onClick={() =>
                          handleToCart({
                            ...left,
                            Cant: (left?.Cant || 0) - 1,
                          } as Product)
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {left.Cant}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:border-slate-600 dark:text-slate-300"
                        onClick={() =>
                          handleToCart({
                            ...left,
                            Cant: (left?.Cant || 0) + 1,
                          } as Product)
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                ) : (
                  <Skeleton className="w-full h-16 dark:bg-slate-700" />
                )}
              </div>
              <div className="p-4 text-center">
                {right ? (
                  right.Cant == 0 ? (
                    <Button
                      variant="outline"
                      className="text-xs w-full dark:border-slate-600 dark:text-slate-300"
                      disabled={!right.stock}
                      onClick={() =>
                        handleToCart({
                          ...right,
                          Cant: (right?.Cant || 0) + 1,
                        } as Product)
                      }
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {right.stock ? "Agg Carrito" : "No disponible"}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:border-slate-600 dark:text-slate-300"
                        onClick={() =>
                          handleToCart({
                            ...right,
                            Cant: (right?.Cant || 0) - 1,
                          } as Product)
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {right.Cant}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:border-slate-600 dark:text-slate-300"
                        onClick={() =>
                          handleToCart({
                            ...right,
                            Cant: (right?.Cant || 0) + 1,
                          } as Product)
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                ) : (
                  <Skeleton className="w-full h-16 dark:bg-slate-700" />
                )}
              </div>
            </div>

            {/* DESCRIPCION */}
            <div className="grid grid-cols-2">
              <div className="p-4 text-xs text-slate-700 dark:text-slate-400 line-clamp-6">
                {left ? (
                  <ExpandableText text={left.descripcion || ""} />
                ) : (
                  <Skeleton className="w-full h-7 dark:bg-slate-700" />
                )}
              </div>
              <div className="p-4 text-xs text-slate-700 dark:text-slate-400 line-clamp-6">
                {right ? (
                  <ExpandableText text={right.descripcion || ""} />
                ) : (
                  <Skeleton className="w-full h-7 dark:bg-slate-700" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="p-4 text-xs text-slate-700 dark:text-slate-400 line-clamp-6 flex w-full flex-wrap gap-2">
              {left
                ? left?.caracteristicas.map((obj, index) => (
                    <Badge
                      key={index}
                      className="dark:bg-slate-700 dark:text-slate-200"
                    >
                      {obj}
                    </Badge>
                  ))
                : Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton
                      className="h-4 w-10 dark:bg-slate-700"
                      key={index}
                    />
                  ))}
            </div>
            <div className="p-4 text-xs text-slate-700 dark:text-slate-400 line-clamp-6 flex w-full flex-wrap gap-2">
              {right
                ? right?.caracteristicas.map((obj, index) => (
                    <Badge
                      key={index}
                      className="dark:bg-slate-700 dark:text-slate-200"
                    >
                      {obj}
                    </Badge>
                  ))
                : Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      className="w-10 h-4 dark:bg-slate-700"
                      key={index}
                    />
                  ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {result ? (
              result.global === "tie" ? (
                <>Empate técnico — ambos tienen {result.points.left} puntos</>
              ) : (
                <>
                  Puntos: {result.points.left} — {result.points.right}
                </>
              )
            ) : (
              <>Selecciona dos productos para comparar</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PopoverInterface {
  open1: boolean;
  setOpen1: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  idString: string;
  point: "left" | "right";
  array: Product[];
  replaceProduct: (side: "left" | "right", productId: string) => void;
}

function PopoverComponent({
  open1,
  setOpen1,
  title,
  array,
  idString,
  point,
  replaceProduct,
}: PopoverInterface) {
  return (
    <Popover open={open1} onOpenChange={setOpen1}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between truncate dark:border-slate-600 dark:text-slate-300 dark:bg-slate-900"
        >
          <ChevronsUpDown className="opacity-50" />
          {idString ? title : "Select product..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 dark:bg-slate-900 dark:border-slate-700">
        <Command className="dark:bg-slate-900">
          <CommandInput
            placeholder="Search product..."
            className="h-9 w-full truncate dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          <CommandList>
            <CommandEmpty className="dark:text-slate-400">
              No product found.
            </CommandEmpty>
            <CommandGroup>
              {array.map((p: Product) => (
                <CommandItem
                  key={p.id}
                  value={p.productId}
                  onSelect={(currentValue) => {
                    replaceProduct(point, currentValue);
                    setOpen1(false);
                  }}
                  className="dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {p.title}
                  <Check
                    className={cn(
                      "ml-auto",
                      idString === p.productId ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
