"use client";
import React, { useContext, useMemo, useCallback } from "react";
import { TbShoppingCartOff } from "react-icons/tb";
import { smartRound } from "@/functions/precios";
import { motion } from "framer-motion";
import { Product } from "@/context/InitialStatus";
import { cn } from "@/lib/utils";
import { MyContext } from "@/context/MyContext";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ButtonOfCart } from "./ButtonOfCart";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Star, Plus } from "lucide-react";
import { ScrollTo } from "@/functions/ScrollTo";
import { FaRegTrashCan } from "react-icons/fa6";
import { TbShoppingCartMinus, TbShoppingCart } from "react-icons/tb";

interface ProductGridInterface {
  product: Product;
  banner: string;
  i: number;
  /** Si true, renderiza la tarjeta grande "featured" (ocupa col-span-2 row-span-2) */
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

  const handleNavigateToProduct = useCallback(() => {
    router.push(`/t/${store.sitioweb}/producto/${product.productId}`);
  }, [router, store.sitioweb, product.productId]);

  const productUrl = useMemo(
    () => `/t/${store.sitioweb}/producto/${product.productId}`,
    [store.sitioweb, product.productId],
  );

  const showAddToCartButton = useMemo(
    () => !product.venta || product.agregados.length > 0,
    [product.venta, product.agregados.length],
  );

  const isInStock = product.stock;

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

  const horizontal = store?.edit?.horizontal;
  const grid = store?.edit?.grid;
  const square = store?.edit?.square;
  const span = product?.span;

  const gridClasses = cn(
    "group relative bg-card rounded-2xl overflow-hidden border border-border",
    "hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
    horizontal
      ? "grid grid-cols-2"
      : span && grid
        ? "col-span-2"
        : "col-span-1",
  );

  const imageClasses = cn(
    "object-cover w-full transition-transform duration-500 group-hover:scale-105",
    square ? "aspect-square" : "aspect-[4/5]",

    span ? "aspect-video" : "",
    !isInStock ? "grayscale" : "",
  );

  return (
    <motion.div
      id={product.productId}
      className={gridClasses}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
    >
      {/* Image */}
      <Link href={productUrl} className="relative block overflow-hidden ">
        <Image
          width={400}
          height={300}
          placeholder="blur"
          blurDataURL={product.image || banner}
          alt={product.title || `Producto ${i}`}
          className={imageClasses}
          src={product.image || banner}
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating badge */}
        {product.coment?.promedio ? (
          <Badge className="absolute top-2 left-2 flex items-center gap-1 text-[11px] bg-black/40 backdrop-blur-sm text-white border-0">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.coment.promedio}
          </Badge>
        ) : null}
      </Link>

      {/* Content */}
      <div className="p-2 flex flex-col justify-between  gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h4>
          {product.coment?.promedio ? (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {product.coment.promedio}
            </div>
          ) : null}
        </div>

        {!store?.edit?.minimalista && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {product.descripcion || "…"}
          </p>
        )}

        {/* Badges */}
        <div className="flex gap-1 flex-wrap">
          {isNew && (
            <Badge className="bg-red-600/80 text-[10px] px-1.5 py-0">
              Nuevo
            </Badge>
          )}
          {product.favorito && (
            <Badge className="bg-amber-500/80 text-[10px] px-1.5 py-0">
              Popular
            </Badge>
          )}
          {!isInStock && (
            <Badge className="bg-violet-700/50 text-[10px] px-1.5 py-0">
              Agotado
            </Badge>
          )}
          {product.oldPrice > product.price && (
            <Badge className="bg-cyan-700/50 text-[10px] px-1.5 py-0">
              -
              {Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) * 100,
              )}
              % Off
            </Badge>
          )}
        </div>

        {/* Price + action */}
        <div className="flex items-center justify-between h-fit">
          {product.venta ? (
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-[10px]  font-semibold text-primary">
                ${smartRound(product.price)} {currentCurrency}
              </span>
              {product.oldPrice > product.price && (
                <span className="text-[10px] text-red-500 line-through">
                  ${smartRound(product.oldPrice)}
                </span>
              )}
            </div>
          ) : (
            <div />
          )}

          <div className="relative h-9 w-fit flex justify-end items-center">
            {showAddToCartButton ? (
              <Button
                size="sm"
                type="button"
                className="rounded-full text-xs size-8"
                onClick={handleNavigateToProduct}
                aria-label="Agregar al carrito"
              >
                <TbShoppingCart className="size-4" />
              </Button>
            ) : (
              store?.carrito && (
                <CartActionButton product={product} isInStock={isInStock} />
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

/* ─── Featured Card ─────────────────────────────────────────── */

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
      className="group relative block rounded-3xl overflow-hidden border border-border
        hover:border-primary/30 transition-all duration-300 h-full min-h-70 aspect-square"
    >
      {/* Background image */}
      <Image
        width={800}
        height={600}
        placeholder="blur"
        blurDataURL={product.image || banner}
        alt={product.title || "Producto destacado"}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ",
          !isInStock ? "grayscale" : "",
        )}
        src={product.image || banner}
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white">
        {/* Top badges */}
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 rounded-full bg-amber-500/80 text-white text-[11px] font-medium">
            Destacado
          </span>
          {product.coment?.promedio ? (
            <div className="flex items-center gap-1 text-sm text-white/80">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {product.coment.promedio}
            </div>
          ) : null}
          {!isInStock && (
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px]">
              Agotado
            </span>
          )}
        </div>

        <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-1 leading-tight">
          {product.title}
        </h3>

        <p className="text-white/70 text-sm mb-2 line-clamp-2">
          {product.descripcion || ""}
        </p>

        <FeaturedFooter
          product={product}
          isInStock={isInStock}
          currentCurrency={currentCurrency}
        />
      </div>
    </Link>
  );
});

