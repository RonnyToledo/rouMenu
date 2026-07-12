import React from "react";
import { smartRound } from "@/functions/precios";
import { cn } from "@/lib/utils";

type ProductPriceProps = {
  price: number;
  oldPrice?: number | null;
  currency: string;
  size?: "sm" | "lg";
  /** Para el hero destacado, sobre fondo oscuro */
  onDark?: boolean;
};

export function ProductPrice({
  price,
  oldPrice,
  currency,
  size = "sm",
  onDark = false,
}: ProductPriceProps) {
  const hasDiscount = !!oldPrice && oldPrice > price;

  return (
    <div
      className={cn("flex items-baseline", size === "lg" ? "gap-2" : "gap-1.5")}
    >
      <span
        className={cn(
          "font-serif font-bold",
          size === "lg" ? "text-2xl" : "text-base",
          onDark ? "text-white" : "text-foreground",
        )}
      >
        ${smartRound(price)}
        {size === "lg" && (
          <span
            className={cn(
              "text-sm font-normal",
              onDark ? "text-white/60" : "text-muted-foreground",
            )}
          >
            {" "}
            {currency}
          </span>
        )}
      </span>
      {size !== "lg" && (
        <span className="text-[10px] text-muted-foreground font-medium">
          {currency}
        </span>
      )}
      {hasDiscount && (
        <span
          className={cn(
            "line-through",
            size === "lg" ? "text-sm" : "text-[10px]",
            onDark ? "text-rose-400" : "text-rose-500",
          )}
        >
          ${smartRound(oldPrice!)}
        </span>
      )}
    </div>
  );
}
