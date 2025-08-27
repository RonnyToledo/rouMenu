"use client";
import Image from "next/image";
import React, { useContext } from "react";
import Link from "next/link";
import { MyContext } from "@/context/MyContext";
import { ExtraerCategorias } from "@/functions/extraerCategoriass";
import { logoApp } from "@/lib/image";
import { Categoria, Product } from "@/context/InitialStatus";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

import { FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ProductGrid from "./ProductGrid";
/**
 * Variants para animar sección entera:
 * - hidden: desplazada abajo y transparente
 * - visible: en su posición y opaca
 */

/**
 * Variants para animar el header sticky:
 * - normal: escala 1, sin sombra
 * - sticky: escala 0.95, con sombra y fondo más opaco
 */
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
  const router = useRouter();
  return (
    <div className="bg-[var(--background-dark)] mt-5">
      {ExtraerCategorias(store?.categorias, store?.products)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((categoria, index) => (
          <div key={index}>
            {categoria.subtienda ? (
              <div className="p-2 mb-2  bg-white/85">
                <div className="rounded-lg  ">
                  <div className="pb-2 ">
                    <Link
                      className="text-sm uppercase font-cinzel text-center  text-gray-700 tracking-widest  line-clamp-1"
                      href={`/t/${store?.sitioweb}/category/${categoria.id}`}
                    >
                      {categoria.name}
                    </Link>
                  </div>
                  <Link href={`/t/${store?.sitioweb}/category/${categoria.id}`}>
                    <Image
                      width={250}
                      height={250}
                      placeholder={"blur"}
                      blurDataURL={
                        categoria.image || store?.urlPoster || logoApp
                      }
                      alt={categoria.name || `CAtegoria ${index}`}
                      className={`${
                        store?.edit?.square ? "aspect-square" : "w-full h-48"
                      } object-cover`}
                      src={categoria.image || store?.urlPoster || logoApp}
                    />
                  </Link>
                  <div className="p-2 flex flex-col justify-evenly">
                    {!store?.edit?.minimalista && (
                      <p
                        className={`text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2 whitespace-pre-line `}
                      >
                        {categoria.description}
                      </p>
                    )}
                    <div className={`flex items-center justify-between mt-3`}>
                      <p className="font-medium w-full text-10 text-gray-700">
                        {
                          store?.products.filter(
                            (obj) => obj.caja == categoria.id
                          ).length
                        }{" "}
                        Productos
                      </p>
                      <div className="relative h-9 w-full flex justify-end items-center">
                        <Button
                          size="icon"
                          type="button"
                          className="size-8 flex justify-center items-center rounded-full "
                          onClick={() =>
                            router.push(
                              `/t/${store?.sitioweb}/category/${categoria.id}`
                            )
                          }
                        >
                          <FaArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <AnimatedCategorySection
                categoria={categoria}
                banner={store?.urlPoster || logoApp}
                products={store?.products.filter(
                  (p) => p.caja === categoria.id
                )}
              />
            )}
          </div>
        ))}
    </div>
  );
}

function AnimatedCategorySection({
  categoria,
  banner,
  products,
}: {
  categoria: Categoria;
  banner: string;
  products: Product[];
}) {
  const { store } = useContext(MyContext);

  return (
    <motion.div className="mb-12">
      <motion.div
        className="p-1 sticky top-12 bg-white/85 z-10"
        variants={headerVariants}
        id={categoria.id}
      >
        <Link
          className="text-sm uppercase font-cinzel text-center text-[var(--text-gold)] tracking-widest pb-2 line-clamp-1"
          href={`/t/${store?.sitioweb}/category/${categoria.id}`}
        >
          {categoria.name}
        </Link>
      </motion.div>

      <div
        className={`grid  grid-flow-row-dense gap-2 p-2 ${
          store?.edit?.grid === 1 ? "grid-cols-1" : "grid-cols-2"
        }`}
      >
        {products
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((product, i) => (
            <ProductGrid product={product} key={i} banner={banner} i={i} />
          ))}
      </div>
    </motion.div>
  );
}
