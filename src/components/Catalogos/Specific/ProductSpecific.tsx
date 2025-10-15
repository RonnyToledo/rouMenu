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
import {
  AgregadosInterface,
  AppState,
  Product as ProductInterface,
} from "@/context/InitialStatus";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShareButton from "@/components/myUI/buttonShare";
import ClipboardProduct from "@/components/myUI/clipboardProduct";
import RelativeTime from "@/components/GeneralComponents/DateTime";
import { Card } from "@/components/ui/card";

interface swipeClassInterface {
  amplio: string;
  corto: string;
}
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

  const swipeComponents = useMemo<swipeClassInterface>(
    () =>
      swipeDirection === "next"
        ? { amplio: "slide-in-from-right-4", corto: "slide-in-from-right-2" }
        : { amplio: "slide-in-from-left-4", corto: "slide-in-from-left-2" },
    [swipeDirection]
  );

  // Calcular valores derivados del producto
  const totalAgregados = useMemo(
    () =>
      product?.agregados?.reduce((sum, agg) => sum + (agg.cant || 0), 0) || 0,
    [product?.agregados]
  );

  const totalCartItems = useMemo(
    () => (product?.Cant || 0) + totalAgregados,
    [product?.Cant, totalAgregados]
  );

  const availableStock = useMemo(
    () => (product?.stock || 0) - totalCartItems,
    [product?.stock, totalCartItems]
  );

  const currentCurrency = useMemo(
    () =>
      store.moneda.find((m) => m.id === product?.default_moneda)?.nombre || "",
    [store.moneda, product?.default_moneda]
  );

  const discountPercentage = useMemo(() => {
    if (!product || (product.oldPrice || 0) <= (product.price || 0)) return 0;
    return Math.round(
      (((product.oldPrice || 0) - (product.price || 0)) /
        (product.oldPrice || 0)) *
        100
    );
  }, [product]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const basePrice =
      ((product.price || 0) + (product.embalaje || 0)) * countAddCart;
    const extrasPrice = product.agregados.reduce(
      (sum, agg) => sum + (agg.price + (product.embalaje || 0)) * agg.cant,
      0
    );
    return basePrice + extrasPrice;
  }, [product, countAddCart]);

  const breadcrumbLinks = useMemo(() => {
    if (!product) return [];
    return [
      { name: "Inicio", link: `/t/${store.sitioweb}` },
      {
        name:
          store.categorias.find((obj) => obj.id === product.caja)?.name || "",
        link: `/t/${store.sitioweb}/category/${product.caja}`,
      },
      {
        name: product.title || "",
        link: `/t/${store.sitioweb}/producto/${product.productId}`,
      },
    ];
  }, [product, store.sitioweb, store.categorias]);

  // Inicializar producto
  useEffect(() => {
    const foundProduct = store.products.find((obj) => obj.productId === id);
    setProduct(foundProduct);

    const initialCount = availableStock > 1 ? 1 : 0;
    setCountAddCart(initialCount);
  }, [store.products, id, availableStock]);

  // Reset contador si hay agregados y no se ha clickeado
  useEffect(() => {
    if (totalAgregados > 0 && !buttonClick) {
      setCountAddCart(0);
    }
  }, [totalAgregados, buttonClick]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleToCart = useCallback(
    (productToCart: ProductInterface) => {
      setIsAddingToCart(true);
      setTimeout(() => setIsAddingToCart(false), 800);

      dispatchStore({
        type: "AddCart",
        payload: JSON.stringify(productToCart),
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      router.push(`/t/${store.sitioweb}`);
    },
    [dispatchStore, router, store.sitioweb]
  );

  const navigateToProduct = useCallback(
    (direction: string) => {
      const currentIndex = store.products.findIndex((p) => p.productId === id);
      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % store.products.length
          : (currentIndex - 1 + store.products.length) % store.products.length;

      const newProductId = store.products[newIndex]?.productId;
      if (!newProductId || !store.sitioweb) {
        console.error("Invalid navigation values");
        return;
      }

      router.push(
        `/t/${store.sitioweb}/producto/${newProductId}?direction=${direction}`
      );
    },
    [id, router, store.products, store.sitioweb]
  );

  const handleSwipeStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    },
    []
  );

  const handleSwipeEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY)) {
        navigateToProduct(deltaX > 0 ? "previous" : "next");
      }
    },
    [navigateToProduct]
  );

  const handleImageSwap = useCallback(
    (newImage: string) => {
      if (!product) return;
      setProduct({
        ...product,
        image: newImage,
        imagesecondary: product.imagesecondary.map((img) =>
          img === newImage ? product.image || store.urlPoster : img
        ),
      });
    },
    [product, store.urlPoster]
  );

  const updateExtraQuantity = useCallback(
    (extraId: string, delta: number) => {
      if (!product) return;
      setProduct({
        ...product,
        agregados: product.agregados.map((obj) =>
          obj.id === extraId ? { ...obj, cant: obj.cant + delta } : obj
        ),
      });
    },
    [product]
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        navigateToProduct("previous");
      } else if (event.key === "ArrowRight") {
        navigateToProduct("next");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigateToProduct]);

  if (!product) return null;

  return (
    <main className="flex items-start min-h-[100svh]">
      <div className="grid grid-cols-1 gap-2 items-start p-4">
        <BreadcrumbNav links={breadcrumbLinks} />

        <ProductImages
          product={product}
          store={store}
          onSwipeStart={handleSwipeStart}
          onSwipeEnd={handleSwipeEnd}
          onImageSelect={handleImageSwap}
        />

        <div
          className={`space-y-4 animate-in ${swipeComponents.corto} duration-700`}
        >
          <ProductHeader
            product={product}
            store={store}
            swipeClass={swipeComponents.corto}
          />

          {product.venta && (
            <>
              <ProductPrice
                product={product}
                currency={currentCurrency}
                discountPercentage={discountPercentage}
                totalCartItems={totalCartItems}
                store={store}
                swipeClass={swipeComponents.corto}
              />

              {product.caracteristicas.length > 0 && (
                <ProductTags tags={product.caracteristicas} />
              )}
            </>
          )}

          {(product.embalaje || 0) > 0 && (
            <PackagingInfo
              price={product.embalaje || 0}
              currency={currentCurrency}
            />
          )}

          {product.agregados.length > 0 && product.stock && (
            <ExtrasSection
              extras={product.agregados}
              currency={currentCurrency}
              availableStock={availableStock - countAddCart}
              onUpdateQuantity={updateExtraQuantity}
            />
          )}

          {product.venta && store.carrito && (
            <CartActions
              product={product}
              countAddCart={countAddCart}
              setCountAddCart={setCountAddCart}
              setButtonClick={setButtonClick}
              availableStock={availableStock}
              totalPrice={totalPrice}
              isAddingToCart={isAddingToCart}
              showSuccess={showSuccess}
              onAddToCart={handleToCart}
              store={store}
              swipeClass={swipeComponents.corto}
            />
          )}

          {product.venta ? (
            <>
              <Separator />
              <ProductTabs
                product={product}
                store={store}
                swipeClass={swipeComponents.amplio}
              />
            </>
          ) : (
            <p className="text-base text-gray-700">{product.descripcion}</p>
          )}
        </div>
      </div>
    </main>
  );
}

