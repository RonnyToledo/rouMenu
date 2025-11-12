"use client";
import Image from "next/image";
import React, { useContext, useMemo, useCallback } from "react";
import Link from "next/link";
import { MyContext } from "@/context/MyContext";
import { ExtraerCategorias } from "@/functions/extraerCategoriass";
import { logoApp } from "@/lib/image";
import { AppState, Categoria, Product } from "@/context/InitialStatus";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ProductGrid from "./ProductGrid";

const headerVariants = {
  normal: {
    scale: 1,
    boxShadow: "none",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  sticky: {
    scale: 0.98,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,1)",
  },
};

export default function Products() {
  const { store } = useContext(MyContext);

  // Memoizar categorías ordenadas
  const sortedCategories = useMemo(() => {
    if (!store?.categorias || !store?.products) return [];
    return ExtraerCategorias(store.categorias, store.products).sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
  }, [store?.categorias, store?.products]);

  return (
    <div className="bg-[var(--background-dark)] mt-5">
      {sortedCategories.map((categoria) => (
        <CategoryItem key={categoria.id} categoria={categoria} store={store} />
      ))}
    </div>
  );
}

interface CategoryItemProps {
  categoria: Categoria;
  store: AppState;
}

const CategoryItem = React.memo(function CategoryItem({
  categoria,
  store,
}: CategoryItemProps) {
  const router = useRouter();

  // Memoizar productos filtrados
  const categoryProducts = useMemo(
    () =>
      store?.products?.filter((p: Product) => p.caja === categoria.id) || [],
    [store?.products, categoria.id]
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
    <div className="p-2 mb-2">
      <div className="rounded-lg">
        <div className="pb-2">
          <Link
            className="text-sm uppercase font-cinzel text-center text-slate-700 tracking-widest truncate flex items-center"
            href={`/t/${store?.sitioweb}/category/${categoria.id}`}
          >
            {categoria.name}
          </Link>
        </div>

        <Link
          href={`/t/${store?.sitioweb}/category/${categoria.id}`}
          className="flex items-center justify-center"
        >
          <Image
            width={250}
            height={250}
            placeholder="blur"
            blurDataURL={categoryImage}
            alt={categoria.name || "Categoría"}
            className="aspect-square object-cover rounded-lg"
            src={categoryImage}
          />
        </Link>

        <div className="p-2 flex flex-col justify-evenly">
          {!store?.edit?.minimalista && categoria.description && (
            <p className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2 whitespace-pre-line">
              {categoria.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <p className="font-medium w-full text-10 text-slate-700">
              {productsCount} Productos
            </p>
            <div className="relative h-9 w-full flex justify-end items-center">
              <Button
                size="icon"
                type="button"
                className="size-8 flex justify-center items-center rounded-full"
                onClick={onNavigate}
                aria-label={`Ver productos de ${categoria.name}`}
              >
                <FaArrowRight className="size-4" />
              </Button>
            </div>
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
}

const AnimatedCategorySection = React.memo(function AnimatedCategorySection({
  categoria,
  banner,
  products,
}: AnimatedCategorySectionProps) {
  const { store } = useContext(MyContext);

  // Memoizar productos ordenados
  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [products]
  );

  const gridClass = useMemo(
    () =>
      `grid grid-flow-row-dense gap-2 p-2 ${
        store?.edit?.grid ? "grid-cols-2" : "grid-cols-1 "
      }`,
    [store?.edit?.grid]
  );
  console.log(store);
  return (
    <motion.div className="mb-12">
      <motion.div
        className="p-1 sticky top-16 bg-gradient-to-r from-slate-50/80 via-slate-100 to-slate-50/80 z-10"
        variants={headerVariants}
        id={categoria.id}
      >
        <Link
          className="pb-2"
          href={`/t/${store?.sitioweb}/category/${categoria.id}`}
        >
          <span className="text-sm uppercase font-cinzel text-center text-slate-800 tracking-widest  line-clamp-1">
            {categoria.name}
          </span>
        </Link>
      </motion.div>

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
    </motion.div>
  );
});
