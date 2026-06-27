"use client";
/**
 * ProductGrid.tsx — Rediseño visual "Eclipse Café"
 * Compatible 100% con el reducer, tipos y lógica existentes.
 * Solo cambia la capa visual (clases CSS / estructura JSX).
 *
 * Paleta:
 *   --eclipse-cream   : #F5F0E8
 *   --eclipse-espresso: #2C1A0E
 *   --eclipse-caramel : #C4843A
 *   --eclipse-foam    : #FAF7F2
 *
 * Fuentes (añadir en layout.tsx / globals.css):
 *   @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
 */

import React, { useContext, useMemo, useCallback } from "react";
import { TbShoppingCartOff } from "react-icons/tb";
import { smartRound } from "@/functions/precios";
import { motion } from "framer-motion";
import { Product } from "@/types/InitialStatus";
import { cn } from "@/lib/utils";
import { MyContext } from "@/context/MyContext";
import Link from "next/link";
import Image from "next/image";
import { ButtonOfCart } from "../ButtonOfCart";
import { useRouter } from "next/navigation";
import { Star, Plus } from "lucide-react";
import { ScrollTo } from "@/functions/ScrollTo";
import { FaRegTrashCan } from "react-icons/fa6";
import { TbShoppingCartMinus, TbShoppingCart } from "react-icons/tb";
import {
  getVariantBasePrice,
  repriceVariantForQuantity,
} from "@/lib/discountUtils";
import StockAlertButton from "@/functions/StockAlertButton";

/* ─── Token helpers ─────────────────────────────────────────── */

/** Stock chip: verde / ámbar / gris según nivel */
function stockChip(stock: number, stockEnabled: boolean) {
  if (stock === 0)
    return { label: "Agotado", cls: "bg-neutral-800/80 text-neutral-400" };
  if (stock <= 5 && stockEnabled)
    return { label: "Pocas unidades", cls: "bg-amber-900/80 text-amber-300" };
  return { label: "", cls: "bg-transparent" };
}

