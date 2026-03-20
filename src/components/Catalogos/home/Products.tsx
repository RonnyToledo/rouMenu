"use client";
import Image from "next/image";
import React, { useContext, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { MyContext } from "@/context/MyContext";
import {
  ExtraerCategorias,
  ExtraerProductosSinCategoria,
} from "@/functions/extraerCategoriass";
import { logoApp } from "@/lib/image";
import { AppState, Categoria, Product } from "@/context/InitialStatus";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ProductGrid from "./ProductGrid";
import { useSheet } from "../General/SheetComponent";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { ScrollTo } from "@/functions/ScrollTo";
import HeroNew from "./HeroNew";

export default function Products() {
  const { store } = useContext(MyContext);

  const sortedCategories = useMemo(() => {
    if (!store?.categorias || !store?.products) return [];
    return ExtraerCategorias(store.categorias, store.products).sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );
  }, [store?.categorias, store?.products]);

  const sortedsWithOutCategories = useMemo(() => {
    if (!store?.categorias || !store?.products) return [];
    return ExtraerProductosSinCategoria(store.categorias, store.products);
  }, [store?.categorias, store?.products]);

  const next_before_Category = useMemo(() => {
    if (!sortedCategories || sortedCategories.length === 0) return {};
    const mapping: { [key: string]: { nextID: string; prevID: string } } = {};
    sortedCategories.forEach((cat, index) => {
      const nextCat = sortedCategories[(index + 1) % sortedCategories.length];
      const prevCat =
        sortedCategories[
          (index - 1 + sortedCategories.length) % sortedCategories.length
        ];
      mapping[cat.id] = { nextID: nextCat.id, prevID: prevCat.id };
    });
    return mapping;
  }, [sortedCategories]);

  return (
    <div className="py-6 md:py-10">
      <HeroNew />
      <div className="mt-5 transition-colors">
        {sortedCategories.map((categoria) => (
          <CategoryItem
            key={categoria.id}
            categoria={categoria}
            store={store}
            nextID={next_before_Category[categoria.id]?.nextID || ""}
            prevID={next_before_Category[categoria.id]?.prevID || ""}
          />
        ))}

        {sortedsWithOutCategories.length > 0 && (
          <UncategorizedSection
            products={sortedsWithOutCategories}
            banner={store?.urlPoster || logoApp}
          />
        )}
      </div>
    </div>
  );
}

/* ─── CategoryItem ──────────────────────────────────────────── */

interface CategoryItemProps {
  categoria: Categoria;
  store: AppState;
  prevID: string;
  nextID: string;
}

