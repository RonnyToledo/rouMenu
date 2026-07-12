"use client";

import React, { useContext, useMemo } from "react";
import Link from "next/link";
import { MyContext } from "@/context/MyContext";
import {
  deduplicateProductsByProductId,
  getCategoriesWithProducts,
  getUncategorizedProducts,
} from "@/lib/catalog/categorySelectors";
import { logoApp } from "@/lib/image";
import { AppState, Categoria, Product } from "@/types/InitialStatus";
import ProductGrid from "./Product-Grid";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { useActiveSection } from "@/hooks/useActiveSection";
import { CategoryStickyBar } from "./CategoryStickyBar";

const SCROLL_SPY_OFFSET = 170;

export default function Products() {
  const { store } = useContext(MyContext);
  const categories = store.categorias;
  const products = store.products;

  const { sentinelRef, isStuck } = useStickyHeader();

  const sortedCategories = useMemo(() => {
    if (!categories || !products) return [];
    return getCategoriesWithProducts(categories, products).sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );
  }, [categories, products]);

  const uncategorizedProducts = useMemo(() => {
    if (!categories || !products) return [];
    return getUncategorizedProducts(categories, products);
  }, [categories, products]);

  const activeCategoryId = useActiveSection(
    sortedCategories.map((c) => c.id),
    SCROLL_SPY_OFFSET,
  );

  return (
    <div className="mt-2" id="products">
      {/* sentinel de 1px, no ocupa espacio real */}
      <div ref={sentinelRef} className="h-px" />

      <CategoryStickyBar
        categories={sortedCategories}
        activeId={activeCategoryId}
        isStuck={isStuck}
      />

      {sortedCategories.map((categoria) => (
        <CategoryItem key={categoria.id} categoria={categoria} store={store} />
      ))}

      {uncategorizedProducts.length > 0 && (
        <UncategorizedSection
          products={uncategorizedProducts}
          banner={store?.urlPoster || logoApp}
        />
      )}

      <div className="flex flex-wrap gap-2 mb-8 px-2">
        {categories.map((tag) => (
          <Link
            href={`#${tag.id}`}
            key={tag.id}
            className="text-xs px-3 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CategoryItem({
  categoria,
  store,
}: {
  categoria: Categoria;
  store: AppState;
}) {
  const products = useMemo(
    () =>
      deduplicateProductsByProductId(
        store.products.filter((p) => p.caja === categoria.id),
      ),
    [store.products, categoria.id],
  );

  return (
    <section id={categoria.id} className="scroll-mt-24 mb-12">
      <div className="flex items-center justify-center mx-auto px-2 mb-2">
        <h2 className="text-lg font-semibold uppercase line-clamp-1">
          {categoria.name}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 px-2 grid-flow-dense">
        {products.map((product, i) => (
          <ProductGrid
            key={product.productId}
            product={product}
            banner={store?.urlPoster || logoApp}
            i={i}
          />
        ))}
      </div>
    </section>
  );
}

function UncategorizedSection({
  products,
  banner,
}: {
  products: Product[];
  banner: string;
}) {
  const visibleProducts = useMemo(
    () =>
      deduplicateProductsByProductId(products).sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      ),
    [products],
  );

  return (
    <section id="sin-categoria" className="scroll-mt-24 mb-6">
      <div className="px-4 mb-2">
        <h2 className="text-base font-semibold uppercase">Otros productos</h2>
      </div>

      <div className="grid grid-cols-2 gap-2 px-2 grid-flow-dense">
        {visibleProducts.map((product, i) => (
          <ProductGrid
            key={product.productId}
            product={product}
            banner={banner}
            i={i}
          />
        ))}
      </div>
    </section>
  );
}
