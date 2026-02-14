"use client";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "@/context/MyContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
const prevRuta = [
  {
    url: "",
    name: "Inicio",
  },
  {
    url: "/about",
    name: "Acerca de",
  },
  {
    url: "/category",
    name: "Categorias",
  },
  {
    url: "/search",
    name: "Buscar",
  },
  {
    url: "/comparar",
    name: "Comparar",
  },
];
export default function Footer() {
  const { store } = useContext(MyContext);
  const [ruta, setRuta] = useState(prevRuta);
  const pathname = usePathname();
  useEffect(() => {
    if (store?.sitioweb) {
      const startRuta = `/t/${store?.sitioweb}`;
      setRuta(
        prevRuta.map((obj) => ({ ...obj, url: startRuta.concat(obj.url) }))
      );
    }
  }, [store?.sitioweb]);

  return (
    <div>
      <div className="text-center">
        <h3 className="text-2xl font-cinzel text-slate-50 tracking-wider uppercase">
          {store?.name}
        </h3>
        <p className="text-sm text-slate-100 mt-2 line-clamp-5">
          {store?.parrrafo || "..."}
        </p>
      </div>
      {/*Rutas */}
      <div className="flex flex-col items-start mt-4 space-y-2 ">
        <div className="text-slate-50 uppercase text font-cinzel">
          Otras rutas
        </div>
        {ruta
          .filter((item) => pathname !== item.url)
          .map((obj, index) => (
            <Link
              href={obj.url}
              key={index}
              className="flex items-center gap-2 text-slate-100 text-base hover:text-slate-200 transition-all duration-500 hover:scale-105"
            >
              <div className="line-clamp-1 text-sm">{obj.name}</div>
            </Link>
          ))}
      </div>

      <Separator className="my-2" />
    </div>
  );
}