/** Discount badge */
function discountPct(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/** Is product new (≤ 7 days) */
export function isNewProduct(date?: string): boolean {
  if (!date) return false;
  const diff = Date.now() - new Date(date).getTime();
  return diff / (1000 * 60 * 60 * 24) <= 7;
}

/* ─── Main export ───────────────────────────────────────────── */

interface ProductGridInterface {
  product: Product;
  banner: string;
  i: number;
  featured?: boolean;
}

export default React.memo(function ProductGrid({
  product,
  banner,
  i,
  featured = false,
}: ProductGridInterface) {
  const { store } = useContext(MyContext);
  const router = useRouter();

  const isNew = useMemo(() => isNewProduct(product.creado), [product.creado]);
  const currentCurrency = useMemo(
    () =>
      store.moneda.find((m) => m.id === product.default_moneda)?.nombre || "",
    [store.moneda, product.default_moneda],
  );
  const displayPrice = useMemo(
    () => getVariantBasePrice(product.selected_variant),
    [product.selected_variant],
  );
  const variantCount = product.variants_count ?? product.variants.length;
  const oldPrice =
    product.selected_variant?.oldPrice ?? product.selected_variant?.oldPrice;
  const pct = discountPct(displayPrice, oldPrice);
  const isInStock = product.selected_variant?.stock || 0;
  const needsProductPage = useMemo(() => variantCount > 1, [variantCount]);
  const hasMultipleVariants = variantCount > 1;

  const productUrl = useMemo(
    () => `/t/${store.sitioweb}/producto/${product.productId}`,
    [store.sitioweb, product.productId],
  );
  const handleNavigateToProduct = useCallback(() => {
    router.push(productUrl);
  }, [router, productUrl]);

  /* ── Featured card ── */
  if (featured) {
    return (
      <motion.div
        id={product.productId}
        className="col-span-2 row-span-2"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <FeaturedProductCard
          product={product}
          productUrl={productUrl}
          banner={banner}
          isInStock={isInStock}
          currentCurrency={currentCurrency}
        />
      </motion.div>
    );
  }

  /* ── Layout flags from store ── */
  const horizontal = store?.edit?.horizontal;
  const grid = store?.edit?.grid;
  const square = store?.edit?.square;
  const span = product?.span;

  /* ── Image aspect ── */
  const imgAspect = cn(
    "object-cover w-full transition-transform rounded-md duration-500 group-hover:scale-[1.04]",
    square
      ? "aspect-square"
      : span
        ? "aspect-video"
        : horizontal
          ? "h-full"
          : "aspect-square",
    !isInStock ? "grayscale opacity-60" : "",
  );

  /* ── Outer wrapper ── */
  const wrapperCls = cn(
    "group relative eclipse-body overflow-hidden",
    "rounded-md border transition-all duration-300",
    "bg-[var(--ef)] border-transparent",
    "hover:border-[rgba(196,132,58,0.4)] hover:shadow-[0_8px_32px_rgba(196,132,58,0.12)]",
    horizontal ? "flex" : span && grid ? "col-span-2" : "col-span-1",
  );

  const { label: stockLabel, cls: stockCls } = stockChip(
    isInStock,
    store.stocks,
  );
  return (
    <motion.div
      id={product.productId}
      className={wrapperCls}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: "easeOut" }}
    >
      {/* ── Image block ── */}
      <Link
        href={productUrl}
        className={cn(
          "relative block overflow-hidden shrink-0 ",
          horizontal ? "w-28" : "w-full",
        )}
      >
        <Image
          width={400}
          height={400}
          placeholder="blur"
          blurDataURL={product.selected_variant?.image || banner}
          alt={product.title || `Producto ${i}`}
          className={imgAspect}
          src={product.selected_variant?.image || banner}
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(44,26,14,0.55)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Stock chip */}
        <span
          className={cn(
            "absolute top-2 left-2 text-[9px] font-medium tracking-wide uppercase px-2 py-0.75 rounded-full backdrop-blur-lg",
            stockCls,
          )}
        >
          {stockLabel}
        </span>

        {/* Rating badge */}
        {product.coment?.promedio ? (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] bg-[rgba(44,26,14,0.7)] backdrop-blur-lg  px-2 py-0.75 rounded-full">
            <Star className="w-2.5 h-2.5 fill-(--eca) text-(--eca)" />
            {product.coment.promedio}
          </span>
        ) : null}

        {/* Discount badge */}
        {pct ? (
          <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-(--eca) text-white px-2 py-0.75 rounded-full">
            -{pct}%
          </span>
        ) : null}
      </Link>

      {/* ── Content block ── */}
      <div className="p-1.5 flex flex-col justify-between gap-1.5 min-w-0 flex-1">
        {/* Variants pill */}
        {hasMultipleVariants && (
          <span className="text-[9px] font-medium   px-2 py-0.5 rounded-[6px] self-start leading-tight">
            {variantCount} variantes
          </span>
        )}

        {/* Title */}
        <Link href={productUrl}>
          <h4
            className={cn(
              "eclipse-title font-semibold text-(--ee) line-clamp-2 leading-snug",
              "group-hover:text-(--eca) transition-colors duration-200",
              horizontal ? "text-sm" : "text-[13px]",
            )}
          >
            {product.title}
          </h4>
        </Link>

        {/* Description */}
        {!store?.edit?.minimalista && product.descripcion && (
          <p className="text-[10px] text-(--et) line-clamp-2 leading-relaxed">
            {cleanDescription(product.descripcion)}
          </p>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap gap-1">
          {isNew && <EclipseBadge color="red">Nuevo</EclipseBadge>}
          {product.favorito && (
            <EclipseBadge color="caramel">Popular</EclipseBadge>
          )}
          {product.selected_variant?.quantity_discounts?.length ? (
            <EclipseBadge color="teal">Precio por volumen</EclipseBadge>
          ) : null}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-1 h-8">
          {product.venta ? (
            <div className="flex items-baseline gap-1.5">
              <span className="eclipse-title text-base font-bold">
                ${smartRound(displayPrice)}
              </span>
              <span className="text-[10px]  font-medium">
                {currentCurrency}
              </span>
              {oldPrice && oldPrice > displayPrice ? (
                <span className="text-[10px] text-rose-500 line-through">
                  ${smartRound(oldPrice)}
                </span>
              ) : null}
            </div>
          ) : (
            <div />
          )}

          {store?.carrito &&
            (needsProductPage ? (
              <button
                type="button"
                onClick={handleNavigateToProduct}
                aria-label="Ver opciones"
                className={cn(
                  "w-8 h-8 rounded-[9px] flex items-center bg-primary justify-center shrink-0",
                  " text-white transition-colors duration-200",
                )}
              >
                <TbShoppingCart className="w-4 h-4" />
              </button>
            ) : (
              <EclipseCartAction product={product} isInStock={isInStock} />
            ))}
        </div>
      </div>
    </motion.div>
  );
});