/* ─── Featured Footer ───────────────────────────────────────── */

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

  const productCant = product.Cant || 0;
  const productStock = product.stock || 0;

  const isDisabled = store.stocks && productCant >= productStock;

  const totalCartItems = useMemo(
    () =>
      productCant + product.agregados.reduce((sum, obj) => sum + obj.cant, 0),
    [productCant, product.agregados],
  );

  const handleIncrement = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isDisabled) return;
      ScrollTo(product.productId, 120);
      dispatchStore({
        type: "AddCart",
        payload: JSON.stringify({ ...product, Cant: productCant + 1 }),
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
          Cant: Math.max(0, productCant - 1),
        }),
      });
    },
    [dispatchStore, product, productCant],
  );

  return (
    <div className="flex items-center justify-between">
      {/* Precio */}
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-2xl font-bold text-white">
          ${smartRound(product.price)} {currentCurrency}
        </span>
        {product.oldPrice > product.price && (
          <span className="text-sm text-red-400 line-through">
            ${smartRound(product.oldPrice)}
          </span>
        )}
      </div>

      {/* Botón expandido */}
      {!isInStock ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/50 text-sm">
          <TbShoppingCartOff className="size-4" />
          Agotado
        </div>
      ) : (
        <div className="flex items-center rounded-full overflow-hidden bg-white/15 border border-white/30 backdrop-blur-sm">
          {totalCartItems > 0 && (
            <div className="flex items-center justify-around">
              <button
                type="button"
                onClick={handleDecrement}
                className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium
              hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={
                  totalCartItems === 1
                    ? "Eliminar del carrito"
                    : "Reducir cantidad"
                }
              >
                {totalCartItems === 1 ? (
                  <span className="inline-flex">
                    <FaRegTrashCan className="size-4" />
                  </span>
                ) : (
                  <span className="inline-flex">
                    <TbShoppingCartMinus className="size-4" />
                  </span>
                )}
              </button>

              <span className="text-white text-sm font-medium px-1 min-w-5 text-center">
                {totalCartItems}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleIncrement}
            disabled={!!isDisabled}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium
              hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Agregar al carrito"
          >
            <Plus className="size-4" />
            {totalCartItems == 0 ? "Agregar" : ""}
          </button>
        </div>
      )}
    </div>
  );
});

/* ─── Sub-components ─────────────────────────────────────────── */

interface CartActionButtonProps {
  product: Product;
  isInStock?: number;
}

const CartActionButton = React.memo(function CartActionButton({
  product,
  isInStock,
}: CartActionButtonProps) {
  if (!isInStock) {
    return (
      <Button
        size="icon"
        variant="ghost"
        type="button"
        className="size-8 rounded-full"
        disabled
        aria-label="Producto agotado"
      >
        <TbShoppingCartOff className="size-4" />
      </Button>
    );
  }
  return <ButtonOfCart product={product} />;
});

/* ─── Helper ─────────────────────────────────────────────────── */

export function isNewProduct(date?: string): boolean {
  if (!date) return false;
  const createdAt = new Date(date);
  const diffMs = Date.now() - createdAt.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days <= 7;
}
