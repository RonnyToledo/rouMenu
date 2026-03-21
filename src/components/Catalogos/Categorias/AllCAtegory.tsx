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
      <div className="h-16" />

      <section className="bg-background rounded-xl m-2 p-2 space-y-3">
        <h1 className="font-serif text-2xl font-bold text-center text-foreground px-2">
          Todas las categorías
        </h1>
        <div className="grid gap-2 grid-flow-row-dense">
          {ExtraerCategorias(
            store?.categorias || [],
            store?.products || [],
          ).map((obj: Categoria) => (
            <Link
              key={obj.id}
              className="relative rounded-xl overflow-hidden border border-border bg-secondary/50 hover:bg-secondary transition-colors"
              href={`${pathname}/${obj.id}`}
            >
              <Image
                src={obj?.image || store?.urlPoster || logoApp}
                alt={obj?.name || "Tienda"}
                width={300}
                height={300}
                className="object-cover w-full aspect-video"
              />
              <div className="p-3">
                <h2 className="text-sm font-semibold text-foreground mb-0.5 line-clamp-2">
                  {obj?.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {store.products.filter((prod) => prod.caja === obj.id).length}{" "}
                  Productos
                </p>
                {obj?.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {obj.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
