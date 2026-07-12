"use client";
import React, { useContext, useMemo } from "react";
import { MyContext } from "@/context/MyContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";

const prevRuta = [
  { url: "", name: "Inicio" },
  { url: "/about", name: "Acerca de" },
  { url: "/category", name: "Categorías" },
  { url: "/search", name: "Buscar" },
  { url: "/comparar", name: "Comparar" },
];

export default function Footer() {
  const { store } = useContext(MyContext);
  const pathname = usePathname();

  const ruta = useMemo(() => {
    if (!store?.sitioweb) return prevRuta;
    const startRuta = `/t/${store?.sitioweb}`;
    return prevRuta.map((obj) => ({ ...obj, url: startRuta.concat(obj.url) }));
  }, [store?.sitioweb]);

  return (
    <div>
      <div className="text-center">
        <h3 className="font-serif text-xl text-white tracking-wider">
          {store?.name}
        </h3>
        <p className="text-xs text-white/80 mt-1.5 line-clamp-4 leading-relaxed">
          {store?.parrrafo || "..."}
        </p>
      </div>

      <div className="flex flex-col items-start mt-4 space-y-1.5">
        <div className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">
          Otras rutas
        </div>
        {ruta
          .filter((item) => pathname !== item.url)
          .map((obj, index) => (
            <Link
              href={obj.url}
              key={index}
              className="text-white/80 hover:text-white transition-colors text-xs"
            >
              {obj.name}
            </Link>
          ))}
      </div>

      <Separator className="my-3 bg-white/20" />
    </div>
  );
}
