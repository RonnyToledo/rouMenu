"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useContext } from "react";
import { MapPin, Star, Eye, MessageCircle, Truck } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import { Current } from "@/types/InitialStatus";

export default function StoreHero() {
  const { store } = useContext(MyContext);

  const monedaDefecto = store?.moneda?.find((m: Current) => m.defecto);

  const deliveryZones = (store?.envios || []).length;

  return (
    <div className="bg-background">
      {/* Hero Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-b-3xl">
        <Image
          src={store?.banner || ""}
          alt={store?.name || "Store"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

        {/* Overlay de nombre */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-12 pointer-events-none">
          <p className="text-white/60 text-[10px] font-medium tracking-widest uppercase mb-0.5">
            {store?.tipo}
          </p>
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-white leading-tight drop-shadow-sm">
            {store?.name}
          </h1>
        </div>
      </div>

      {/* Info card flotante */}
      <div className="px-4 -mt-6 relative z-10 pb-4">
        <div className="bg-background/85 backdrop-blur-xl border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Fila superior: ubicación + rating */}
          <div className="flex items-center justify-between gap-2 flex-wrap px-4 pt-3 pb-2 border-b border-border">
            <Link
              href={`/t/${store?.sitioweb}/about#ubicacion`}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">
                {store?.municipio}, {store?.Provincia}
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {monedaDefecto?.nombre}
              </span>
              <Link
                href={`/t/${store?.sitioweb}/about/ratings`}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary border border-border hover:bg-muted transition-colors"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-foreground">
                  {store?.comentTienda?.promedio?.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({store?.comentTienda?.total} reseñas)
                </span>
              </Link>
            </div>
          </div>

          {/* Descripción */}
          {store?.parrrafo && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 px-4 py-1 ">
              {store.parrrafo}
            </p>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2  md:grid-cols-5">
            {[
              {
                icon: Eye,
                value: (store?.visitas ?? 0).toLocaleString(),
                label: "Visitas",
              },
              {
                icon: Star,
                value: store?.comentTienda?.promedio?.toFixed(1) ?? "—",
                label: "Valoración",
              },
              {
                icon: MessageCircle,
                value: store?.comentTienda?.total ?? 0,
                label: "Reseñas",
              },

              ...(store.domicilio
                ? [
                    {
                      icon: Truck,
                      value: `${deliveryZones} zona${deliveryZones > 1 ? "s" : ""}`,
                      label: "Delivery",
                    },
                  ]
                : []),
            ]
              .filter(Boolean)
              .map(({ icon: Icon, value, label }) => (
                <div key={label} className="p-3 text-center">
                  <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xl font-light text-foreground">{value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