const CategoryItem = React.memo(function CategoryItem({
  categoria,
  store,
  nextID,
  prevID,
}: CategoryItemProps) {
  const router = useRouter();

  const categoryProducts = useMemo(
    () =>
      store?.products?.filter((p: Product) => p.caja === categoria.id) || [],
    [store?.products, categoria.id],
  );

  const handleNavigate = useCallback(() => {
    router.push(`/t/${store?.sitioweb}/category/${categoria.id}`);
  }, [router, store?.sitioweb, categoria.id]);

  if (categoria.subtienda) {
    return (
      <SubCategoryCard
        categoria={categoria}
        store={store}
        productsCount={categoryProducts.length}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <AnimatedCategorySection
      categoria={categoria}
      banner={store?.urlPoster || logoApp}
      products={categoryProducts}
      nextID={nextID}
      prevID={prevID}
    />
  );
});

/* ─── SubCategoryCard ───────────────────────────────────────── */

interface SubCategoryCardProps {
  categoria: Categoria;
  store: AppState;
  productsCount: number;
  onNavigate: () => void;
}

const SubCategoryCard = React.memo(function SubCategoryCard({
  categoria,
  store,
  productsCount,
  onNavigate,
}: SubCategoryCardProps) {
  const categoryImage = categoria.image || store?.urlPoster || logoApp;

  return (
    <div className="container mx-auto p-2 mb-8">
      {/* Header estilo plantilla */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-base">📦</span>
        </div>
        <div>
          <Link
            className="font-serif text-xl font-semibold text-foreground hover:text-primary transition-colors"
            href={`/t/${store?.sitioweb}/category/${categoria.id}`}
          >
            {categoria.name}
          </Link>
          {!store?.edit?.minimalista && categoria.description && (
            <p className="text-sm text-muted-foreground">
              {categoria.description}
            </p>
          )}
        </div>
      </div>

      {/* Tarjeta de subcategoría */}
      <div className="group relative rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <Link
          href={`/t/${store?.sitioweb}/category/${categoria.id}`}
          className="block relative aspect-3/1 overflow-hidden"
        >
          <Image
            width={600}
            height={200}
            placeholder="blur"
            blurDataURL={categoryImage}
            alt={categoria.name || "Categoría"}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            src={categoryImage}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6">
            <div className="text-white">
              <h3 className="font-serif text-2xl font-semibold">
                {categoria.name}
              </h3>
              <p className="text-white/70 text-sm">{productsCount} productos</p>
            </div>
          </div>
        </Link>
        <div className="p-4 flex items-center justify-between">
          {!store?.edit?.minimalista && categoria.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {categoria.description}
            </p>
          )}
          <Button
            size="sm"
            variant="secondary"
            type="button"
            className="rounded-full ml-auto shrink-0"
            onClick={onNavigate}
            aria-label={`Ver productos de ${categoria.name}`}
          >
            Ver todos
            <FaArrowRight className="ml-2 size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
});

/* ─── AnimatedCategorySection ───────────────────────────────── */

interface AnimatedCategorySectionProps {
  categoria: Categoria;
  banner: string;
  products: Product[];
  prevID: string;
  nextID: string;
}

const AnimatedCategorySection = React.memo(function AnimatedCategorySection({
  categoria,
  banner,
  products,
  prevID,
  nextID,
}: AnimatedCategorySectionProps) {
  const { store } = useContext(MyContext);
  const sectionRef = useRef<HTMLDivElement>(null);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [products],
  );

  // El primer producto "favorito" (popular) se muestra como featured card
  const featuredProduct = sortedProducts.find((p) => p.favorito);
  const regularProducts = featuredProduct
    ? sortedProducts.filter((p) => p.productId !== featuredProduct.productId)
    : sortedProducts;

  const grid = store?.edit?.grid;

  // Con grid de 2 columnas base, la featured ocupa 2 col / 2 row
  const gridClass = `grid grid-flow-row-dense gap-1 p-1 ${
    grid
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2"
  }`;

  return (
    <div ref={sectionRef} className="mb-12">
      <div id={categoria.id} />

      {/* Category header – sticky */}
      <CategoryHeader
        id={categoria.id}
        name={categoria.name || ""}
        description={
          store?.edit?.minimalista ? undefined : categoria.description
        }
        prevID={prevID}
        nextID={nextID}
      />

      <div className={`container mx-auto px-1 ${gridClass}`}>
        {/* Featured card — col-span-2 row-span-2 */}
        {featuredProduct && (
          <ProductGrid
            product={featuredProduct}
            key={featuredProduct.id}
            banner={banner}
            i={0}
            featured
          />
        )}

        {/* Regular cards */}
        {regularProducts.map((product, i) => (
          <ProductGrid
            product={product}
            key={product.id || i}
            banner={banner}
            i={i + (featuredProduct ? 1 : 0)}
          />
        ))}
      </div>
    </div>
  );
});

/* ─── CategoryHeader ────────────────────────────────────────── */

function CategoryHeader({
  id,
  name,
  prevID,
  nextID,
}: {
  id: string;
  name: string;
  description?: string;
  prevID: string;
  nextID: string;
}) {
  const { highlightCategory } = useSheet();

  return (
    <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm px-4 py-3 mb-4">
      <div className="container flex items-center gap-3 w-full">
        {/* Nav prev */}
        <Button
          onClick={() => ScrollTo(prevID)}
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 shrink-0"
        >
          <MdNavigateBefore className="text-lg" />
        </Button>

        {/* Title block */}
        <div className="flex justify-center min-w-0 w-full">
          <Button
            variant="ghost"
            className="h-auto p-0 font-serif text-xl font-semibold text-foreground hover:text-primary
              transition-colors uppercase  line-clamp-1 max-w-full text-center w-full"
            onClick={() => highlightCategory(id)}
          >
            {name}
          </Button>
        </div>

        {/* Nav next */}
        <Button
          onClick={() => ScrollTo(nextID)}
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 shrink-0"
        >
          <MdNavigateNext className="text-lg" />
        </Button>
      </div>
    </div>
  );
}

/* ─── UncategorizedSection ──────────────────────────────────── */

interface UncategorizedSectionProps {
  products: Product[];
  banner: string;
}

const UncategorizedSection = React.memo(function UncategorizedSection({
  products,
  banner,
}: UncategorizedSectionProps) {
  const { store } = useContext(MyContext);
  const sectionRef = useRef<HTMLDivElement>(null);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [products],
  );

  const grid = store?.edit?.grid;
  const gridClass = `grid grid-flow-row-dense gap-3 p-2 ${
    grid
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2"
  }`;

  return (
    <div ref={sectionRef} className="mb-12">
      <div id="sin-categoria" />

      {/* Header */}
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm px-4 py-3 mb-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-base">🛍️</span>
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground uppercase tracking-wide">
                Otros productos
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 ${gridClass}`}>
        {sortedProducts.map((product, i) => (
          <ProductGrid
            product={product}
            key={product.id || i}
            banner={banner}
            i={i}
          />
        ))}
      </div>
    </div>
  );
});
