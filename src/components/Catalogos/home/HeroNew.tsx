"use client";
import React, { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import { logoApp } from "@/lib/image";

export default function HeroNew({}) {
  const { store } = useContext(MyContext);
  console.log(store);

  return (
    <div className="p-3 space-y-3">
      <div className="">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={store?.banner || logoApp}
            alt={store?.name || "Store"}
            width={400}
            height={500}
            className="w-full h-80 object-cover"
          />
        </div>
      </div>

      <div className="space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="w-4 h-4 fill-current text-amber-400" />
          <span className="font-medium text-gray-900">
            {store?.comentTienda.promedio.toFixed(1)}
          </span>
          <span>({store?.comentTienda.total} reseñas)</span>
          <span className="text-gray-300">•</span>
          <span>$ {store?.moneda_default?.moneda}</span>
        </div>

        {/* Description */}
        <div>
          <p className="text-gray-600 leading-relaxed text-sm line-clamp-2">
            {store?.parrrafo || "Store?..."}
          </p>
        </div>

        {/* Location */}
        <Link
          className="inline-flex gap-2 items-center bg-[var(--background-dark)] text-[var(--text-gold)] text-sm font-semibold py-2 px-4 rounded-full border border-[var(--border-gold)]"
          href={`/t/${store?.sitioweb}/about#ubicacion`}
        >
          <MapPin className="size-3.5" />
          {store?.municipio}, {store?.Provincia}
        </Link>
      </div>
    </div>
  );
}
