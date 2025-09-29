"use client";
import React, { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import { logoApp } from "@/lib/image";
import { MdDeliveryDining } from "react-icons/md";
import { FaShop } from "react-icons/fa6";
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
            className="w-full aspect-square object-cover"
          />
        </div>
      </div>

      <div className="space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="w-4 h-4 fill-current text-gray-700" />
          <span className="font-medium text-gray-900">
            {store?.comentTienda.promedio.toFixed(1)}
          </span>
          <span>({store?.comentTienda.total} reseñas)</span>
          <span className="text-gray-300">•</span>
          <span>$ {store?.moneda_default?.moneda}</span>
        </div>
        {/* Location */}
        <Link
          className="inline-flex gap-2 items-center bg-[var(--background-dark)] text-[var(--text-gold)] text-sm font-semibold py-2 px-4 rounded-full border border-[var(--border-gold)]"
          href={`/t/${store?.sitioweb}/about#ubicacion`}
        >
          <MapPin className="size-3.5" />
          {store?.municipio}, {store?.Provincia}
        </Link>

        {/* Description */}
        <div>
          <p className="text-gray-600 leading-relaxed text-sm line-clamp-2">
            {store?.parrrafo || "Store?..."}
          </p>
        </div>
        <div className="flex items-center justify-start gap-2">
          {store.domicilio && (
            <div className="inline-flex gap-4 items-center px-4 bg-[var(--background-dark)] text-[var(--text-gold)] text-sm font-semibold py-1 rounded-full border border-[var(--border-gold)]">
              <MdDeliveryDining className="size-5" />
              <div>
                <h5 className="text-gray-600 text-[10px]">Entrega</h5>
                <h2 className="text-gray-800 text-sm">Delivery</h2>
              </div>
            </div>
          )}
          {store.local && (
            <div className="inline-flex gap-4 items-center px-4 bg-[var(--background-dark)] text-[var(--text-gold)] text-sm font-semibold py-1 rounded-full border border-[var(--border-gold)]">
              <FaShop className="size-5" />
              <div>
                <h5 className="text-gray-600 text-[10px]">Entrega</h5>
                <h2 className="text-gray-800 text-sm">Tienda</h2>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
