"use client";

import React, { useContext, useMemo, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { MyContext } from "@/context/MyContext";
import {
  deduplicateProductsByProductId,
  getCategoriesWithProducts,
  getUncategorizedProducts,
} from "@/lib/catalog/categorySelectors";
import { logoApp } from "@/lib/image";
import { AppState, Categoria, Product } from "@/types/InitialStatus";
import { Button } from "@/components/ui/button";
import ProductGrid from "./Product-Grid";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { ScrollTo } from "@/functions/ScrollTo";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────────────────── */
/* HOOK: Detect active section (scroll spy) */
/* ───────────────────────────────────────────────────────────── */

function useActiveSection(sectionIds: string[], offset = 140) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (!sectionIds.length) return;

    let raf = 0;

    const updateActive = () => {
      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const sections = sectionIds
          .map((id) => document.getElementById(id))
          .filter(Boolean) as HTMLElement[];

        if (!sections.length) return;

        const scrollPos = window.scrollY + offset;

        let current = sections[0];

        for (const section of sections) {
          if (section.offsetTop <= scrollPos) {
            current = section;
          } else {
            break;
          }
        }

        if (current?.id && current.id !== activeId) {
          setActiveId(current.id);
        }
      });
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      cancelAnimationFrame(raf);
    };
  }, [sectionIds, offset, activeId]);

  return activeId;
}

/* ───────────────────────────────────────────────────────────── */
/* COMPONENT: Sticky Category Bar */
/* ───────────────────────────────────────────────────────────── */

function CategoryStickyBar({
  categories,
  activeId,
}: {
  categories: Categoria[];
  activeId: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const activeChip = chipRefs.current[activeId];
    if (!activeChip) return;

    activeChip.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId]);

  const scroll = (dir: "left" | "right") => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  return (
    <div className="sticky top-12 z-50 bg-white/90 backdrop-blur-md border-b shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div className="relative flex items-center gap-2 px-1 py-2">
        {/* Fade izquierdo */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12 z-10 bg-linear-to-r from-white to-transparent" />

        {/* Botón izquierdo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className="absolute left-0 z-20 rounded-full"
        >
          <MdNavigateBefore />
        </Button>

        {/* Lista */}
        <div
          ref={listRef}
          className="flex gap-2 overflow-x-auto no-scrollbar flex-1 px-12"
        >
          {categories.map((cat) => {
            const active = cat.id === activeId;
            return (
              <Button
                key={cat.id}
                ref={(el) => {
                  chipRefs.current[cat.id] = el;
                }}
                onClick={() => ScrollTo(cat.id, 90)}
                variant="outline"
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all",
                  "shrink-0 whitespace-nowrap",
                  "max-w-[60vw] md:max-w-55",
                  active
                    ? "text-primary border-primary bg-primary/5"
                    : "text-black/70 border-black/10 hover:bg-black/5",
                )}
              >
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Fade derecho */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10 bg-linear-to-l from-white to-transparent" />

        {/* Botón derecho */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="absolute right-0 z-20 rounded-full"
        >
          <MdNavigateNext />
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* MAIN COMPONENT */
/* ───────────────────────────────────────────────────────────── */

export default function Products() {
  const { store } = useContext(MyContext);
  const categories = store.categorias;
  const products = store.products;

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
    170, // ajusta según la altura real del sticky header
  );

  return (
    <div className="mt-2" id="products">
      {/* 🔥 Sticky dinámico */}
      <CategoryStickyBar
        categories={sortedCategories}
        activeId={activeCategoryId}
      />

      {sortedCategories.map((categoria) => (
        <CategoryItem key={categoria.id} categoria={categoria} store={store} />
      ))}

      {/* Tags fallback */}
      <div className="flex flex-wrap gap-2 mb-8 px-2">
        {categories.map((tag) => (
          <Link
            href={`#${tag.id}`}
            key={tag.id}
            className="text-xs px-3 py-1.5 rounded-full bg-black/5 border border-black/10"
          >
            {tag.name}
          </Link>
        ))}
      </div>

      {uncategorizedProducts.length > 0 && (
        <UncategorizedSection
          products={uncategorizedProducts}
          banner={store?.urlPoster || logoApp}
        />
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* CATEGORY ITEM */
/* ───────────────────────────────────────────────────────────── */

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

      <div className="grid grid-cols-2 gap-2 px-2">
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

/* ───────────────────────────────────────────────────────────── */
/* UNCATEGORIZED */
/* ───────────────────────────────────────────────────────────── */

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

      <div className="grid grid-cols-2 gap-2 px-2">
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
