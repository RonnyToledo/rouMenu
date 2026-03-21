"use client";
import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import { MyContext } from "@/context/MyContext";
import { Product as ProductInterface } from "@/context/InitialStatus";
import { logoApp } from "@/lib/image";
import { Button } from "@/components/ui/button";
import RatingSection from "./RatingSection";
import { notFound, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Star, Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ShareButton from "@/components/myUI/buttonShare";
import ClipboardProduct from "@/components/myUI/clipboardProduct";
import { Card } from "@/components/ui/card";
import { isNewProduct } from "../home/ProductGrid";
import { HomeIcon } from "lucide-react";

export default function Product({ id }: { id: string }) {
  const { store, dispatchStore } = useContext(MyContext);
  const router = useRouter();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const initialProduct = useMemo(() => {
    return store.products.find((obj) => obj.productId === id);
  }, [store.products, id]);

  useEffect(() => {
    if (!initialProduct) {
      notFound();
    }
  }, [initialProduct]);

  const initialCount = useMemo(() => {
    if (!initialProduct) return 0;
    const totalAgregados =
      initialProduct.agregados?.reduce(
        (sum, agg) => sum + (agg.cant || 0),
        0,
      ) || 0;
    return totalAgregados > 0
      ? 0
      : (initialProduct.stock || 0) -
            (initialProduct.Cant || 0) -
            (initialProduct.agregados?.reduce(
              (sum, agg) => sum + agg.cant,
              0,
            ) || 0) >
          1
        ? 1
        : 0;
  }, [initialProduct]);

  const [product, setProduct] = useState<ProductInterface | undefined>(
    initialProduct,
  );
  const [countAddCart, setCountAddCart] = useState<number>(initialCount);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleToCart = (productToCart: ProductInterface) => {
    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 800);
    dispatchStore({ type: "AddCart", payload: JSON.stringify(productToCart) });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    router.push(`/t/${store.sitioweb}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSwipeStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleSwipeEnd = (e: React.TouchEvent<HTMLDivElement>): void => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY)) {
      navigateToProduct(deltaX > 0 ? "previous" : "next");
    }
  };

  const navigateToProduct = useCallback(
    (direction: string) => {
      const currentIndex = store.products.findIndex((p) => p.productId === id);
      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % store.products.length
          : (currentIndex - 1 + store.products.length) % store.products.length;
      const newProductId = store.products[newIndex].productId;
      const path = `/t/${store.sitioweb || ""}/producto/${newProductId || ""}?direction=${direction}`;
      if (path.includes("undefined")) {
        console.error("Path generado contiene valores no válidos:", path);
        return;
      }
      router.push(path);
    },
    [id, router, store.products, store.sitioweb],
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (event.key === "ArrowLeft") navigateToProduct("previous");
      else if (event.key === "ArrowRight") navigateToProduct("next");
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigateToProduct]);

  const links = useMemo(
    () => [
      { name: "Inicio", link: `/t/${store.sitioweb}` },
      {
        name:
          store?.categorias.find((obj) => obj.id == product?.caja)?.name || "",
        link: `/t/${store.sitioweb}/category/${product?.caja}`,
      },
      {
        name: product?.title || "",
        link: `/t/${store.sitioweb}/producto/${product?.productId}`,
      },
    ],
    [
      store.sitioweb,
      store.categorias,
      product?.caja,
      product?.title,
      product?.productId,
    ],
  );

  const tags = useMemo(
    () =>
      [
        !product?.stock && "Agotado",
        product?.favorito && "Top",
        isNewProduct(product?.creado) && "Nuevo",
        ...(product?.caracteristicas || []),
      ]
        .flat()
        .filter(Boolean),
    [
      product?.stock,
      product?.favorito,
      product?.creado,
      product?.caracteristicas,
    ],
  );

  if (!product) return null;

  return (
    <main className="flex flex-col items-start min-h-dvh">
      {/* Image section */}
      <div className="flex flex-col gap-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={product.image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-b-2xl overflow-hidden aspect-square"
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}
          >
            <Image
              width={600}
              height={600}
              alt={product.title || "Producto"}
              className="w-full h-full object-cover rounded-b-4xl"
              src={product.image || store.urlPoster || logoApp}
              style={{ filter: product.stock ? "initial" : "grayscale(1)" }}
              onError={() => {
                dispatchStore({
                  type: "Add",
                  payload: {
                    ...store,
                    products: store.products.map((prod) =>
                      product.productId == prod.productId
                        ? { ...prod, image: "" }
                        : prod,
                    ),
                  },
                });
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Thumbnails — border-border en vez de hardcoded slate */}
        {(product.imagesecondary || []).length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 px-3 py-2">
            {(product.imagesecondary || []).map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setProduct({
                    ...product,
                    image,
                    imagesecondary: product.imagesecondary.map((obj) =>
                      obj === image ? product.image : obj,
                    ) as string[],
                  });
                }}
                className="aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary/50 opacity-75 hover:opacity-100 transition-all duration-200"
              >
                <Image
                  width={150}
                  height={150}
                  src={image || logoApp}
                  alt={`${product.title} vista ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-1 px-4 py-2">
        <BreadCrumpParent list={links} />

        <div className="space-y-3">
          {/* Rating & Actions */}
          <div className="flex items-center justify-between">
            <Link
              href={`/t/${store.sitioweb}/producto/${product.productId}/coment`}
              className="flex items-center gap-1.5 hover:opacity-75 transition-opacity"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.coment.promedio || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {product.coment.promedio} ({product.coment.total} reseñas)
              </span>
            </Link>

            {/* Share actions — mismo patrón Button ghost rounded-full del header */}
            <div className="flex gap-1">
              <ClipboardProduct
                title={`${product.title || ""}`}
                descripcion={product.descripcion || ""}
                url={product.image}
                price={product.price || 0}
                oldPrice={product.oldPrice || 0}
                className="p-0 m-0"
              />
              <ShareButton
                title={`${product.title || ""}`}
                text={product.descripcion}
                url={`https://roumenu.vercel.app/t/${store.sitioweb}/producto/${id}`}
              />
            </div>
          </div>

          {/* Price & Stock */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-3xl font-bold text-foreground">
                ${product.price || 0}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  {store.moneda.find((m) => m.id === product.default_moneda)
                    ?.nombre || ""}
                </span>
              </p>
              {(product.oldPrice || 0) > (product.price || 0) && (
                <>
                  <p className="text-base text-muted-foreground line-through">
                    ${product.oldPrice || 0}
                  </p>
                  <Badge
                    variant="destructive"
                    className="animate-pulse rounded-full text-xs"
                  >
                    {Math.round(
                      (((product.oldPrice || 0) - (product.price || 0)) /
                        (product.oldPrice || 0)) *
                        100,
                    )}
                    % OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Stock pill — coherente con ProductSpecific mock */}
            {product.stock ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  En stock
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  Off Stock
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {(tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(tags || []).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="rounded-full text-xs px-2.5 border border-border"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Packaging */}
          {(product.embalaje || 0) > 0 && (
            <Card className="px-4 py-3 border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-0.5">
                    Embalaje
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    ${product.embalaje.toFixed(2)}{" "}
                    {store.moneda.find((m) => m.id === product.default_moneda)
                      ?.nombre || ""}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </Card>
          )}

          {/* Extras */}
          {(product.agregados || []).length > 0 && (
            <div className="space-y-1.5">
              <div>
                <h3 className="text-sm font-medium text-foreground">Extras</h3>
                <p className="text-xs text-muted-foreground">
                  Agregados para su encargo
                </p>
              </div>

              {product.agregados.map((extra) => (
                <Card
                  key={extra.id}
                  className="px-4 py-3 border-border shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {extra.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${extra.price.toFixed(2)}{" "}
                        {store.moneda.find(
                          (m) => m.id === product.default_moneda,
                        )?.nombre || ""}
                      </div>
                    </div>
                    {/* Controles — rounded-full, ghost, border-border */}
                    <div className="flex items-center gap-2">
                      {extra.cant > 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setProduct({
                                ...product,
                                agregados: product.agregados.map((obj) =>
                                  obj.id === extra.id
                                    ? { ...obj, cant: obj.cant - 1 }
                                    : obj,
                                ),
                              })
                            }
                            className="h-8 w-8 rounded-full border border-border"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Badge
                            variant="outline"
                            className="rounded-full px-2.5 text-xs border-border min-w-7 text-center"
                          >
                            {extra.cant}
                          </Badge>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setProduct({
                            ...product,
                            agregados: product.agregados.map((obj) =>
                              obj.id === extra.id
                                ? { ...obj, cant: obj.cant + 1 }
                                : obj,
                            ),
                          })
                        }
                        className="h-8 w-8 rounded-full border border-border"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              <p className="text-xs text-muted-foreground/70 text-center">
                *El extra es el producto con el agregado incluido
              </p>
            </div>
          )}

          {/* Quantity — misma estética bg-secondary rounded-full */}
          <div className="flex items-center justify-center gap-4 py-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={countAddCart === 0}
              onClick={() => setCountAddCart(countAddCart - 1)}
              className="h-10 w-10 rounded-full border border-border bg-secondary hover:bg-muted transition-colors"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-2xl font-semibold text-foreground w-12 text-center">
              {countAddCart}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCountAddCart(countAddCart + 1)}
              className="h-10 w-10 rounded-full border border-border bg-secondary hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons — rounded-full h-12, active:scale */}
          <div className="space-y-2">
            <Button
              disabled={
                (product.stock || 0) - (product.Cant || 0) < countAddCart
              }
              onClick={() => {
                handleToCart({
                  ...product,
                  Cant: (product.Cant || 0) + countAddCart || 0,
                } as ProductInterface);
              }}
              className={`w-full h-12 text-base font-semibold rounded-full transition-all duration-300 gap-2 active:scale-[0.98] ${
                showSuccess
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "hover:opacity-90"
              } ${isAddingToCart ? "scale-95" : ""}`}
            >
              {isAddingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Agregando...
                </>
              ) : showSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  ¡Agregado al carrito!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Agregar al carrito · $
                  {(
                    ((product.price || 0) + (product.embalaje || 0)) *
                      countAddCart +
                    (product.agregados.reduce(
                      (sum, agg) =>
                        (sum =
                          sum +
                          (agg.price + (product.embalaje || 0)) * agg.cant),
                      0,
                    ) || 0)
                  ).toFixed(2)}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 rounded-full font-semibold transition-all duration-200 active:scale-[0.98]"
              onClick={() => router.push(`/t/${store.sitioweb}/carrito`)}
            >
              Comprar ahora
            </Button>
          </div>

          {/* Description */}
          {product.descripcion ? (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-1.5">
                Descripción
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.descripcion}
              </p>
            </div>
          ) : null}

          {/* Ratings */}
          <div className="pt-4 border-t border-border">
            <RatingSection
              specific={product.productId || id}
              sitioweb={store.sitioweb || ""}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

interface BreadcrumbInterface {
  name: string;
  link: string;
}

function BreadCrumpParent({ list }: { list: BreadcrumbInterface[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {list.map((item, index) => (
          <div key={`Bread-${index}`} className="flex items-center">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={item.link}
                  className="max-w-28 line-clamp-1 text-xs"
                >
                  {item.name === "Inicio" ? (
                    <HomeIcon className="w-3.5 h-3.5" />
                  ) : (
                    item.name
                  )}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
