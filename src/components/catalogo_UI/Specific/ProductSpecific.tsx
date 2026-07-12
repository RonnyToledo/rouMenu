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
  Product as ProductInterface,
  ProductVariant,
  InfoSections,
} from "@/types/InitialStatus";
import { logoApp } from "@/lib/image";
import RatingSection from "./RatingSection";
import { notFound, useRouter } from "next/navigation";
import { Star, Minus, Plus, Check, ChevronRight } from "lucide-react";
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
import { isNewProduct } from "../home/ProductUI/Product-Grid";
import { HomeIcon } from "lucide-react";
import {
  groupVariantsByAttribute,
  findVariantByAttributes,
  isAttributeValueAvailable,
  buildCartTitle,
  capitalize,
  getVisibleAttributes,
  isLightColor,
  normalizeAttrValue,
  extractColorHex,
} from "@/lib/variantUtils";
import ProductSuggestions from "./ProductSuggestions";
import { buildSuggestions } from "@/lib/combosUtils";
import StockAlertButton from "@/functions/StockAlertButton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

// ─── Mapa de iconos (string → componente) ────────────────────────────────────
// Mismo mapa que InfoSectionsEditor para consistencia
import {
  FileText,
  Beaker,
  Zap,
  Leaf,
  Info,
  AlertTriangle,
  Package,
} from "lucide-react";

const ICON_MAP: Record<
  string,
  React.FC<{ size?: number; className?: string }>
> = {
  FileText,
  Beaker,
  Zap,
  Leaf,
  Info,
  Star,
  AlertTriangle,
  Package,
};