/* ─── EclipseBadge ──────────────────────────────────────────── */

type BadgeColor = "red" | "caramel" | "teal" | "violet";
const badgeColors: Record<BadgeColor, string> = {
  red: "bg-rose-900/20 text-rose-400",
  caramel: "bg-amber-900/20 text-amber-400",
  teal: "bg-teal-900/20 text-teal-400",
  violet: "bg-violet-900/20 text-violet-400",
};

function EclipseBadge({
  color,
  children,
}: {
  color: BadgeColor;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "text-[9px] font-medium px-2 py-0.5 rounded-full",
        badgeColors[color],
      )}
    >
      {children}
    </span>
  );
}

/* ─── EclipseCartAction ─────────────────────────────────────── */

function EclipseCartAction({
  product,
  isInStock,
}: {
  product: Product;
  isInStock: number;
}) {
  if (!isInStock) {
    return (
      <StockAlertButton
        productId={product.productId}
        variantId={product.selected_variant.id}
        variant="icon"
      />
    );
  }
  return <ButtonOfCart product={product} />;
}

/* ─── FeaturedProductCard ───────────────────────────────────── */

interface FeaturedCardProps {
  product: Product;
  productUrl: string;
  banner: string;
  isInStock?: number;
  currentCurrency: string;
}

const FeaturedProductCard = React.memo(function FeaturedProductCard({
  product,
  productUrl,
  banner,
  isInStock,
  currentCurrency,
}: FeaturedCardProps) {
  return (
    <Link
      href={productUrl}
      className={cn(
        "group relative block rounded-[22px] overflow-hidden border border-[rgba(44,26,14,0.12)] hover:border-[rgba(196,132,58,0.45)] transition-all duration-400 h-full aspect-14/9 hover:shadow-[0_12px_48px_rgba(196,132,58,0.18)]",
      )}
    >
      <Image
        width={800}
        height={514}
        placeholder="blur"
        blurDataURL={product.selected_variant?.image || banner}
        alt={product.title || "Producto destacado"}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
          !isInStock ? "grayscale opacity-70" : "",
        )}
        src={product.selected_variant?.image || banner}
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(28,14,5,0.88)] via-[rgba(28,14,5,0.3)] to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white eclipse-body">
        {/* Top badges */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-medium px-3 py-1 rounded-full text-white">
            Destacado
          </span>
          {product.coment?.promedio ? (
            <span className="flex items-center gap-1 text-[11px] text-white/80">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {product.coment.promedio}
              <span className="text-white/50">({product.coment.total})</span>
            </span>
          ) : null}
          {!isInStock && (
            <span className="text-[10px] px-3 py-1 rounded-full bg-white/15 text-white/60">
              Agotado
            </span>
          )}
          {product.favorito && (
            <span className="text-[10px] px-3 py-1 rounded-full bg-amber-500/25 text-amber-300">
              Popular
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="eclipse-title text-2xl font-bold leading-tight mb-1">
          {product.title}
        </h3>

        {/* Description */}
        {product.descripcion && (
          <p className="text-[12px] text-white/65 mb-3 line-clamp-1">
            {cleanDescription(product.descripcion)}
          </p>
        )}

        <FeaturedFooter
          product={product}
          isInStock={isInStock}
          currentCurrency={currentCurrency}
        />
      </div>
    </Link>
  );
});

