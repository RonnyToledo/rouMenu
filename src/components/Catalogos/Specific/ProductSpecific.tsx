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
import { Product as ProductInterface } from "@/types/InitialStatus";
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
import {
  groupVariantsByAttribute,
  findVariantByAttributes,
  isAttributeValueAvailable,
  buildCartTitle,
  capitalize,
  getVisibleAttributes,
} from "@/lib/variantUtils";

export default function Product({ id }: { id: string }) {
  const { store, dispatchStore } = useContext(MyContext);
  const router = useRouter();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Solo productos base para navegación swipe/teclado
  const baseProducts = useMemo(
    () =>
      store.products.filter(
        (p) => !p.selected_variant || p.selected_variant.default === true,
      ),
    [store.products],
  );

  const initialProduct = useMemo(
    () => store.products.find((obj) => obj.productId === id),
    [store.products, id],
  );

  useEffect(() => {
    if (!initialProduct) notFound();
  }, [initialProduct]);

  // Variantes visibles del producto
  const visibleVariants = useMemo(() => {
    if (!initialProduct?.variants) return [];
    return initialProduct.variants.filter((v) => v.visible !== false);
  }, [initialProduct]);

  // Hay variantes reales si hay más de una variante visible
  const hasRealVariants = visibleVariants.length > 1;

  // Atributos agrupados: { "color": ["Rojo","Azul"], "talla": ["M","L"] }
  const groupedAttributes = useMemo(
    () => groupVariantsByAttribute(visibleVariants),
    [visibleVariants],
  );

  // Estado de selección por atributo: { "color": "Rojo", "talla": "M" }
  const [attrSelection, setAttrSelection] = useState<
    Record<string, string | number | boolean>
  >(() => {
    const defaultVariant =
      visibleVariants.find((v) => v.default) ?? visibleVariants[0];
    return defaultVariant ? getVisibleAttributes(defaultVariant) : {};
  });

  // Variante activa según la selección de atributos
  const activeVariant = useMemo(
    () =>
      hasRealVariants
        ? findVariantByAttributes(visibleVariants, attrSelection)
        : (visibleVariants.find((v) => v.default) ?? visibleVariants[0]),
    [hasRealVariants, visibleVariants, attrSelection],
  );

  const initialCount = useMemo(() => {
    if (!initialProduct) return 0;
    const totalAgregados =
      initialProduct.agregados?.reduce(
        (sum, agg) => sum + (agg.cant || 0),
        0,
      ) || 0;
    if (totalAgregados > 0) return 0;
    const effectiveStock = activeVariant?.stock ?? initialProduct.stock ?? 0;
    const effectiveCant = initialProduct.Cant || 0;
    return effectiveStock - effectiveCant > 1 ? 1 : 0;
  }, [initialProduct, activeVariant]);

  const [countAddCart, setCountAddCart] = useState<number>(initialCount);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [displayedImage, setDisplayedImage] = useState<string | undefined>(
    initialProduct?.image || logoApp,
  );

  // Derive product from initialProduct and activeVariant
  const product = useMemo(() => {
    if (!initialProduct || !activeVariant) return initialProduct;
    const images = activeVariant.images?.length
      ? activeVariant.images
      : initialProduct.imagesecondary;
    return {
      ...initialProduct,
      price: activeVariant.price ?? initialProduct.price,
      oldPrice: activeVariant.oldPrice ?? initialProduct.oldPrice,
      stock: activeVariant.stock ?? initialProduct.stock,
      image: (displayedImage || activeVariant.image) ?? initialProduct.image,
      imagesecondary: images,
      selected_variant: activeVariant,
    };
  }, [initialProduct, activeVariant, displayedImage]);

  // Reset count when activeVariant changes using key prop or conditional logic
  useEffect(() => {
    setCountAddCart(0);
  }, [activeVariant?.id]);

  const handleAttrChange = useCallback(
    (key: string, value: string | number | boolean) => {
      setAttrSelection((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

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
      const currentIndex = baseProducts.findIndex((p) => p.productId === id);
      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % baseProducts.length
          : (currentIndex - 1 + baseProducts.length) % baseProducts.length;
      const newProductId = baseProducts[newIndex]?.productId;
      if (!newProductId) return;
      const path = `/t/${store.sitioweb || ""}/producto/${newProductId}?direction=${direction}`;
      if (path.includes("undefined")) return;
      router.push(path);
    },
    [id, router, baseProducts, store.sitioweb],
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

  const effectivePrice = activeVariant?.price ?? product.price ?? 0;
  const effectiveOldPrice = activeVariant?.oldPrice ?? product.oldPrice ?? 0;
  const effectiveStock = activeVariant?.stock ?? product.stock ?? 0;
  const availableStock = effectiveStock - (product.Cant || 0);
  const cartTitle = buildCartTitle(product.title || "", activeVariant);

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
              width={800}
              height={800}
              alt={product.title || "Producto"}
              className="w-full h-full object-cover rounded-b-4xl"
              src={product.image || store.urlPoster || logoApp}
              style={{ filter: effectiveStock ? "initial" : "grayscale(1)" }}
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

        {(product.imagesecondary || []).length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 px-3 py-2">
            {(product.imagesecondary || []).map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setDisplayedImage(image);
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
            <div className="flex gap-1">
              <ClipboardProduct
                title={cartTitle}
                descripcion={product.descripcion || ""}
                url={product.image || logoApp}
                price={effectivePrice}
                oldPrice={effectiveOldPrice}
                className="p-0 m-0"
              />
              <ShareButton
                title={cartTitle}
                text={product.descripcion}
                url={`https://roumenu.vercel.app/t/${store.sitioweb}/producto/${id}`}
              />
            </div>
          </div>

          {/* Price & Stock */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-3xl font-bold text-foreground">
                ${effectivePrice}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  {store.moneda.find((m) => m.id === product.default_moneda)
                    ?.nombre || ""}
                </span>
              </p>
              {effectiveOldPrice > effectivePrice && (
                <>
                  <p className="text-base text-muted-foreground line-through">
                    ${effectiveOldPrice}
                  </p>
                  <Badge
                    variant="destructive"
                    className="animate-pulse rounded-full text-xs"
                  >
                    {Math.round(
                      ((effectiveOldPrice - effectivePrice) /
                        effectiveOldPrice) *
                        100,
                    )}
                    % OFF
                  </Badge>
                </>
              )}
            </div>
            {effectiveStock ? (
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

          {/* ── Selector de variantes por grupos de atributos ───────────── */}
          {hasRealVariants && Object.keys(groupedAttributes).length > 0 && (
            <div className="space-y-3 pt-1">
              {Object.entries(groupedAttributes).map(([attrKey, values]) => (
                <div key={attrKey} className="space-y-1.5">
                  {/* Cabecera: "Color · Rojo" */}
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-medium text-foreground">
                      {capitalize(attrKey)}
                    </h3>
                    {attrSelection[attrKey] !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        · {String(attrSelection[attrKey])}
                      </span>
                    )}
                  </div>

                  {/* Pills de valores */}
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => {
                      const isSelected =
                        String(attrSelection[attrKey]) === String(val);
                      const isAvailable = isAttributeValueAvailable(
                        visibleVariants,
                        attrSelection,
                        attrKey,
                        val,
                      );
                      return (
                        <button
                          key={String(val)}
                          onClick={() => handleAttrChange(attrKey, val)}
                          disabled={!isAvailable}
                          className={[
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border bg-secondary text-foreground hover:border-primary/50",
                            !isAvailable
                              ? "opacity-35 cursor-not-allowed line-through"
                              : "",
                          ].join(" ")}
                        >
                          {String(val)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Aviso de precio ajustado */}
              {activeVariant &&
                !activeVariant.default &&
                activeVariant.price != null &&
                activeVariant.price !== initialProduct?.price && (
                  <p className="text-[11px] text-muted-foreground">
                    Precio ajustado según la variante seleccionada
                  </p>
                )}
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
                    <div className="flex items-center gap-2">
                      {extra.cant > 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updatedProduct = {
                                ...product,
                                agregados: product.agregados.map((obj) =>
                                  obj.id === extra.id
                                    ? { ...obj, cant: obj.cant - 1 }
                                    : obj,
                                ),
                              };
                              dispatchStore({
                                type: "Add",
                                payload: {
                                  ...store,
                                  products: store.products.map((prod) =>
                                    prod.productId === product.productId
                                      ? updatedProduct
                                      : prod,
                                  ),
                                },
                              });
                            }}
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
                        onClick={() => {
                          const updatedProduct = {
                            ...product,
                            agregados: product.agregados.map((obj) =>
                              obj.id === extra.id
                                ? { ...obj, cant: obj.cant + 1 }
                                : obj,
                            ),
                          };
                          dispatchStore({
                            type: "Add",
                            payload: {
                              ...store,
                              products: store.products.map((prod) =>
                                prod.productId === product.productId
                                  ? updatedProduct
                                  : prod,
                              ),
                            },
                          });
                        }}
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

          {/* Quantity */}
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
              disabled={store.stocks && countAddCart >= availableStock}
              onClick={() => setCountAddCart(countAddCart + 1)}
              className="h-10 w-10 rounded-full border border-border bg-secondary hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              disabled={availableStock < countAddCart || countAddCart === 0}
              onClick={() => {
                handleToCart({
                  ...product,
                  price: effectivePrice,
                  oldPrice: effectiveOldPrice,
                  stock: effectiveStock,
                  image: activeVariant?.image ?? product.image,
                  selected_variant: activeVariant ?? product.selected_variant,
                  Cant: (product.Cant || 0) + countAddCart,
                });
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
                    (effectivePrice + (product.embalaje || 0)) * countAddCart +
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
