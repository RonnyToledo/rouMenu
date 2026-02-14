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

  // Memoizar categorías ordenadas
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
    if (!sortedCategories) return {};
    const sorted = [...sortedCategories].sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );
    const mapping: { [key: string]: { nextID: string; prevID: string } } = {};
    sorted.forEach((cat, index) => {
      const nextCat = sorted[(index + 1) % sorted.length];
      const prevCat = sorted[(index - 1 + sorted.length) % sorted.length];
      mapping[cat.id] = { nextID: nextCat.id, prevID: prevCat.id };
    });

    return mapping;
  }, [sortedCategories]);

  return (
    <div className="bg-background">
      <HeroNew />
      <div className="mt-2 pb-6">
        {sortedCategories.map((categoria) => (
          <CategoryItem
            key={categoria.id}
            categoria={categoria}
            store={store}
            nextID={next_before_Category[categoria.id]?.nextID || ""}
            prevID={next_before_Category[categoria.id]?.prevID || ""}
          />
        ))}

        {/* Seccion de productos sin categoria */}
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

  // Memoizar productos filtrados
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
    <div className="px-3 mb-4">
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <Link
          href={`/t/${store?.sitioweb}/category/${categoria.id}`}
          className="block"
        >
          <Image
            width={400}
            height={400}
            placeholder="blur"
            blurDataURL={categoryImage}
            alt={categoria.name || "Categoria"}
            className="w-full aspect-[16/9] object-cover"
            src={categoryImage}
          />
        </Link>

        <div className="p-3">
          <Link
            className="text-sm uppercase font-cinzel text-foreground tracking-widest truncate flex items-center font-semibold"
            href={`/t/${store?.sitioweb}/category/${categoria.id}`}
          >
            {categoria.name}
          </Link>

          {!store?.edit?.minimalista && categoria.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-pre-line leading-relaxed">
              {categoria.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-2.5">
            <p className="text-xs font-medium text-muted-foreground">
              {productsCount} Productos
            </p>
            <Button
              size="icon"
              type="button"
              className="size-8 flex justify-center items-center rounded-full"
              onClick={onNavigate}
              aria-label={`Ver productos de ${categoria.name}`}
            >
              <FaArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

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

  // Memoizar productos ordenados
  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [products],
  );

  const gridClass = useMemo(
    () =>
      `grid grid-flow-row-dense gap-3 px-3 ${
        store?.edit?.grid ? "grid-cols-2" : "grid-cols-1"
      }`,
    [store?.edit?.grid],
  );

  return (
    <div ref={sectionRef} className="mb-8">
      <div id={categoria.id} />
      <CategoryHeader
        id={categoria.id}
        name={categoria.name || ""}
        prevID={prevID}
        nextID={nextID}
      />
      <div className={gridClass}>
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

function CategoryHeader({
  id,
  name,
  prevID,
  nextID,
}: {
  id: string;
  name: string;
  prevID: string;
  nextID: string;
}) {
  const { highlightCategory } = useSheet();

  return (
    <div className="sticky top-16 z-10 flex items-center justify-center px-3 py-2">
      <div className="flex items-center justify-between rounded-full bg-card border border-border/60 shadow-sm max-w-[85%] w-full">
        <Button
          onClick={() => ScrollTo(prevID)}
          variant="ghost"
          className="p-2 rounded-full text-muted-foreground hover:text-foreground"
          size="icon"
        >
          <MdNavigateBefore />
        </Button>
        <Button
          variant="ghost"
          className="rounded-full truncate max-w-[70%] w-full line-clamp-1 uppercase font-cinzel tracking-widest px-1 text-sm text-foreground"
          onClick={() => highlightCategory(id)}
        >
          {name}
        </Button>

        <Button
          className="p-2 rounded-full text-muted-foreground hover:text-foreground"
          onClick={() => ScrollTo(nextID)}
          variant="ghost"
          size="icon"
        >
          <MdNavigateNext />
        </Button>
      </div>
    </div>
  );
}

// Nuevo componente para productos sin categoría
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

  const gridClass = useMemo(
    () =>
      `grid grid-flow-row-dense gap-3 px-3 ${
        store?.edit?.grid ? "grid-cols-2" : "grid-cols-1"
      }`,
    [store?.edit?.grid],
  );

  return (
    <div ref={sectionRef} className="mb-8">
      <div id="sin-categoria" />
      <UncategorizedHeader />
      <div className={gridClass}>
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

// Header especial para productos sin categoría (sin funciones de categoría)
function UncategorizedHeader() {
  return (
    <div className="sticky top-16 z-10 flex items-center justify-center px-3 py-2">
      <div className="flex items-center justify-center rounded-full bg-card border border-border/60 shadow-sm max-w-[85%] w-full py-2 px-4">
        <span className="truncate max-w-[70%] w-full line-clamp-1 uppercase font-cinzel tracking-widest text-center text-sm text-foreground">
          Otros Productos
        </span>
      </div>
    </div>
  );
}