function SectionIcon({
  name,
  size = 16,
  className,
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const Comp = ICON_MAP[name ?? ""] ?? Info;
  return <Comp size={size} className={className} />;
}

// ─── isColorLight ─────────────────────────────────────────────────────────────
function isColorLight(hexColor: string): boolean {
  if (!hexColor || hexColor === "#171717") return false;
  const hex = hexColor.replace("#", "");
  const rgb = parseInt(hex, 16);
  const r = ((rgb >> 16) & 255) / 255;
  const g = ((rgb >> 8) & 255) / 255;
  const b = (rgb & 255) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.45;
}

// ─── InfoSectionDrawer ────────────────────────────────────────────────────────
function InfoSectionDrawer({ section }: { section: InfoSections }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3.5
          border border-border rounded-2xl
          hover:bg-secondary/40 active:bg-secondary/70
          transition-colors text-left group  "
      >
        <div className="flex items-center gap-3">
          {section.icon && (
            <div className="w-7 h-7 rounded-full bg-secondary text-foreground flex items-center justify-center shrink-0">
              <SectionIcon name={section.icon} size={14} />
            </div>
          )}
          <span className="text-[14px] font-medium text-foreground leading-tight">
            {section.label}
          </span>
        </div>
        <ChevronRight
          size={16}
          className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0"
        />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg px-5 pb-8 pt-2">
            <DrawerHeader className="px-0 pb-4">
              <div className="flex items-center gap-3">
                {section.icon && (
                  <div className="w-9 h-9 rounded-full bg-secondary text-foreground flex items-center justify-center shrink-0">
                    <SectionIcon name={section.icon} size={18} />
                  </div>
                )}
                <DrawerTitle className="text-lg font-semibold text-foreground flex-1">
                  {section.label}
                </DrawerTitle>
                <DrawerDescription />

                {/* ── Botón copiar ── */}
                <ClipboardProduct
                  mode="section"
                  title={section.label ?? ""}
                  descripcion={section.content ?? ""}
                  className="text-muted-foreground text-sm p-1.5!"
                />
              </div>
            </DrawerHeader>

            <div className="text-[14px] text-foreground/80 leading-relaxed whitespace-pre-line max-h-[calc(100vh/2)] overflow-y-auto">
              {section.content || (
                <span className="text-muted-foreground italic">
                  Sin contenido disponible.
                </span>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

// ─── InfoSectionsList ─────────────────────────────────────────────────────────
// Agrupa todas las secciones en un contenedor con borde, como en la imagen
function InfoSectionsList({ sections }: { sections: InfoSections[] }) {
  if (!sections || sections.length === 0) return null;
  return (
    <div className=" space-y-1 overflow-hidden bg-card">
      {sections.map((section, idx) => (
        <InfoSectionDrawer key={section.id ?? idx} section={section} />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductDetailsPage({
  id,
  initialProductData,
  color,
}: {
  id: string;
  initialProductData: ProductInterface;
  color: string;
}) {
  const { store, dispatchStore } = useContext(MyContext);
  const router = useRouter();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const mainRef = useRef<HTMLDivElement>(null);

  const baseProducts = useMemo(
    () =>
      store.products.filter(
        (p) => !p.selected_variant || p.selected_variant.default === true,
      ),
    [store.products],
  );

  const initialProduct = useMemo(
    () =>
      initialProductData ?? store.products.find((obj) => obj.productId === id),
    [initialProductData, store.products, id],
  );

  const visibleVariants = useMemo(() => {
    if (!initialProduct?.variants) return [];
    // Incluir todas las variantes no ocultas (incluso con stock=0)
    return initialProduct.variants.filter((v) => v.visible !== false);
  }, [initialProduct]);

  // Mostrar opciones de variantes solo si hay más de 1 visible
  const hasRealVariants = visibleVariants.length > 1;

  // Seleccionar variante default: preferir con stock, pero incluir todas
  const [attrSelection, setAttrSelection] = useState<Record<string, unknown>>(
    () => {
      if (visibleVariants.length === 0) return {};

      let selectedVariant;

      if (visibleVariants.length === 1) {
        // Caso: Solo 1 variante visible → usarla sin importar stock
        selectedVariant = visibleVariants[0];
      } else {
        // Caso: Múltiples variantes visibles → preferir con stock
        selectedVariant =
          visibleVariants.find((v) => v.default && (v.stock ?? 0) > 0) ??
          visibleVariants.find(
            (v) => v.default_variant && (v.stock ?? 0) > 0,
          ) ??
          visibleVariants.find((v) => (v.stock ?? 0) > 0) ??
          visibleVariants.find((v) => v.default || v.default_variant) ??
          visibleVariants[0];
      }

      return selectedVariant ? getVisibleAttributes(selectedVariant) : {};
    },
  );

  // Reinicializar cuando las variantes cambien
  useEffect(() => {
    if (visibleVariants.length === 0) return;

    let selectedVariant;

    if (visibleVariants.length === 1) {
      // Caso: Solo 1 variante visible → usarla sin importar stock
      selectedVariant = visibleVariants[0];
    } else {
      // Caso: Múltiples variantes visibles → preferir con stock
      selectedVariant =
        visibleVariants.find((v) => v.default && (v.stock ?? 0) > 0) ??
        visibleVariants.find((v) => v.default_variant && (v.stock ?? 0) > 0) ??
        visibleVariants.find((v) => (v.stock ?? 0) > 0) ??
        visibleVariants.find((v) => v.default || v.default_variant) ??
        visibleVariants[0];
    }

    if (selectedVariant) {
      setAttrSelection(getVisibleAttributes(selectedVariant));
    }
  }, [visibleVariants]);

  // 1. Separar variantes secundarias
  const secondaryVariants = useMemo(
    () => visibleVariants.filter((v) => !v.default_variant),
    [visibleVariants],
  );
  const hasSecondaryVariants = secondaryVariants.length > 0;

  // 2. Atributos agrupados SOLO de las secundarias
  const groupedAttributes = useMemo(
    () => groupVariantsByAttribute(secondaryVariants),
    [secondaryVariants],
  );

  // 3. Modo de selección (estándar o personalizado)
  const [mode, setMode] = useState<"default" | "custom">("default");

  // Sincronizar modo con attrSelection
  useEffect(() => {
    if (Object.keys(attrSelection).length === 0) {
      setMode("default");
    } else {
      setMode("custom");
    }
  }, [attrSelection]);

  // 4. activeVariant: prioriza la principal si attrSelection está vacío
  const activeVariant = useMemo(() => {
    if (visibleVariants.length === 0) return null;
    if (Object.keys(attrSelection).length === 0) {
      const defaultVar = visibleVariants.find(
        (v) => v.default_variant && (v.stock ?? 0) > 0,
      );
      if (defaultVar) return defaultVar;
    }
    const found = findVariantByAttributes(visibleVariants, attrSelection);
    if (found) return found;
    return (
      visibleVariants.find((v) => (v.stock ?? 0) > 0) ?? visibleVariants[0]
    );
  }, [visibleVariants, attrSelection]);

  // 5. Función para resetear a la principal
  const handleSelectDefault = () => {
    setAttrSelection({});
    setMode("default");
  };

  const initialCount = useMemo(() => {
    if (!initialProduct) return 0;
    const effectiveStock =
      activeVariant?.stock ?? initialProduct.selected_variant?.stock ?? 0;
    const effectiveCant = initialProduct.selected_variant?.Cant || 0;
    return effectiveStock - effectiveCant > 1 ? 1 : 0;
  }, [initialProduct, activeVariant]);

  const [countAddCart, setCountAddCart] = useState<number>(initialCount);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const product = useMemo(() => {
    if (!initialProduct || !activeVariant) return initialProduct;
    return {
      ...initialProduct,
      price: activeVariant.price ?? initialProduct.selected_variant?.price,
      oldPrice:
        activeVariant.oldPrice ?? initialProduct.selected_variant?.oldPrice,
      stock: activeVariant.stock ?? initialProduct.selected_variant?.stock,
      image: activeVariant.image ?? initialProduct.selected_variant?.image,
      selected_variant: activeVariant,
    };
  }, [initialProduct, activeVariant]);

  useEffect(() => {
    setCountAddCart(initialCount);
  }, [initialCount]);

  const handleAttrChange = useCallback(
    (key: string, value: unknown) => {
      const nextSelection = { ...attrSelection, [key]: value };

      const matched = findVariantByAttributes(visibleVariants, nextSelection);
      if (matched) {
        setAttrSelection(getVisibleAttributes(matched));
      } else {
        setAttrSelection(nextSelection);
      }
    },
    [attrSelection, visibleVariants],
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

  const handleSwipeStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleSwipeEnd = (e: React.TouchEvent<HTMLDivElement>) => {
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
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigateToProduct("previous");
      else if (event.key === "ArrowRight") navigateToProduct("next");
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigateToProduct]);

  useEffect(() => {
    if (mainRef.current && color) {
      mainRef.current.style.setProperty("--product-color", color);
    }
  }, [color]);

  const links = useMemo(
    () => [
      { name: "Inicio", link: `/t/${store.sitioweb}` },
      {
        name:
          store?.categorias.find((obj) => obj.id === product?.caja)?.name || "",
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
        !product?.selected_variant?.stock && "Agotado",
        product?.favorito && "Top",
        isNewProduct(product?.creado) && "Nuevo",
        ...(product?.caracteristicas || []),
      ]
        .flat()
        .filter(Boolean),
    [
      product?.selected_variant?.stock,
      product?.favorito,
      product?.creado,
      product?.caracteristicas,
    ],
  );

  if (!product) notFound();

  const effectivePrice =
    activeVariant?.price ?? product.selected_variant?.price ?? 0;
  const effectiveOldPrice =
    activeVariant?.oldPrice ?? product.selected_variant?.oldPrice ?? 0;
  const effectiveStock =
    activeVariant?.stock ?? product.selected_variant?.stock ?? 0;
  const availableStock = effectiveStock - (product.selected_variant?.Cant || 0);
  const cartTitle = buildCartTitle(
    product.title || "",
    activeVariant || undefined,
  );
  const currentSelectionValid = useMemo(
    () => isSelectionValid(visibleVariants, attrSelection),
    [visibleVariants, attrSelection],
  );
  const currentCurrency =
    store.moneda.find((m) => m.id === product.default_moneda)?.nombre || "";
  const suggestions = useMemo(
    () => buildSuggestions(initialProduct, store.products),
    [initialProduct, store.products],
  );
  const discountPct =
    effectiveOldPrice > effectivePrice
      ? Math.round(
          ((effectiveOldPrice - effectivePrice) / effectiveOldPrice) * 100,
        )
      : null;

  // info_sections normalizadas (solo las que tienen contenido o label)
  const infoSections = useMemo(
    () => (product.info_sections ?? []).filter((s) => s.label || s.content),
    [product.info_sections],
  );

  return (
    <main
      ref={mainRef}
      className="eclipse-body flex flex-col items-start min-h-dvh"
      style={{ color: isColorLight(color) ? "#000" : "inherit" }}
    >
      {/* ── Hero image ──────────────────────────────────────────── */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={product.selected_variant?.image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl m-2"
            style={{ aspectRatio: "1 / 1" }}
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}
          >
            <Image
              width={800}
              height={800}
              alt={product.title || "Producto"}
              className="w-full h-full object-cover"
              src={
                product.selected_variant?.image || store.urlPoster || logoApp
              }
              style={{
                filter: effectiveStock
                  ? "initial"
                  : "grayscale(1) opacity(0.65)",
              }}
              onError={() => {
                dispatchStore({
                  type: "Add",
                  payload: {
                    ...store,
                    products: store.products.map((prod) =>
                      product.productId === prod.productId
                        ? { ...prod, image: "" }
                        : prod,
                    ),
                  },
                });
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[rgba(44,26,14,0.35)] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              {effectiveStock ? (
                <StockPill inStock />
              ) : (
                <StockPill inStock={false} />
              )}
            </div>
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {[0, 1, 2].map((d) => (
                <div
                  key={d}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      d === 1 ? "var(--eca)" : "rgba(255,255,255,0.4)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-3 pb-28">
        {/* Breadcrumbs + rating */}
        <div className="flex justify-between gap-2">
          <ProductBreadcrumbs items={links} />
          <div className="flex items-center">
            <Link
              href={`/t/${store.sitioweb}/producto/${product.productId}/coment`}
              className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.coment.promedio || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-product"
                    }`}
                  />
                ))}
              </div>
            </Link>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, idx) => (
              <EclipseTag key={idx}>{String(tag)}</EclipseTag>
            ))}
          </div>
        )}

        {/* Price block */}
        <div className="flex items-center justify-between">
          <div className="flex items-end gap-3">
            <span className="eclipse-title text-[32px] font-bold leading-none">
              ${effectivePrice}
            </span>
            <span className="text-sm mb-1">{currentCurrency}</span>
            {effectiveOldPrice > effectivePrice && (
              <>
                <span className="text-sm text-rose-500 line-through mb-1">
                  ${effectiveOldPrice}
                </span>
                <span className="mb-1 text-[10px] font-semibold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full animate-pulse">
                  -{discountPct}% OFF
                </span>
              </>
            )}
          </div>
          <div className="flex gap-1">
            <ClipboardProduct
              title={cartTitle}
              descripcion={product.descripcion || ""}
              url={product.selected_variant?.image || logoApp}
              price={effectivePrice}
              oldPrice={effectiveOldPrice}
            />
            <ShareButton
              title={cartTitle}
              text={product.descripcion}
              url={`https://roumenu.vercel.app/t/${store.sitioweb}/producto/${id}`}
            />
          </div>
        </div>

        {/* Variants */}
        {hasRealVariants && Object.keys(groupedAttributes).length > 0 && (
          <div className="space-y-4 pt-1">
            {hasSecondaryVariants && (
              <div className="space-y-4 pt-1">
                {/* Selector de modo — mismo patrón (pill + layoutId) que el StepIndicator del carrito */}
                <div className="relative flex items-center gap-1 bg-secondary border border-border rounded-full p-1 w-fit">
                  <button
                    type="button"
                    onClick={handleSelectDefault}
                    className="relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                  >
                    {mode === "default" && (
                      <motion.div
                        layoutId="variant-mode-pill"
                        className="absolute inset-0 bg-foreground rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 flex items-center gap-1.5 ${
                        mode === "default"
                          ? "text-background"
                          : "text-muted-foreground"
                      }`}
                    >
                      {initialProduct?.selected_variant?.label || "Estándar"}
                      {mode === "default" && <Check className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("custom")}
                    className="relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                  >
                    {mode === "custom" && (
                      <motion.div
                        layoutId="variant-mode-pill"
                        className="absolute inset-0 bg-foreground rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 flex items-center gap-1.5 ${
                        mode === "custom"
                          ? "text-background"
                          : "text-muted-foreground"
                      }`}
                    >
                      Personalizar
                      {mode === "custom" && <Check className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                </div>

                {/* Atributos (solo en modo custom) */}
                <AnimatePresence mode="wait">
                  {mode === "custom" &&
                    Object.keys(groupedAttributes).length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {Object.entries(groupedAttributes).map(
                          ([attrKey, values]) => (
                            <div key={attrKey} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-widest">
                                  {capitalize(attrKey)}
                                </span>
                                {attrSelection[attrKey] !== undefined && (
                                  <span className="text-[11px] font-medium">
                                    {normalizeAttrValue(attrSelection[attrKey])}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {values.map((val) => {
                                  const isSelected =
                                    normalizeAttrValue(
                                      attrSelection[attrKey],
                                    ) === normalizeAttrValue(val);
                                  const isAvailable = isAttributeValueAvailable(
                                    visibleVariants,
                                    attrSelection,
                                    attrKey,
                                    val,
                                  );
                                  if (attrKey === "color") {
                                    const colorHex = extractColorHex(val);
                                    const colorName = normalizeAttrValue(val);
                                    const light = isLightColor(colorHex);
                                    return (
                                      <button
                                        key={colorName}
                                        onClick={() =>
                                          handleAttrChange(attrKey, val)
                                        }
                                        disabled={!isAvailable}
                                        title={colorName}
                                        className={[
                                          "w-9 h-9 rounded-full transition-all duration-200 relative flex items-center justify-center",
                                          isSelected
                                            ? "ring-2 ring-offset-2 scale-110 border-2 border-white"
                                            : "border-2 border-transparent hover:scale-105",
                                          !isAvailable
                                            ? "opacity-30 cursor-not-allowed"
                                            : "",
                                        ].join(" ")}
                                        style={{ backgroundColor: colorHex }}
                                      >
                                        {!isAvailable && (
                                          <span className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                                            <span className="block w-full h-px bg-foreground/60 rotate-45" />
                                          </span>
                                        )}
                                        {isSelected && (
                                          <Check
                                            className="w-3.5 h-3.5 drop-shadow"
                                            style={{
                                              color: light ? "#000" : "#fff",
                                            }}
                                          />
                                        )}
                                      </button>
                                    );
                                  }
                                  return (
                                    <button
                                      key={String(val)}
                                      onClick={() =>
                                        handleAttrChange(attrKey, val)
                                      }
                                      disabled={!isAvailable}
                                      className={[
                                        "px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200",
                                        isSelected
                                          ? "text-background bg-foreground border-foreground shadow-sm"
                                          : "border-border text-foreground",
                                        !isAvailable
                                          ? "opacity-30 cursor-not-allowed line-through"
                                          : "",
                                      ].join(" ")}
                                    >
                                      {normalizeAttrValue(val)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ),
                        )}
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            )}

            {mode === "default" && (
              <div className="text-sm text-muted-foreground bg-secondary/50 border border-border rounded-2xl px-4 py-2.5 text-center">
                Estás viendo la versión estándar. Haz clic en «Personalizar»
                para elegir color o talla.
              </div>
            )}
          </div>
        )}

        {/* Embalaje */}
        {(product.selected_variant?.embalaje || 0) > 0 && (
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-border">
            <div>
              <p className="text-[12px] font-semibold">Embalaje incluido</p>
              <p className="text-[11px]">
                ${product.selected_variant?.embalaje.toFixed(2)}{" "}
                {currentCurrency}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        )}

        {/* ── Extract (texto corto visible) ─────────────────────── */}
        {product.descripcion && (
          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
            {product.descripcion}
          </p>
        )}

        {/* ── Info sections como lista de drawers ───────────────── */}
        <InfoSectionsList sections={infoSections} />

        {/* Rating + sugerencias */}
        <div className="pt-4 border-t border-border">
          <RatingSection
            specific={product.productId || id}
            sitioweb={store.sitioweb || ""}
            productData={product}
          />
          <ProductSuggestions
            products={suggestions}
            sitioweb={store.sitioweb || ""}
            currentCurrency={currentCurrency}
            title={
              (initialProduct?.combos?.length ?? 0) > 0
                ? "Queda bien con..."
                : "También te puede gustar"
            }
          />
        </div>
      </div>

      {/* ── Dock flotante — mismo patrón que el CTA del carrito ─── */}
      {effectiveStock > 0 ? (
        <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-4 pt-2 pointer-events-none">
          <div className="mx-auto max-w-md pointer-events-auto">
            <div className="flex items-center gap-2 rounded-full bg-background/90 backdrop-blur-lg border border-border shadow-lg p-2">
              <div className="flex items-center gap-0.5 bg-secondary rounded-full px-1 py-1 shrink-0">
                <EclipseQtyButton
                  onClick={() => setCountAddCart((c) => c - 1)}
                  disabled={countAddCart === 0}
                  icon={<Minus className="w-3.5 h-3.5" />}
                />
                <span className="eclipse-title text-base font-bold w-7 text-center text-foreground">
                  {countAddCart}
                </span>
                <EclipseQtyButton
                  onClick={() => setCountAddCart((c) => c + 1)}
                  disabled={!!store.stocks && countAddCart >= availableStock}
                  icon={<Plus className="w-3.5 h-3.5" />}
                />
              </div>
              <button
                type="button"
                disabled={
                  !currentSelectionValid ||
                  availableStock < countAddCart ||
                  countAddCart === 0
                }
                onClick={() => {
                  handleToCart({
                    ...product,
                    selected_variant: {
                      ...activeVariant,
                      Cant: countAddCart,
                    } as ProductVariant,
                  });
                }}
                className={[
                  "bg-product flex-1 h-11 rounded-full text-[13px] font-semibold transition-all duration-300",
                  "flex items-center justify-center gap-2 active:scale-[0.98]",
                  showSuccess
                    ? "bg-emerald-600 text-white"
                    : isColorLight(color)
                      ? "text-black"
                      : "text-white",
                  isAddingToCart ? "scale-95 opacity-80" : "",
                  availableStock < countAddCart || countAddCart === 0
                    ? "opacity-40 cursor-not-allowed"
                    : "",
                ].join(" ")}
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Agregando...
                  </>
                ) : showSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    Agregar · $
                    {(
                      (effectivePrice +
                        (product.selected_variant?.embalaje || 0)) *
                      countAddCart
                    ).toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <StockAlertButton
          productId={product.productId}
          variantId={product.selected_variant.id}
          variant="full"
        />
      )}
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StockPill({ inStock }: { inStock: boolean }) {
  return (
    <div
      className={[
        "flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-lg text-[11px] font-medium border border-slate-100",
        inStock
          ? "bg-product/30 text-slate-100"
          : "bg-neutral-900/70 text-neutral-400",
      ].join(" ")}
    >
      <div
        className={[
          "w-1.5 h-1.5 rounded-full animate-pulse",
          inStock ? "bg-product-400" : "bg-neutral-500",
        ].join(" ")}
      />
      {inStock ? "En stock" : "Agotado"}
    </div>
  );
}

function EclipseTag({ children }: { children: string }) {
  const colorMap: Record<string, string> = {
    Agotado: "bg-neutral-200 text-neutral-500",
    Top: "bg-amber-100 text-amber-700",
    Nuevo: "bg-rose-100 text-rose-600",
  };
  const cls = colorMap[children] ?? "bg-product/20";
  return (
    <span className={`text-[10px] font-medium px-3 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  );
}

function EclipseQtyButton({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-8 h-8 rounded-full flex items-center justify-center text-foreground transition-all duration-200",
        "hover:bg-background active:scale-90",
        disabled ? "opacity-30 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {icon}
    </button>
  );
}

interface BreadcrumbInterface {
  name: string;
  link: string;
}

function ProductBreadcrumbs({ items }: { items: BreadcrumbInterface[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <div
            key={`Bread-${index}`}
            className="flex items-center w-1/3 max-w-fit"
          >
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={item.link}
                  className="max-w-28 line-clamp-1 text-[11px] hover:transition-colors"
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
export function isSelectionValid(
  variants: ProductVariant[],
  selection: Record<string, unknown>,
): boolean {
  return variants.some((v) => {
    if ((v.stock ?? 0) <= 0) return false;
    const attrs = getVisibleAttributes(v);

    return Object.entries(selection).every(
      ([k, val]) =>
        k in attrs && normalizeAttrValue(attrs[k]) === normalizeAttrValue(val),
    );
  });
}