// Subcomponentes optimizados

interface BreadcrumbNavProps {
  links: Array<{ name: string; link: string }>;
}

const BreadcrumbNav = React.memo(function BreadcrumbNav({
  links,
}: BreadcrumbNavProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {links.map((item, index) => (
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
});
interface ProductImagesInterface {
  product: ProductInterface;
  store: AppState;
  onSwipeStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onSwipeEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  onImageSelect: (newImage: string) => void;
}
const ProductImages = React.memo(function ProductImages({
  product,
  store,
  onSwipeStart,
  onSwipeEnd,
  onImageSelect,
}: ProductImagesInterface) {
  return (
    <AnimatePresence>
      <motion.div
        key={`Product-motion-${product.productId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="relative rounded-b-2xl overflow-hidden"
        onTouchStart={onSwipeStart}
        onTouchEnd={onSwipeEnd}
      >
        <Image
          width={500}
          height={500}
          alt={product.title || "Product"}
          className="w-full rounded-lg shadow-lg object-cover object-center aspect-square"
          src={product.image || store.urlPoster || logoApp}
        />
      </motion.div>

      {product.imagesecondary.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {product.imagesecondary.map((image: string, index: number) => (
            <Button
              key={index}
              className="p-0 m-0 aspect-square h-auto"
              variant="ghost"
              onClick={() => onImageSelect(image)}
            >
              <Image
                width={100}
                height={100}
                src={image || store.urlPoster || logoApp}
                alt={`${product.title} vista ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </Button>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
});
interface ProductHeaderInterface {
  product: ProductInterface;
  store: AppState;
  swipeClass: string;
}
const ProductHeader = React.memo(function ProductHeader({
  product,
  store,
  swipeClass,
}: ProductHeaderInterface) {
  return (
    <div className="flex flex-col items-start justify-between space-y-1">
      <h1
        className={`line-clamp-1 text-3xl font-bold text-gray-900 animate-in ${swipeClass} duration-500 delay-200`}
      >
        {product.title}
      </h1>
      {product.venta && (
        <div
          className={`flex justify-between items-center w-full gap-2 animate-in ${swipeClass} duration-500 delay-300`}
        >
          <div className="flex gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.coment?.promedio || 0)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-500"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.coment?.promedio || 0} ({product.coment?.total || 0}{" "}
              reseñas)
            </span>
          </div>

          <div className="flex">
            <ClipboardProduct
              title={product.title || ""}
              descripcion={product.descripcion || ""}
              url={product.image}
              price={product.price || 0}
              oldPrice={product.oldPrice || 0}
              className="p-0 m-0"
            />
            <ShareButton
              title={product.title || ""}
              text={product.descripcion}
              url={`https://roumenu.vercel.app/t/${store.sitioweb}/producto/${product.productId}`}
            />
          </div>
        </div>
      )}
    </div>
  );
});
interface ProductPriceInterface {
  product: ProductInterface;
  currency: string;
  discountPercentage: number;
  totalCartItems: number;
  store: AppState;
  swipeClass: string;
}
const ProductPrice = React.memo(function ProductPrice({
  product,
  currency,
  discountPercentage,
  totalCartItems,
  store,
  swipeClass,
}: ProductPriceInterface) {
  return (
    <div className="flex items-center justify-between">
      <div
        className={`flex items-center gap-3 animate-in ${swipeClass} duration-500 delay-400 leading-relaxed text-gray-900`}
      >
        <p className="leading-relaxed text-gray-900">
          ${smartRound(product.price || 0)} {currency}
        </p>
        {discountPercentage > 0 && (
          <>
            <p className="text-gray-500 line-through">${product.oldPrice}</p>
            <Badge variant="destructive" className="animate-pulse">
              {discountPercentage}% OFF
            </Badge>
          </>
        )}
      </div>

      <StockIndicator
        stock={product?.stock || 0}
        showStocks={store.stocks}
        totalCartItems={totalCartItems}
        swipeClass={swipeClass}
      />
    </div>
  );
});
interface StockIndicatorInterface {
  stock: number;
  showStocks: boolean;
  totalCartItems: number;
  swipeClass: string;
}
const StockIndicator = React.memo(function StockIndicator({
  stock,
  showStocks,
  totalCartItems,
  swipeClass,
}: StockIndicatorInterface) {
  if (!stock) {
    return (
      <div
        className={`flex items-center gap-2 text-red-600 animate-in ${swipeClass} duration-500 delay-1100`}
      >
        <div className="w-2 h-2 bg-red-600 rounded-full" />
        <span className="text-sm font-medium">Agotado</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-1 animate-in ${swipeClass} duration-500 delay-1100`}
    >
      <div className="flex items-center gap-2 text-green-600">
        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
        <span className="text-sm font-medium">
          {showStocks && stock <= 10 ? `${stock} u.` : "En stock"}
        </span>
      </div>
      {totalCartItems > 0 && (
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-700">
            Pedidas {totalCartItems}
          </span>
        </div>
      )}
    </div>
  );
});

const ProductTags = React.memo(function ProductTags({
  tags,
}: {
  tags: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
});

const PackagingInfo = React.memo(function PackagingInfo({
  price,
  currency,
}: {
  price: number;
  currency: string;
}) {
  return (
    <div className="mb-4 space-y-1">
      <h3 className="font-medium">Embalaje</h3>
      <Card className="p-3 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium">Costo</div>
              <div className="text-sm text-gray-800">
                {smartRound(price).toFixed(2)} {currency}
              </div>
            </div>
          </div>
          <div className="bg-gray-500 rounded-full">
            <Check className="m-2 text-white fill-white size-3.5" />
          </div>
        </div>
      </Card>
    </div>
  );
});
interface ExtrasSectionInterface {
  extras: AgregadosInterface[];
  currency: string;
  availableStock: number;
  onUpdateQuantity: (extraId: string, delta: number) => void;
}
const ExtrasSection = React.memo(function ExtrasSection({
  extras,
  currency,
  availableStock,
  onUpdateQuantity,
}: ExtrasSectionInterface) {
  return (
    <div className="mb-4 space-y-1">
      <h3 className="font-medium">Extras</h3>
      <p className="text-sm text-gray-500">Agregados para su encargo</p>

      {extras.map((extra) => (
        <Card key={extra.id} className="p-3 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{extra.name}</div>
              <div className="text-sm text-gray-500">
                {smartRound(extra.price || 0).toFixed(2)} {currency}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {extra.cant > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(extra.id, -1)}
                    className="bg-blue-50 rounded-full p-1 m-1"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Badge variant="outline">{extra.cant}</Badge>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={availableStock <= extra.cant}
                onClick={() => onUpdateQuantity(extra.id, 1)}
                className="bg-blue-50 rounded-full p-1 m-1"
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
  );
});
interface CartActionsInterface {
  product: ProductInterface;
  countAddCart: number;
  setCountAddCart: React.Dispatch<React.SetStateAction<number>>;
  setButtonClick: React.Dispatch<React.SetStateAction<boolean>>;
  availableStock: number;
  totalPrice: number;
  isAddingToCart: boolean;
  showSuccess: boolean;
  onAddToCart: (product: ProductInterface) => void;
  store: AppState;
  swipeClass: string;
}
const CartActions = React.memo(function CartActions({
  product,
  countAddCart,
  setCountAddCart,
  setButtonClick,
  availableStock,
  totalPrice,
  isAddingToCart,
  showSuccess,
  onAddToCart,
  store,
  swipeClass,
}: CartActionsInterface) {
  const router = useRouter();
  return (
    <>
      <div className={`animate-in ${swipeClass} duration-500 delay-900`}>
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="sm"
            disabled={countAddCart === 0 || !product.stock}
            onClick={() => setCountAddCart((prev: number) => prev - 1)}
            className="hover:scale-105 transition-transform duration-200"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-12 text-center font-medium">{countAddCart}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={store.stocks && availableStock <= countAddCart}
            onClick={() => {
              setCountAddCart((prev: number) => prev + 1);
              setButtonClick(true);
            }}
            className="hover:scale-105 transition-transform duration-200"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        className={`space-y-3 animate-in ${swipeClass} duration-500 delay-1000`}
      >
        <Button
          disabled={availableStock < countAddCart}
          onClick={() =>
            onAddToCart({
              ...product,
              Cant: product.Cant + countAddCart,
            })
          }
          className={`w-full h-12 text-base font-medium rounded-3xl transition-all duration-300 ${
            showSuccess ? "bg-green-600 hover:bg-green-700" : "hover:scale-105"
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
              Agregar al carrito - ${totalPrice.toFixed(2)}
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
  );
});
interface ProductTabsInterface {
  product: ProductInterface;
  store: AppState;
  swipeClass: string;
}
const ProductTabs = React.memo(function ProductTabs({
  product,
  store,
  swipeClass,
}: ProductTabsInterface) {
  return (
    <Tabs
      defaultValue={product.descripcion ? "description" : "rating"}
      className="min-h-96 text-gray-800"
    >
      <TabsList>
        <TabsTrigger value="description" disabled={!product.descripcion}>
          Detalles
        </TabsTrigger>
        <TabsTrigger value="rating">Rating</TabsTrigger>
      </TabsList>

      {product.descripcion && (
        <TabsContent value="description">
          <div className={`animate-in ${swipeClass} duration-500 delay-500`}>
            Posteado: <RelativeTime datetime={product.creado || new Date()} />
            <ExpandableText text={product.descripcion || "..."} />
          </div>
        </TabsContent>
      )}

      <TabsContent value="rating">
        <RatingSection
          specific={product.productId}
          sitioweb={store.sitioweb || ""}
        />
      </TabsContent>
    </Tabs>
  );
});
