"use client";
import Image from "next/image";
import { useContext, useEffect } from "react";
import { MyContext } from "@/context/MyContext";
import { notFound } from "next/navigation";
import { logoApp } from "@/lib/image";
import ProductGrid from "../home/ProductUI/Product-Grid";
import { FaBookmark } from "react-icons/fa";

interface Props {
  categoria: string | number;
}

export default function Category({ categoria }: Props) {
  const { store } = useContext(MyContext);
  const finCategory = store?.categorias?.find((obj) => obj.id === categoria);

  useEffect(() => {
    if (!finCategory && store?.categorias && store?.categorias.length > 0) {
      notFound();
    }
  }, [categoria, finCategory, store?.categorias]);

  return (
    <div>
      <section className="space-y-6">
        <div className="relative">
          <Image
            width={250}
            height={250}
            placeholder="blur"
            blurDataURL={finCategory?.image || store?.urlPoster || logoApp}
            alt={finCategory?.name || "Categoria"}
            className={`${"w-full h-72"} object-cover rounded-b-3xl`}
            src={finCategory?.image || store?.urlPoster || logoApp}
          />
          <div className="">
            <h1 className="absolute  left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold p-3 text-center bg-white/40 w-1/2 truncate rounded-full backdrop-blur-lg">
              {finCategory?.name}
            </h1>
          </div>
        </div>

        <div className="px-4 py-2 flex flex-col gap-1 ">
          {!store?.edit?.minimalista && finCategory?.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-line">
              {finCategory.description}
            </p>
          )}
          <div className="flex items-center gap-2">
            <FaBookmark className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {
                store?.products.filter((obj) => obj.caja == finCategory?.id)
                  .length
              }{" "}
              Productos
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background rounded-xl p-2">
        <div className="grid grid-cols-2 gap-2 grid-flow-row-dense">
          {store?.products
            .filter((obj) => obj.caja == categoria)
            .sort((a, b) => {
              const pa = a?.coment?.promedio;
              const pb = b?.coment?.promedio;
              return pa === pb
                ? Number(a?.order ?? 0) - Number(b?.order ?? 0)
                : pb - pa;
            })
            .map((product, index) => (
              <ProductGrid
                product={product}
                key={index}
                i={index}
                banner={store?.urlPoster || logoApp}
              />
            ))}
        </div>
      </section>
    </div>
  );
}
