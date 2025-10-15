"use client";
import React, { useContext, useMemo, useCallback } from "react";
import { MdNewReleases } from "react-icons/md";
import { TbShoppingCartOff, TbShoppingCartPlus } from "react-icons/tb";
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

interface ProductGridInterface {
  product: Product;
  banner: string;
  i: number;
}

export default React.memo(function ProductGrid({
  product,
  banner,
  i,
}: ProductGridInterface) {
  const { store } = useContext(MyContext);
  const router = useRouter();

  // Memoizar valores calculados
  const isNew = useMemo(() => isNewProduct(product.creado), [product.creado]);

  const totalCartItems = useMemo(
    () =>
      product.Cant + product.agregados.reduce((sum, obj) => sum + obj.cant, 0),
    [product.Cant, product.agregados]
  );

  const currentCurrency = useMemo(
    () =>
      store.moneda.find((m) => m.id === product.default_moneda)?.nombre || "",
    [store.moneda, product.default_moneda]
  );

  const gridClasses = useMemo(
    () =>
      cn(
        "grid rounded-lg overflow-hidden shadow-md",
        store?.edit?.horizontal
          ? "grid-cols-2"
          : product?.span && store?.edit?.grid
            ? "col-span-2"
            : "col-span-1"
      ),
    [store?.edit?.horizontal, store?.edit?.grid, product?.span]
  );

  const imageClasses = useMemo(
    () =>
      cn("object-cover", store?.edit?.square ? "aspect-square" : "w-full h-48"),
    [store?.edit?.square]
  );

  const titleClasses = useMemo(
    () =>
      cn(
        "font-cinzel font-bold text-[var(--text-gold)] text-base flex items-center w-full",
        store?.edit?.minimalista
          ? "line-clamp-1 h-6"
          : `line-clamp-2 ${product?.span && store?.edit?.grid ? "h-6" : "h-12"}`
      ),
    [store?.edit?.minimalista, store?.edit?.grid, product?.span]
  );

  const descriptionClasses = useMemo(
    () =>
      cn(
        "text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2 whitespace-pre-line",
        product.span ? "h-4" : "h-8"
      ),
    [product.span]
  );

  const handleNavigateToProduct = useCallback(() => {
    router.push(`/t/${store.sitioweb}/producto/${product.productId}`);
  }, [router, store.sitioweb, product.productId]);

  const productUrl = useMemo(
    () => `/t/${store?.sitioweb}/producto/${product.productId}`,
    [store?.sitioweb, product.productId]
  );

  const showAddToCartButton = useMemo(
    () => !product.venta || product.agregados.length > 0,
    [product.venta, product.agregados.length]
  );

  return (
    <motion.div
      id={product.productId}
      className={gridClasses}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
    >
      <ProductImage
        productUrl={productUrl}
        image={product.image || banner}
        title={product.title}
        index={i}
        isInStock={product.stock}
        isNew={isNew}
        imageClasses={imageClasses}
      />

      <div className="p-2 flex flex-col justify-evenly">
        <h4 className={titleClasses}>{product.title}</h4>

        {!store?.edit?.minimalista && (
          <p className={descriptionClasses}>{product.descripcion || "..."}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          {product.venta ? (
            <ProductPrice
              price={product.price || 0}
              currency={currentCurrency}
            />
          ) : (
            <div />
          )}

          <div className="relative h-9 w-full flex justify-end items-center">
            {showAddToCartButton ? (
              <AddToCartButton
                totalItems={totalCartItems}
                onNavigate={handleNavigateToProduct}
              />
            ) : (
              store?.carrito && (
                <CartActionButton product={product} isInStock={product.stock} />
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Subcomponentes optimizados

interface ProductImageProps {
  productUrl: string;
  image: string;
  title?: string;
  index: number;
  isInStock?: number;
  isNew: boolean;
  imageClasses: string;
}

const ProductImage = React.memo(function ProductImage({
  productUrl,
  image,
  title,
  index,
  isInStock,
  isNew,
  imageClasses,
}: ProductImageProps) {
  const imageStyle = useMemo(
    () => ({ filter: isInStock ? "initial" : "grayscale(1)" }),
    [isInStock]
  );

  return (
    <Link href={productUrl} className="relative">
      <Image
        width={250}
        height={250}
        placeholder="blur"
        blurDataURL={image}
        alt={title || `Producto ${index}`}
        className={imageClasses}
        src={image}
        style={imageStyle}
      />

      {isNew && (
        <div className="absolute top-2 left-2 backdrop-blur-3xl rounded-full">
          <MdNewReleases className="fill-red-600 shadow-md h-4 w-4" />
        </div>
      )}
    </Link>
  );
});

interface ProductPriceProps {
  price: number;
  currency: string;
}

const ProductPrice = React.memo(function ProductPrice({
  price,
  currency,
}: ProductPriceProps) {
  return (
    <p className="font-bold w-full text-[10px] text-[var(--text-light)]">
      ${smartRound(price)} {currency}
    </p>
  );
});

interface AddToCartButtonProps {
  totalItems: number;
  onNavigate: () => void;
}

const AddToCartButton = React.memo(function AddToCartButton({
  totalItems,
  onNavigate,
}: AddToCartButtonProps) {
  return (
    <Button
      size="icon"
      type="button"
      className="size-8 flex justify-center items-center rounded-full"
      onClick={onNavigate}
      aria-label="Agregar al carrito"
    >
      {totalItems > 0 ? totalItems : <TbShoppingCartPlus className="size-5" />}
    </Button>
  );
});

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
        className="size-8 flex justify-center items-center rounded-full"
        disabled
        aria-label="Producto agotado"
      >
        <TbShoppingCartOff className="size-4" />
      </Button>
    );
  }

  return <ButtonOfCart product={product} />;
});

// Función auxiliar
function isNewProduct(date?: string): boolean {
  if (!date) return false;
  const createdAt = new Date(date);
  const diffMs = Date.now() - createdAt.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days <= 7;
}
