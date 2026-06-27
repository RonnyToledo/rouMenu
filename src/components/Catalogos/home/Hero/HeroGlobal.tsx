import React, { useContext } from "react";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { MyContext } from "@/context/MyContext";

export default function HeroGlobal({ expand = false }: { expand?: boolean }) {
  const { store } = useContext(MyContext);

  return (
    <section className="p-4">
      {/* Poster */}
      <div className="aspect-square w-full overflow-hidden rounded-2xl relative mb-1 shadow-sm">
        <Image
          fill
          src={store.banner || logoApp}
          alt={store.name || ""}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
      </div>

      {/* Headline */}
      <div className="space-y-1">
        <h2
          className={`font-serif ${expand ? "text-4xl" : "text-2xl"} leading-tight text-foreground`}
        >
          {store.name || "Bienvenido"}
        </h2>
        {store.parrrafo && (
          <p
            className={`text-sm text-muted-foreground leading-relaxed ${expand ? "line-clamp-8  max-w-[85%]" : "line-clamp-2  max-w-full"}`}
          >
            {store.parrrafo}
          </p>
        )}
      </div>
    </section>
  );
}