/* ─── FeaturedFooter ────────────────────────────────────────── */

interface FeaturedFooterProps {
  product: Product;
  isInStock?: number;
  currentCurrency: string;
}

const FeaturedFooter = React.memo(function FeaturedFooter({
  product,
  isInStock,
  currentCurrency,
}: FeaturedFooterProps) {
  const { store, dispatchStore } = useContext(MyContext);

  const productCant = product.selected_variant?.Cant || 0;
  const productStock = product.selected_variant?.stock || 0;
  const displayPrice = useMemo(
    () => getVariantBasePrice(product.selected_variant),
    [product.selected_variant],
  );
  const oldPrice =
    product.selected_variant?.oldPrice ?? product.selected_variant?.oldPrice;
  const isDisabled = store.stocks && productCant >= productStock;

  const handleIncrement = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isDisabled) return;
      ScrollTo(product.productId, 120);
      dispatchStore({
        type: "AddCart",
        payload: JSON.stringify({
          ...product,
          selected_variant: repriceVariantForQuantity(
            product.selected_variant,
            productCant + 1,
          ),
        }),
      });
    },
    [dispatchStore, product, productCant, isDisabled],
  );

  const handleDecrement = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dispatchStore({
        type: "AddCart",
        payload: JSON.stringify({
          ...product,
          selected_variant: repriceVariantForQuantity(
            product.selected_variant,
            Math.max(0, productCant - 1),
          ),
        }),
      });
    },
    [dispatchStore, product, productCant],
  );

  return (
    <div className="flex items-center justify-between">
      {/* Price block */}
      <div className="flex items-baseline gap-2">
        <span className="eclipse-title text-2xl font-bold text-white">
          ${smartRound(displayPrice)}{" "}
          <span className="text-sm font-normal text-white/60">
            {currentCurrency}
          </span>
        </span>
        {oldPrice && oldPrice > displayPrice ? (
          <span className="text-sm text-rose-400 line-through">
            ${smartRound(oldPrice)}
          </span>
        ) : null}
      </div>

      {/* Cart controls */}
      {!isInStock ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/40 text-sm">
          <TbShoppingCartOff className="size-4" />
          Agotado
        </div>
      ) : (
        <div className="flex items-center rounded-full overflow-hidden bg-white/15 border border-white/30 backdrop-blur-lg">
          {productCant > 0 && (
            <>
              <button
                type="button"
                onClick={handleDecrement}
                className="flex items-center px-4 py-2 text-white text-sm hover:bg-white/15 transition-colors"
                aria-label={
                  productCant === 1
                    ? "Eliminar del carrito"
                    : "Reducir cantidad"
                }
              >
                {productCant === 1 ? (
                  <FaRegTrashCan className="size-4" />
                ) : (
                  <TbShoppingCartMinus className="size-4" />
                )}
              </button>
              <span className="text-white text-sm font-medium px-1 min-w-5 text-center">
                {productCant}
              </span>
            </>
          )}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={!!isDisabled}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm hover:bg-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Agregar al carrito"
          >
            <Plus className="size-4" />
            {productCant === 0 && "Agregar"}
          </button>
        </div>
      )}
    </div>
  );
});

/* ─── Helpers ───────────────────────────────────────────────── */

/**
 * Limpia el formato raro del campo descripcion que viene del backend:
 * {"Yogurt Natural ", " Topin"} → "Yogurt Natural, Topin"
 */
function cleanDescription(raw?: string | null): string {
  if (!raw) return "";
  return raw
    .replace(/[{}"]/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" · ");
}
