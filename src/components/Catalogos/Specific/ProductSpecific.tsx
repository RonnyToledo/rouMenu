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

  // Memoizar el producto inicial para evitar recalcular en cada render
  const initialProduct = useMemo(() => {
    return store.products.find((obj) => obj.productId === id);
  }, [store.products, id]);

  // Verificar si el producto existe
  useEffect(() => {
    if (!initialProduct) {
      notFound();
    }
  }, [initialProduct]);

  // Calcular el conteo inicial basado en el producto
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

  // Inicializar estados con valores calculados
  const [product, setProduct] = useState<ProductInterface | undefined>(
    initialProduct,
  );
  const [countAddCart, setCountAddCart] = useState<number>(initialCount);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleToCart = (productToCart: ProductInterface) => {
    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 800);
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify(productToCart),
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    router.push(`/t/${store.sitioweb}`);
  };

  // Si recibimos la pagina fuera de la posicion de inicio ponerla en top 0
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

    // Solo swipes horizontales significativos
    if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        navigateToProduct("previous");
      } else {
        navigateToProduct("next");
      }
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

      const path = `/t/${store.sitioweb || ""}/producto/${
        newProductId || ""
      }?direction=${direction}`;

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
      if (event.key === "ArrowLeft") {
        navigateToProduct("previous");
      } else if (event.key === "ArrowRight") {
        navigateToProduct("next");
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [navigateToProduct]);

  // Copiar informacion para repostear
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

  // Si no hay producto, no renderizar nada (notFound se encargará)
  if (!product) {
    return null;
  }

  return (
    <main className="flex flex-col items-start min-h-dvh">
      {/* Left Column - Images */}

      <div className="flex flex-col gap-1 w-full">
        {/* Main Image */}
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

        {/* Thumbnails */}
        {(product.imagesecondary || []).length > 0 && (
          <div className="grid grid-cols-3 gap-1 p-2">
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
                className="aspect-square rounded-lg overflow-hidden bg-slate-200/50 hover:bg-slate-300/50 border-2 border-slate-300 hover:border-slate-400 transition-all"
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-1 px-4 py-1">
        {/* Breadcrumb */}
        <BreadCrumpParent list={links} />
        {/* Right Column - Product Info */}
        <div className="space-y-2">
          {/* Title and Actions */}
          <div className="sapce-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Link
                  href={`/t/${store.sitioweb}/producto/${product.productId}/coment`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.coment.promedio || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-700">
                    {product.coment.promedio} ({product.coment.total} reseñas)
                  </span>
                </Link>

                <div className="flex gap-2">
                  <ClipboardProduct
                    title={`${product.title || ""}`}
                    descripcion={product.descripcion || ""}
                    url={product.image}
                    price={product.price || 0 || 0}
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
            </div>

            {/* Price and Stock */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-slate-800">
                  ${product.price || 0}{" "}
                  {store.moneda.find((m) => m.id === product.default_moneda)
                    ?.nombre || ""}
                </p>
                {(product.oldPrice || 0) > (product.price || 0) && (
                  <>
                    <p className="text-lg text-slate-600 line-through">
                      ${product.oldPrice || 0}
                    </p>
                    <Badge variant="destructive" className="animate-pulse">
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

              {product.stock ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">En stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Off Stock</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {(tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(tags || []).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-slate-300 text-slate-800 border-slate-400 hover:bg-slate-400"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Packaging */}
          {(product.embalaje || 0) > 0 && (
            <Card className="p-4 bg-slate-200/50 border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-800 mb-1">Embalaje</h3>
                  <p className="text-sm text-slate-700">
                    ${product.embalaje.toFixed(2)}{" "}
                    {store.moneda.find((m) => m.id === product.default_moneda)
                      ?.nombre || ""}
                  </p>
                </div>
                <div className="bg-emerald-500 rounded-full p-2">
                  <Check className="w-4 h-4 text-slate-800" />
                </div>
              </div>
            </Card>
          )}

          {/* Extras */}
          {(product.agregados || []).length > 0 && (
            <div className="space-y-1">
              <div>
                <h3 className="font-medium text-slate-800">Extras</h3>
                <p className="text-sm text-slate-600">
                  Agregados para su encargo
                </p>
              </div>

              {product.agregados.map((extra) => (
                <Card
                  key={extra.id}
                  className="p-4 bg-slate-200/50 border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-800">
                        {extra.name}
                      </div>
                      <div className="text-sm text-slate-700">
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
                            variant="outline"
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
                            className="h-8 w-8 bg-slate-300 hover:bg-slate-400 border-slate-400 rounded-full"
                          >
                            <Minus className="h-4 w-4 text-slate-800" />
                          </Button>
                          <Badge
                            variant="outline"
                            className="bg-slate-300 text-slate-800 border-slate-400 px-3"
                          >
                            {extra.cant}
                          </Badge>
                        </>
                      )}
                      <Button
                        variant="outline"
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
                        className="h-8 w-8 bg-slate-300 hover:bg-slate-400 border-slate-400 rounded-full"
                      >
                        <Plus className="h-4 w-4 text-slate-800" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <p className="text-xs text-slate-600 text-center">
                *El extra es el producto con el agregado incluido
              </p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-center gap-6 py-2">
            <Button
              variant="outline"
              size="icon"
              disabled={countAddCart === 0}
              onClick={() => setCountAddCart(countAddCart - 1)}
              className="h-10 w-10 bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800 rounded-full"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-2xl font-semibold text-slate-800 w-16 text-center">
              {countAddCart}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setCountAddCart(countAddCart + 1);
              }}
              className="h-10 w-10 bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
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
              className={`w-full h-12 text-base font-medium rounded-3xl transition-all duration-300 ${
                showSuccess
                  ? "bg-green-600 hover:bg-green-700"
                  : "hover:scale-105"
              } ${isAddingToCart ? "scale-95" : ""}`}
            >
              {isAddingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Agregando...
                </div>
              ) : showSuccess ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  ¡Agregado al carrito!
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Agregar al carrito - $
                  {(
                    ((product.price || 0 || 0) + (product.embalaje || 0)) *
                      countAddCart +
                    (product.agregados.reduce(
                      (sum, agg) =>
                        (sum =
                          sum +
                          (agg.price + (product.embalaje || 0)) * agg.cant),
                      0,
                    ) || 0)
                  ).toFixed(2)}
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 rounded-3xl hover:scale-105 transition-transform duration-200 bg-transparent"
              onClick={() => router.push(`/t/${store.sitioweb}/carrito`)}
            >
              Comprar ahora
            </Button>
          </div>

          {/* Description */}
          {product.descripcion ? (
            <div className="pt-1 border-t border-slate-300">
              <h3 className="font-semibold text-slate-800 mb-2">Descripción</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {product.descripcion}
              </p>
            </div>
          ) : null}

          {/* Ratings Summary */}
          <div className="pt-6 border-t border-slate-300">
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
                <Link href={item.link} className="max-w-28 line-clamp-1">
                  {item.name === "Inicio" ? (
                    <HomeIcon className="size-4" />
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
