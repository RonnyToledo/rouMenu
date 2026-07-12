"use client";
import React, { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/InitialStatus";
import { getVariantBasePrice } from "@/lib/discountUtils";
import { smartRound } from "@/functions/precios";
import { logoApp } from "@/lib/image";
import { MyContext } from "@/context/MyContext";

interface Props {
  products: Product[];
  sitioweb: string;
  currentCurrency: string;
  title?: string;
}
export default function ProductSuggestions({
  products,
  sitioweb,
  currentCurrency,
  title = "Queda bien con...",
}: Props) {
  if (!products.length) return null;

  return (
    <section className="pt-5 border-t border-border">
      <h3 className="text-[11px] font-semibold text-foreground/60 uppercase tracking-widest mb-3 px-0">
        {title}
      </h3>

      {/* Scroll horizontal — sin padding-right para q las cartas "sangran" */}
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
        {products.map((p) => (
          <SuggestionCard
            key={p.productId}
            product={p}
            sitioweb={sitioweb}
            currentCurrency={currentCurrency}
          />
        ))}
      </div>
    </section>
  );
}

function SuggestionCard({
  product,
  sitioweb,
  currentCurrency,
}: {
  product: Product;
  sitioweb: string;
  currentCurrency: string;
}) {
  const { store } = useContext(MyContext);

  const variant = product.selected_variant;
  const price = getVariantBasePrice(variant);
  const oldPrice = variant?.oldPrice ?? 0;
  const inStock = (variant?.stock ?? 0) > 0;
  const image = variant?.image || "";
  const pct =
    oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;

  return (
    <Link
      href={`/t/${sitioweb}/producto/${product.productId}`}
      className="relative flex-none w-35 rounded-2xl overflow-hidden block"
      style={{ aspectRatio: "3/4" }}
    >
      {/* Imagen de fondo */}
      <Image
        src={image || store.urlPoster || logoApp}
        alt={product.title || ""}
        fill
        sizes="140px"
        className={[
          "object-cover transition-transform duration-300",
          !inStock ? "grayscale opacity-70" : "",
        ].join(" ")}
      />

      {/* Gradiente oscuro bottom-up */}
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />

      {/* Badge descuento */}
      {pct && (
        <span className="absolute top-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/85 text-white backdrop-blur-lg">
          -{pct}%
        </span>
      )}

      {/* Badge agotado */}
      {!inStock && (
        <span className="absolute top-2 right-2 text-[9px] font-medium px-2 py-0.5 rounded-full bg-black/55 text-white/80 backdrop-blur-lg">
          Agotado
        </span>
      )}

      {/* Título + precio sobre la sombra */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-[11px] font-medium text-white leading-snug line-clamp-2 drop-shadow mb-1">
          {product.title}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-semibold text-white drop-shadow">
            ${smartRound(price)}
          </span>
          <span className="text-[9px] text-white/50">{currentCurrency}</span>
          {oldPrice > price && (
            <span className="text-[9px] text-white/50 line-through">
              ${smartRound(oldPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
