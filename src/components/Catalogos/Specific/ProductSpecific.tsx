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
import { Star, Minus, Plus, ShoppingCart } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShareButton from "@/components/myUI/buttonShare";
import ClipboardProduct from "@/components/myUI/clipboardProduct";

export default function Product({ id }: { id: string }) {
  const { store, dispatchStore } = useContext(MyContext);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductInterface>();
  const [countAddCart, setCountAddCart] = useState<number>(1);
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
    setProduct(store.products.find((obj) => obj.productId == id));
  }, [store.products, id]);

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
    <main>
      <div className="grid grid-cols-1  gap-2 items-start p-4">
        <BreadCrumpParent list={links} />
        <AnimatePresence>
          <motion.div
            key={`Product-motion-${product?.productId}`} // Necesario para que Framer Motion detecte cambios
            initial={{
              opacity: 0,
              x: swipeDirection === "next" ? 100 : -100,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDirection === "next" ? -100 : 100 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-b-2xl overflow-hidden"
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}
          >
            <Image
              width={500}
              height={500}
              alt={product?.title || "Product"}
              className={`w-full rounded-lg shadow-lg border border-[var(--border-gold)] ${
                product?.span ? "aspect-video" : "aspect-square"
              }`}
              src={product?.image || store.urlPoster || logoApp}
            />
          </motion.div>

          {/* Miniaturas */}
          <div className="grid grid-cols-3 gap-2">
            {product?.imagesecondary.map((image, index) => (
              <Image
                key={index}
                width={100}
                height={100}
                src={image || store.urlPoster || logoApp}
                alt={`${product?.title} vista ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            ))}
          </div>
        </AnimatePresence>
        <div
          className={`space-y-3 animate-in ${swipeComponents.corto} duration-700`}
        >
          {/* Título y precio */}
          <div className="flex flex-col items-start justify-between space-y-1">
            <h1
              className={`line-clamp-1 text-3xl font-bold text-gray-900 animate-in ${swipeComponents.corto} duration-500 delay-200`}
            >
              {product?.title}
            </h1>
            <div
              className={`flex justify-between items-center w-full gap-2 animate-in ${swipeComponents.corto} duration-500 delay-300`}
            >
              <div className="flex gap-2">
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
              </div>

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
          </div>

          {/* Precio */}
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-3 animate-in ${swipeComponents.corto} duration-500 delay-400 leading-relaxed text-gray-900`}
            >
              <p className="leading-relaxed text-gray-900">
                ${smartRound(product?.price || 0)} {store.moneda_default.moneda}
              </p>
              {(product?.oldPrice || 0) > (product?.price || 0) && (
                <p className=" text-gray-500 line-through">
                  ${product?.oldPrice}
                </p>
              )}
              {(product?.oldPrice || 0) > (product?.price || 0) && (
                <Badge variant="destructive" className="animate-pulse">
                  {Math.round(
                    ((product?.oldPrice || 0 - (product?.price || 0)) /
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
                {!product?.agotado ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">En stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                    <span className="text-sm font-medium">Agotado</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {store.carrito && (
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
                      disabled={countAddCart === 0 || product?.agotado}
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
                      disabled={product?.agotado}
                      onClick={() => setCountAddCart(countAddCart + 1)}
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
                  disabled={product?.agotado}
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
                      {((product?.price || 0) * countAddCart).toFixed(2)}
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
            </>
          )}
          <Separator />
          <Tabs defaultValue="description" className="min-h-[20vh]">
            <TabsList>
              <TabsTrigger value="description">Desc</TabsTrigger>
              <TabsTrigger value="rating">Rating</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              {/* Descripción */}
              <div
                className={`animate-in ${swipeComponents.amplio} duration-500 delay-500`}
              >
                <ExpandableText text={product?.descripcion || "..."} />
              </div>
            </TabsContent>
            <TabsContent value="rating">
              {/* Estado de stock */}

              <RatingSection
                specific={product?.productId || id}
                sitioweb={store.sitioweb || ""}
              />
            </TabsContent>
            <TabsContent value="details">
              {(product?.caracteristicas?.length || 0) > 0 ? (
                <ul className="space-y-3">
                  {product?.caracteristicas.map((obj, index) => (
                    <li className="flex items-center text-gray-700" key={index}>
                      <span className="w-2 h-2 bg-primary rounded-full mr-3 text-gray-700"></span>
                      {obj}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center  text-gray-700">
                  No hay detalles para mostrar
                </div>
              )}
            </TabsContent>
          </Tabs>
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
