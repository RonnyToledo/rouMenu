"use client";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "@/context/MyContext";
import { Categoria } from "@/context/InitialStatus";
import { notFound } from "next/navigation";
import { logoApp } from "@/lib/image";
import ProductGrid from "../home/ProductGrid";
interface Props {
  categoria: string | number;
}

export default function Category({ categoria }: Props) {
  const { store } = useContext(MyContext);
  const [finCategory, setFinCategory] = useState<Categoria>({
    id: "",
    image: "",
    name: "",
    description: "",
    active: true,
    subtienda: false,
  });

  useEffect(() => {
    if (store?.categorias && store.categorias.length > 0) {
      const newCat = store.categorias.find((obj) => obj.id === categoria);

      if (newCat) {
        setFinCategory(newCat);
      } else {
        notFound();
      }
    }
  }, [categoria, store?.categorias]);

  return (
    <div>
      {/* Hero Section */}
      <section className=" border border-[var(--border-gold)]">
        <Image
          width={250}
          height={250}
          placeholder={"blur"}
          blurDataURL={finCategory.image || store.urlPoster || logoApp}
          alt={finCategory.name || `CAtegoria `}
          className={`${
            store.edit.square ? "aspect-square" : "w-full h-48"
          } object-cover`}
          src={finCategory.image || store.urlPoster || logoApp}
        />
        <div className="p-2 flex flex-col justify-evenly">
          {!store.edit.minimalista && (
            <p
              className={`text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2 whitespace-pre-line `}
            >
              {finCategory.description}
            </p>
          )}
          <div className={`flex items-center justify-between mt-3`}>
            <p className="font-medium w-full text-10 text-gray-700">
              {
                store.products.filter((obj) => obj.caja == finCategory.id)
                  .length
              }{" "}
              Productos
            </p>
            <div className="relative h-9 w-full flex justify-end items-center"></div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-white rounded-xl m-2 p-2">
        <div className="grid grid-cols-2 gap-1 grid-flow-row-dense">
          {store?.products
            .filter((obj) => obj.caja == categoria)
            .sort((a, b) => {
              const pa = a.coment.promedio;
              const pb = b.coment.promedio;
              return pa === pb
                ? Number(a.order ?? 0) - Number(b.order ?? 0)
                : pb - pa;
            })
            .map((product, index) => (
              <ProductGrid
                product={product}
                key={index}
                i={index}
                banner={logoApp}
              />
            ))}
        </div>
      </section>
    </div>
  );
}
