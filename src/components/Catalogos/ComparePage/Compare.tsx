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
    setLeft(compareFromStore[0] || null);
    setRight(compareFromStore[1] || compareFromStore[0] || null);
    setTimeout(() => setIsLoading(false), 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.products]);

  const handleToCart = (productToCart: Product) => {
    dispatchStore({ type: "AddCart", payload: JSON.stringify(productToCart) });
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
      if (winners[k] === "left") points.left += 1;
      else if (winners[k] === "right") points.right += 1;
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
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-6 bg-secondary rounded-full w-48" />
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-secondary rounded-2xl h-72" />
            <div className="bg-secondary rounded-2xl h-72" />
          </div>
        </div>
      </div>
    );
  }

  const cellClass = (
    side: "left" | "right",
    field: keyof NonNullable<typeof result>["winners"],
  ) => {
    if (!result) return "p-3 text-center";
    const winner = result.winners[field];
    if (winner === "tie") return "p-3 text-center";
    return winner === side
      ? "p-3 text-center ring-1 ring-primary/40 bg-primary/5 rounded-xl transition-shadow"
      : "p-3 text-center opacity-75";
  };

  return (
    <div className="min-h-screen bg-background py-4 px-3">
      <div className="h-16" />
      <div className="max-w-5xl mx-auto">
        <div className="bg-secondary/50 border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Selectores */}
          <div className="grid grid-cols-2 gap-2 border-b border-border p-3">
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

          {/* Imágenes */}
          <div className="grid grid-cols-2 border-b border-border">
            {[left, right].map((prod, i) => (
              <div
                key={i}
                className="p-4 flex justify-center border-r last:border-r-0 border-border"
              >
                {prod ? (
                  <Link
                    href={`/t/${store.sitioweb}/producto/${prod.productId}`}
                  >
                    <Image
                      width={160}
                      height={160}
                      src={prod.image || logoApp}
                      alt={prod.title}
                      className="w-32 h-32 object-cover rounded-xl border border-border"
                    />
                  </Link>
                ) : (
                  <Skeleton className="w-32 h-32 rounded-xl" />
                )}
              </div>
            ))}
          </div>

          {/* Precio */}
          <div className="grid grid-cols-2 border-b border-border">
            <div className={cellClass("left", "price")}>
              {left ? (
                <div className="space-y-0.5">
                  <p className="text-xl font-bold text-foreground">
                    ${smartRound(left.price)}
                  </p>
                  {(left.oldPrice || 0) > (left.price || 0) && (
                    <p className="text-xs text-muted-foreground line-through">
                      ${left.oldPrice}
                    </p>
                  )}
                </div>
              ) : (
                <Skeleton className="h-7 w-full rounded-xl" />
              )}
            </div>
            <div className={cellClass("right", "price")}>
              {right ? (
                <div className="space-y-0.5">
                  <p className="text-xl font-bold text-foreground">
                    ${smartRound(right.price)}
                  </p>
                  {(right.oldPrice || 0) > (right.price || 0) && (
                    <p className="text-xs text-muted-foreground line-through">
                      ${right.oldPrice}
                    </p>
                  )}
                </div>
              ) : (
                <Skeleton className="h-7 w-full rounded-xl" />
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="grid grid-cols-2 border-b border-border">
            <div className={cellClass("left", "rating")}>
              {left ? (
                <div className="flex justify-center items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">
                    {(left.coment?.promedio ?? 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({left.coment?.total ?? 0})
                  </span>
                </div>
              ) : (
                <Skeleton className="h-5 w-full rounded-xl" />
              )}
            </div>
            <div className={cellClass("right", "rating")}>
              {right ? (
                <div className="flex justify-center items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">
                    {(right.coment?.promedio ?? 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({right.coment?.total ?? 0})
                  </span>
                </div>
              ) : (
                <Skeleton className="h-5 w-full rounded-xl" />
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 border-b border-border">
            <div className={cellClass("left", "stock")}>
              {left ? (
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    left.stock
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${left.stock ? "bg-emerald-400" : "bg-red-400"}`}
                  />
                  {left.stock ? "En stock" : "Agotado"}
                </div>
              ) : (
                <Skeleton className="h-5 w-full rounded-xl" />
              )}
            </div>
            <div className={cellClass("right", "stock")}>
              {right ? (
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    right.stock
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${right.stock ? "bg-emerald-400" : "bg-red-400"}`}
                  />
                  {right.stock ? "En stock" : "Agotado"}
                </div>
              ) : (
                <Skeleton className="h-5 w-full rounded-xl" />
              )}
            </div>
          </div>

          {/* Add to cart */}
          <div className="grid grid-cols-2 border-b border-border">
            {[
              { prod: left, side: "left" as const },
              { prod: right, side: "right" as const },
            ].map(({ prod, side }) => (
              <div
                key={side}
                className="p-3 flex justify-center border-r last:border-r-0 border-border"
              >
                {prod ? (
                  prod.Cant === 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs w-full border-border gap-1.5"
                      disabled={!prod.stock}
                      onClick={() =>
                        handleToCart({
                          ...prod,
                          Cant: (prod.Cant || 0) + 1,
                        } as Product)
                      }
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {prod.stock ? "Agregar" : "No disponible"}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 rounded-full border border-border"
                        onClick={() =>
                          handleToCart({
                            ...prod,
                            Cant: (prod.Cant || 0) - 1,
                          } as Product)
                        }
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-semibold text-foreground w-5 text-center">
                        {prod.Cant}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 rounded-full border border-border"
                        onClick={() =>
                          handleToCart({
                            ...prod,
                            Cant: (prod.Cant || 0) + 1,
                          } as Product)
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                ) : (
                  <Skeleton className="h-8 w-full rounded-xl" />
                )}
              </div>
            ))}
          </div>

          {/* Descripción */}
          <div className="grid grid-cols-2 border-b border-border">
            <div className="p-3 border-r border-border text-xs text-muted-foreground">
              {left ? (
                <ExpandableText text={left.descripcion || ""} />
              ) : (
                <Skeleton className="h-7 w-full rounded-xl" />
              )}
            </div>
            <div className="p-3 text-xs text-muted-foreground">
              {right ? (
                <ExpandableText text={right.descripcion || ""} />
              ) : (
                <Skeleton className="h-7 w-full rounded-xl" />
              )}
            </div>
          </div>

          {/* Características */}
          <div className="grid grid-cols-2">
            {[left, right].map((prod, i) => (
              <div
                key={i}
                className={`p-3 flex flex-wrap gap-1.5 ${i === 0 ? "border-r border-border" : ""}`}
              >
                {prod
                  ? prod.caracteristicas.map((obj, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="rounded-full text-xs border border-border px-2"
                      >
                        {obj}
                      </Badge>
                    ))
                  : Array.from({ length: 3 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-4 w-10 rounded-full" />
                    ))}
              </div>
            ))}
          </div>
        </div>

        {/* Resultado */}
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            {result
              ? result.global === "tie"
                ? `Empate técnico — ambos tienen ${result.points.left} puntos`
                : `Puntos: ${result.points.left} — ${result.points.right}`
              : "Selecciona dos productos para comparar"}
          </p>
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
          className="w-full justify-between truncate text-xs rounded-xl border-border text-foreground bg-background"
        >
          <ChevronsUpDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
          <span className="truncate">
            {idString ? title : "Seleccionar..."}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 border-border bg-background">
        <Command className="bg-background">
          <CommandInput
            placeholder="Buscar producto..."
            className="h-9 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <CommandList>
            <CommandEmpty className="text-muted-foreground text-xs p-3">
              No se encontró.
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
                  className="text-sm text-foreground"
                >
                  {p.title}
                  <Check
                    className={cn(
                      "ml-auto w-3.5 h-3.5",
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
