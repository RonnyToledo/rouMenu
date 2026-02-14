"use client";
import Image from "next/image";
import { useContext } from "react";
import { MyContext } from "@/context/MyContext";
import Link from "next/link";
import { Categoria } from "@/context/InitialStatus";

import { usePathname } from "next/navigation";
import { logoApp } from "@/lib/image";
import { ExtraerCategorias } from "@/functions/extraerCategoriass";

export default function AllCategoryShowcase() {
  const { store } = useContext(MyContext);
  const pathname = usePathname();

  return (
    <div>
      {/* Hero Section */}
      <div className="h-16"></div>

      {/* Products Section */}
      <section className="bg-white rounded-xl m-2 p-2">
        <h1 className="bg-white z-1 text-2xl text-center font-bold mb-2 line-clamp-2 p-2">
          Todas las categorías
        </h1>
        <div className="grid gap-1 grid-flow-row-dense">
          {ExtraerCategorias(
            store?.categorias || [],
            store?.products || []
          ).map((obj: Categoria) => (
            <Link
              key={obj.id}
              className="relative  rounded-xl overflow-hidden bg-white"
              href={`${pathname}/${obj.id}`}
            >
              <Image
                src={obj?.image || store?.urlPoster || logoApp}
                alt={obj?.name || "Tienda"}
                width={300}
                height={300}
                className="object-cover w-full aspect-video"
              />
              <div>
                <div className="flex flex-col justify-between items-start text-center p-3">
                  <h1 className="text-base text-start font-bold mb-1 line-clamp-2">
                    {obj?.name}
                  </h1>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {
                      store.products.filter((prod) => prod.caja === obj.id)
                        .length
                    }{" "}
                    Productos
                  </p>
                </div>
                <p className="text-xl max-w-lg line-clamp-3">
                  {obj?.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
