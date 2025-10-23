"use client";
import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import { MyContext } from "@/context/MyContext";
import { Product as ProductInterface } from "@/context/InitialStatus";
import { logoApp } from "@/lib/image";
import { Button } from "@/components/ui/button";
import RatingSection from "./RatingSection";
import { smartRound } from "@/functions/precios";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Star, Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExpandableText from "./truncateText";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ShareButton from "@/components/myUI/buttonShare";
import ClipboardProduct from "@/components/myUI/clipboardProduct";
import RelativeTime from "@/components/GeneralComponents/DateTime";
import { Card } from "@/components/ui/card";
export default function Product({ id }: { id: string }) {
  const { store, dispatchStore } = useContext(MyContext);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductInterface>();
  const [countAddCart, setCountAddCart] = useState<number>(1);
  const [buttonClick, setButtonClick] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const swipeDirection = searchParams.get("direction") || "next";
  const swipeComponents =
    swipeDirection === "next"
      ? { amplio: "slide-in-from-right-4", corto: "slide-in-from-right-2" }
      : { amplio: "slide-in-from-left-4", corto: "slide-in-from-left-2" };

  useEffect(() => {
    const value = store.products.find((obj) => obj.productId == id);
    setProduct(value);
    const initialCount =
      (value?.stock || 0) -
        (value?.Cant || 0) -
        (value?.agregados?.reduce((sum, agg) => sum + agg.cant, 0) || 0) >
      1
        ? 1
        : 0;
    setCountAddCart(initialCount);
  }, [store.products, id]);
  useEffect(() => {
    const totalAgregados =
      product?.agregados?.reduce((sum, agg) => sum + (agg.cant || 0), 0) || 0;

    if (totalAgregados > 0 && !buttonClick) {
      setCountAddCart(0);
    }
  }, [product?.agregados, buttonClick]);

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
  //Si recibimos la pagina fuera de la posicion de inicio ponerla en top 0
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

      // Pasar la dirección como estado al router
      const path = `/t/${store.sitioweb || ""}/producto/${
        newProductId || ""
      }?direction=${direction}`;

      if (path.includes("undefined")) {
        console.error("Path generado contiene valores no válidos:", path);
        return; // Detén la ejecución si hay valores inválidos
      }
      router.push(path);
    },
    [id, router, store.products, store.sitioweb]
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

  //Copiar informacion para repostear
  const links = [
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
  ];
  return (
    <main className="flex items-start min-h-[100svh]">
      <div className="grid grid-cols-1  gap-2 items-start p-4">
        <BreadCrumpParent list={links} />
        <AnimatePresence>
          <motion.div
            key={`Product-motion-${product?.productId}`} // Necesario para que Framer Motion detecte cambios
            initial={{
              opacity: 0,
            }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative rounded-b-2xl overflow-hidden"
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}
          >
            <Image
              width={500}
              height={500}
              alt={product?.title || "Product"}
              className={`w-full rounded-lg shadow-lg object-cover object-center aspect-square`}
              src={product?.image || store.urlPoster || logoApp}
            />
          </motion.div>

          {/* Miniaturas */}
          <div className="grid grid-cols-3 gap-2">
            {product?.imagesecondary.map((image, index) => (
              <Button
                key={index}
                className="p-0 m-0 aspect-square h-auto"
                variant={"ghost"}
                onClick={() =>
                  setProduct({
                    ...product,
                    image,
                    imagesecondary: product.imagesecondary.map((obj) =>
                      obj == image ? product.image || store.urlPoster : obj
                    ),
                  })
                }
              >
                <Image
                  width={100}
                  height={100}
                  src={image || store.urlPoster || logoApp}
                  alt={`${product?.title} vista ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </Button>
            ))}
          </div>
        </AnimatePresence>
        <div
          className={`space-y-4 animate-in ${swipeComponents.corto} duration-700`}
        >
          {/* Título y precio */}
          <div className="flex flex-col items-start justify-between space-y-1">
            <h1
              className={`line-clamp-1 text-3xl font-bold text-gray-900 animate-in ${swipeComponents.corto} duration-500 delay-200`}
            >
              {product?.title}
            </h1>
            {product?.venta && (
              <div
                className={`flex justify-between items-center w-full gap-2 animate-in ${swipeComponents.corto} duration-500 delay-300`}
              >
                <Link
                  href={`/t/${store.sitioweb}/producto/${product.productId}/coment`}
                  className="flex gap-2"
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product?.coment?.promedio || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product?.coment?.promedio || 0} ({product?.coment.total}{" "}
                    reseñas)
                  </span>
                </Link>

                <div className="flex ">
                  <ClipboardProduct
                    title={`${product?.title || ""}`}
                    descripcion={product?.descripcion || ""}
                    url={product?.image}
                    price={product?.price || 0}
                    oldPrice={product?.oldPrice || 0}
                    className="p-0 m-0"
                  />
                  <ShareButton
                    title={`${product?.title || ""}`}
                    text={product?.descripcion}
                    url={`https://roumenu.vercel.app/t/${store.sitioweb}/producto/${id}`}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Precio */}
          {product?.venta && (
            <>
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-3 animate-in ${swipeComponents.corto} duration-500 delay-400 leading-relaxed text-gray-900`}
                >
                  <p className="leading-relaxed text-gray-900">
                    ${smartRound(product?.price || 0)}{" "}
                    {store.moneda.find((m) => m.id == product.default_moneda)
                      ?.nombre || ""}
                  </p>
                  {(product?.oldPrice || 0) > (product?.price || 0) && (
                    <p className=" text-gray-500 line-through">
                      ${product?.oldPrice}
                    </p>
                  )}
                  {(product?.oldPrice || 0) > (product?.price || 0) && (
                    <Badge variant="destructive" className="animate-pulse">
                      {Math.round(
                        (((product?.oldPrice || 0) - (product?.price || 0)) /
                          (product?.oldPrice || 0)) *
                          100
                      )}
                      % OFF
                    </Badge>
                  )}
                </div>

                <div className="flex gap-1">
                  <div
                    className={`animate-in ${swipeComponents.corto} duration-500 delay-1100`}
                  >
                    {product?.stock ? (
                      store.stocks && product?.stock <= 10 ? (
                        <>
                          <div className="flex items-center gap-2 text-green-600">
                            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">
                              {product.stock} u.
                            </span>
                          </div>
                          {product.Cant +
                            product.agregados.reduce(
                              (sum, agg) => sum + agg.cant,
                              0
                            ) >
                            0 && (
                            <div className="flex items-center gap-2 text-green-600">
                              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                              <span className="text-xs font-medium text-green-700">
                                Pedidas{" "}
                                {product.Cant +
                                  product.agregados.reduce(
                                    (sum, agg) => sum + agg.cant,
                                    0
                                  )}{" "}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                          <span className="text-sm font-medium">En stock</span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                        <span className="text-sm font-medium">Agotado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Tags */}
              {product.caracteristicas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.caracteristicas.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
          {/* Packaging */}
          {(product?.embalaje || 0) > 0 && (
            <div className="mb-4 space-y-1">
              <h3 className="font-medium">Embalaje</h3>
              <Card className="p-3 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium">Costo</div>
                      <div className="text-sm text-gray-800">
                        {smartRound(product?.embalaje || 0).toFixed(2)}{" "}
                        {store.moneda.find(
                          (m) => m.id == product?.default_moneda
                        )?.nombre || ""}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-500 rounded-full ">
                    <Check className="m-2 text-white fill-white size-3.5" />
                  </div>
                </div>
              </Card>
            </div>
          )}
          {/* Extras */}
          {(product?.agregados?.length || 0 > 0) && product?.stock && (
            <div className="mb-4  space-y-1">
              <h3 className="font-medium">Extras</h3>
              <p className="text-sm text-gray-500 ">
                Agregados para su encargo
              </p>

              {product?.agregados.map((extra) => (
                <Card key={extra.id} className="p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{extra.name}</div>
                      <div className="text-sm text-gray-500">
                        {smartRound(extra?.price || 0).toFixed(2)}{" "}
                        {store.moneda.find(
                          (m) => m.id == product.default_moneda
                        )?.nombre || ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {extra.cant > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setProduct({
                                ...product,
                                agregados: product.agregados.map((obj) =>
                                  obj.id === extra.id
                                    ? { ...obj, cant: obj.cant - 1 }
                                    : obj
                                ),
                              })
                            }
                            className={"bg-blue-50 rounded-full p-1 m-1"}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Badge variant={"outline"}>{extra.cant}</Badge>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          (product.stock || 0) - product.Cant - countAddCart <=
                          extra.cant
                        }
                        onClick={() =>
                          setProduct({
                            ...product,
                            agregados: product.agregados.map((obj) =>
                              obj.id === extra.id
                                ? { ...obj, cant: obj.cant + 1 }
                                : obj
                            ),
                          })
                        }
                        className={"bg-blue-50 rounded-full p-1 m-1"}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <p className="text-xs text-gray-700 text-center w-full">
                *El extra es el producto con el agregado incluido
              </p>
            </div>
          )}
          {product?.venta && store.carrito && (
            <>
              <div className="flex flex-col h-full">
                {/* Cantidad */}
                <div
                  className={`animate-in ${swipeComponents.corto} duration-500 delay-900`}
                >
                  <div className="flex items-center justify-center gap-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={countAddCart === 0 || !product?.stock}
                      onClick={() => setCountAddCart(countAddCart - 1)}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {countAddCart}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        store.stocks &&
                        (product.stock || 0) -
                          product.Cant -
                          product.agregados.reduce(
                            (sum, agg) => sum + agg.cant,
                            0
                          ) <=
                          countAddCart
                      }
                      onClick={() => {
                        setCountAddCart(countAddCart + 1);
                        setButtonClick(true);
                      }}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {/* Botones de acción */}
              <div
                className={`space-y-3 animate-in ${swipeComponents.corto} duration-500 delay-1000`}
              >
                <Button
                  disabled={(product.stock || 0) - product.Cant < countAddCart}
                  onClick={() => {
                    handleToCart({
                      ...product,
                      Cant: (product?.Cant || 0) + countAddCart || 0,
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
                        ((product?.price || 0) + (product?.embalaje || 0)) *
                          countAddCart +
                        (product?.agregados.reduce(
                          (sum, agg) =>
                            (sum =
                              sum +
                              (agg.price + (product?.embalaje || 0)) *
                                agg.cant),
                          0
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
              {/* Features <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4" />
                  Envío gratis en pedidos mayores a $50
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  Garantía de 1 año
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RotateCcw className="w-4 h-4" />
                  Devoluciones gratuitas en 30 días
                </div>
              </div> */}
            </>
          )}
          {product?.venta ? (
            <>
              <Separator />

              {product?.descripcion && (
                <div
                  className={`animate-in ${swipeComponents.amplio} duration-500 delay-500`}
                >
                  Posteado:{" "}
                  <RelativeTime datetime={product?.creado || new Date()} />
                  <ExpandableText text={product?.descripcion || "..."} />
                </div>
              )}
              <Separator />

              <RatingSection
                specific={product?.productId || id}
                sitioweb={store.sitioweb || ""}
              />
            </>
          ) : (
            <p className="text-base text-gray-700">{product?.descripcion}</p>
          )}
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
                  {item.name}
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
