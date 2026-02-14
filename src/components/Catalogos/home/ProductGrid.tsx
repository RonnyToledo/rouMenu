"use client";
import React, { useContext, useMemo, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

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
    [product.Cant, product.agregados],
  );

  const currentCurrency = useMemo(
    () =>
      store.moneda.find((m) => m.id === product.default_moneda)?.nombre || "",
    [store.moneda, product.default_moneda],
  );

  // Extraer fuera del useMemo
  const edit = store?.edit;
  const horizontal = edit?.horizontal;
  const grid = edit?.grid;
  const square = edit?.square;
  const span = product?.span;

  const gridClasses = useMemo(
    () =>
      cn(
        "grid rounded-md overflow-hidden shadow-md",
        horizontal ? "grid-cols-2" : span && grid ? "col-span-2" : "col-span-1",
      ),
    // las dependencias son exactamente las variables usadas arriba
    [horizontal, grid, span],
  );

  const imageClasses = useMemo(
    () => cn("object-cover w-full", square ? "aspect-square" : "w-full h-48"),
    [square],
  );

  const titleClasses = useMemo(
    () =>
      cn(
        "font-cinzel text-[var(--text-gold)] text-sm flex items-center w-full line-clamp-2 font-semibold",
      ),
    [],
  );

  const descriptionClasses = useMemo(
    () =>
      cn(
        "text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2 whitespace-pre-line",
        product.span ? "h-4" : "h-8",
      ),
    [product.span],
  );

  const handleNavigateToProduct = useCallback(() => {
    router.push(`/t/${store.sitioweb}/producto/${product.productId}`);
  }, [router, store.sitioweb, product.productId]);

  const sitioweb = store?.sitioweb ?? "";

  const productUrl = useMemo(
    () => `/t/${sitioweb}/producto/${product.productId}`,
    [sitioweb, product.productId],
  );

  const showAddToCartButton = useMemo(
    () => !product.venta || product.agregados.length > 0,
    [product.venta, product.agregados.length],
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
        productId={product.productId}
        productUrl={productUrl}
        image={product.image || banner}
        title={product.title}
        index={i}
        span={product.span || false}
        isInStock={product.stock}
        imageClasses={imageClasses}
        promedioStar={product.coment.promedio || 0}
      />

      <div className="p-1 flex flex-col justify-between ">
        <h4 className={cn(titleClasses)}>{product.title}</h4>

        {!store?.edit?.minimalista && (
          <p className={descriptionClasses}>{product.descripcion || "..."}</p>
        )}
        <div className="flex gap-0.5">
          {isNew && (
            <Badge className="bg-red-700/80 text-[0.5rem] px-1.5">Nuevo</Badge>
          )}
          {product.favorito && (
            <Badge className="bg-yellow-500/80 text-[0.5rem] px-1.5">
              Popular
            </Badge>
          )}
          {!product.stock && (
            <Badge className="bg-violet-700/50 text-[0.5rem] px-1.5">
              Agotado
            </Badge>
          )}
          {product.oldPrice > product.price && (
            <Badge className="bg-cyan-700/50 text-[0.5rem] px-1.5">
              -
              {Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) * 100,
              )}
              % Off
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-start gap-1">
            {product.venta ? (
              <ProductPrice
                price={product.price || 0}
                currency={currentCurrency}
                oldPrice={
                  product.oldPrice > product.price ? product.oldPrice : 0
                }
              />
            ) : (
              <div />
            )}
          </div>

          <div className="relative h-9 w-fit flex justify-end items-center">
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
  productId: string;
  productUrl: string;
  image: string;
  title?: string;
  index: number;
  promedioStar: number;
  isInStock?: number;
  span: boolean;
  imageClasses: string;
}

const ProductImage = React.memo(function ProductImage({
  productId,
  productUrl,
  image,
  title,
  index,
  isInStock,
  imageClasses,
  span,
  promedioStar,
}: ProductImageProps) {
  const { store, dispatchStore } = useContext(MyContext);

  const imageStyle = useMemo(
    () => ({ filter: isInStock ? "initial" : "grayscale(1)" }),
    [isInStock],
  );

  return (
    <Link href={productUrl} className="relative size-fit w-full">
      <Image
        width={250}
        height={250}
        placeholder="blur"
        blurDataURL={image}
        alt={title || `Producto ${index}`}
        className={cn(imageClasses, span ? "aspect-video" : "aspect-auto")}
        src={image}
        style={imageStyle}
        onError={() => {
          dispatchStore({
            type: "Add",
            payload: {
              ...store,
              products: store.products.map((prod) =>
                productId == prod.productId ? { ...prod, image: "" } : prod,
              ),
            },
          });
        }}
      />
      {promedioStar ? (
        <Badge className="absolute top-2 left-2 flex items-center text-xs bg-primary/50">
          {promedioStar}
          <Star className="fill-slate-50" />
        </Badge>
      ) : null}
    </Link>
  );
});

interface ProductPriceProps {
  price: number;
  oldPrice: number;
  currency: string;
}

const ProductPrice = React.memo(function ProductPrice({
  price,
  currency,
  oldPrice,
}: ProductPriceProps) {
  return (
    <>
      <p className={`font-semibold  text-[8px] text-slate-800 `}>
        ${smartRound(price)} {currency}
      </p>
      {oldPrice ? (
        <p className="font-semibold  text-[8px]  text-red-800 line-through">
          ${smartRound(oldPrice)} {currency}
        </p>
      ) : null}
    </>
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
export function isNewProduct(date?: string): boolean {
  if (!date) return false;
  const createdAt = new Date(date);
  const diffMs = Date.now() - createdAt.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days <= 7;
}
