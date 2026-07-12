"use client";

import React, { useContext, useMemo } from "react";
import Image from "next/image";
import { MyContext } from "@/context/MyContext";
import { logoApp } from "@/lib/image";
import { ScrollTo } from "@/functions/ScrollTo";
import { isNewProduct } from "./Product-Grid";
import { cn } from "@/lib/utils";

export function CategoryStories() {
  const { store } = useContext(MyContext);
  const newProducts = useMemo(
    () => store.products.filter((p) => isNewProduct(p.creado)),
    [store.products],
  );

  const hasNew = newProducts.length > 0;

  return (
    <section aria-label="Productos nuevos" className="pb-3">
      {hasNew && (
        <>
          <div className="w-full flex items-center justify-center p-1">
            <span className="text-[16px] uppercase tracking-wider text-center w-full">
              Novedades
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Un chip por producto nuevo */}
            {newProducts.map((product) => (
              <StoryChip
                key={product.productId}
                label={product.title}
                onClick={() => ScrollTo(product.productId, 120)}
                image={
                  product.selected_variant?.image || store.urlPoster || logoApp
                }
                ring
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ─── StoryChip ──────────────────────────────────────────────── */

interface StoryChipProps {
  label: string;
  onClick: () => void;
  image?: string;
  icon?: React.ReactNode;
  ring?: boolean;
}

function StoryChip({
  label,
  onClick,
  image,
  icon,
  ring = false,
}: StoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-16 shrink-0 flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          "rounded-full p-0.5 transition-all",
          ring ? "bg-linear-to-tr from-primary to-amber-400" : "bg-border",
        )}
      >
        <span className="block rounded-full bg-background p-0.5">
          {image ? (
            <Image
              src={image}
              alt={label}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
              {icon}
            </span>
          )}
        </span>
      </span>
      <span className="max-w-16 truncate text-xs text-foreground">{label}</span>
    </button>
  );
}
