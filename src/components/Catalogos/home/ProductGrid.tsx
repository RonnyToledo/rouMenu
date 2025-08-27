"use client";
import React, { useContext } from "react";
import { MdNewReleases } from "react-icons/md";
import { TbShoppingCartOff } from "react-icons/tb";
import { smartRound } from "@/functions/precios";
import { motion } from "framer-motion";
import { Product } from "@/context/InitialStatus";
import { cn } from "@/lib/utils";
import { MyContext } from "@/context/MyContext";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ButtonOfCart } from "./ButtonOfCart";

interface ProductGridInterface {
  product: Product;
  banner: string;
  i: number;
}

export default function ProductGrid({
  product,
  banner,
  i,
}: ProductGridInterface) {
  const { store } = useContext(MyContext);
  return (
    <motion.div
      id={product.productId}
      className={`grid  rounded-lg  overflow-hidden shadow-md ${
        store?.edit?.horizontal ? "grid-cols-2" : product.span && "col-span-2"
      }`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
    >
      <Link
        href={`/t/${store?.sitioweb}/producto/${product.productId}`}
        className={`relative `}
      >
        <Image
          width={250}
          height={250}
          placeholder={"blur"}
          blurDataURL={product.image || banner}
          alt={product.title || `Producto ${i}`}
          className={`${
            store?.edit?.square ? "aspect-square" : "w-full h-48"
          } object-cover`}
          src={product.image || banner}
          style={{
            filter: product.agotado ? "grayscale(1)" : "initial",
          }}
        />
        {isNewProduct(product.creado) && (
          <div className="absolute top-2 left-2 backdrop-blur-3xl rounded-full">
            <MdNewReleases className="fill-red-600 shadow-md h-4 w-4" />
          </div>
        )}
      </Link>
      <div className="p-2 flex flex-col justify-evenly">
        <h4
          className={cn(
            "font-cinzel font-bold text-[var(--text-gold)] text-base flex items-center w-full",
            store?.edit?.minimalista
              ? "line-clamp-1 h-6"
              : `line-clamp-2 ${product?.span ? "h-6" : "h-12"}`
          )}
        >
          {product.title}
        </h4>
        {!store?.edit?.minimalista && (
          <p
            className={`text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2 whitespace-pre-line ${
              product.span ? "h-4" : "h-8"
            }`}
          >
            {product.descripcion || "..."}
          </p>
        )}
        <div className={`flex items-center justify-between mt-3`}>
          <p className="font-bold w-full text-[10px] text-[var(--text-light)] ">
            ${smartRound(product.price || 0)} {store?.moneda_default?.moneda}
          </p>
          <div className="relative h-9 w-full flex justify-end items-center">
            {store?.carrito &&
              (product.agotado ? (
                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  className="size-8 flex justify-center items-center rounded-full "
                  disabled
                >
                  <TbShoppingCartOff className="size-4" />
                </Button>
              ) : (
                <ButtonOfCart product={product} />
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
function isNewProduct(date?: string): boolean {
  if (!date) return false;
  const createdAt = new Date(date);
  const diffMs = Date.now() - createdAt.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days <= 7; // < 1 semana
}
