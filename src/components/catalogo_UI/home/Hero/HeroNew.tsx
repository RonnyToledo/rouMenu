"use client";
import React, { useContext } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  Truck,
  Store as StoreIcon,
  ChevronRight,
  Phone,
  Clock,
  Package,
} from "lucide-react";
import { MyContext } from "@/context/MyContext";
import { ContactInterface, Current } from "@/types/InitialStatus";
import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogHero() {
  const { store } = useContext(MyContext);

  const s = store;
  if (!s) return <HeroSkeleton />;

  const currencies = s.moneda?.map((m: Current) => m.nombre).join(" · ");
  const waContact = s.contacto?.find((c: ContactInterface) => c.tipo === "wa");

  return (
    <section
      className="relative min-h-130 flex items-end overflow-hidden"
      aria-label="Store hero"
    >
      {/* Cover — usa banner del store */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${s.banner})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,6,4,0.42) 0%, rgba(10,6,4,0.04) 38%, rgba(10,6,4,0.72) 72%, rgba(10,6,4,0.93) 100%)",
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 w-full px-6 pb-10 pt-32">
        <div className="flex flex-col gap-3.5 max-w-2xl">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {[s.tipo, s.country, s.Provincia]
              .filter((tag): tag is string => Boolean(tag))
              .map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium
                 bg-white/15 text-white border border-white/20 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
          </div>

          {/* Nombre */}
          <h1
            className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {s.name}
          </h1>

          {/* Descripción */}
          {s.parrrafo && (
            <p className="text-sm text-white/70 leading-relaxed max-w-xl line-clamp-3">
              {s.parrrafo}
            </p>
          )}

          {/* Badges de info */}
          <div className="flex flex-wrap gap-2">
            {s.municipio && (
              <Pill icon={<MapPin size={13} />}>
                {s.municipio}, {s.Provincia}
              </Pill>
            )}
            {s.domicilio && (
              <Pill icon={<Truck size={13} />}>
                Delivery · {s.envios?.length ?? 0} zona
                {s.envios?.length !== 1 ? "s" : ""}
              </Pill>
            )}
            {s.comentTienda?.total > 0 && (
              <Link href={`/t/${s.sitioweb}/about/ratings`}>
                <Pill icon={<Star size={13} />}>
                  {s.comentTienda.promedio.toFixed(1)} · {s.comentTienda.total}{" "}
                  reseñas
                </Pill>
              </Link>
            )}
            {s.local && (
              <Pill icon={<StoreIcon size={13} />}>Tienda local</Pill>
            )}
          </div>

          {/* Trust meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/55">
            {s.products?.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Package size={13} className="opacity-70" />
                {s.products.length}+ productos
              </span>
            )}
            {s.estadoHorario?.es_24h && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="opacity-70" />
                Abierto 24 h
              </span>
            )}
            {currencies && <span>{currencies}</span>}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white
                         text-foreground text-sm font-semibold hover:scale-[1.03] hover:bg-white/90
                         active:scale-[0.98] transition-all duration-200"
            >
              Ver catálogo <ChevronRight size={15} />
            </a>

            {waContact && (
              <a
                href={waContact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                           bg-white/12 text-white text-sm font-semibold border border-white/25
                           backdrop-blur-sm hover:bg-white/20 hover:scale-[1.03]
                           active:scale-[0.98] transition-all duration-200"
              >
                <Phone size={14} /> Contactar
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Pill helper
function Pill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                     bg-white/12 text-white/90 border border-white/22 backdrop-blur-sm"
    >
      {icon}
      {children}
    </span>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative min-h-[92vh] flex items-end bg-[hsl(var(--background))]">
      <div className="w-full">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-32 md:px-12 flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-16 w-3/4 rounded-lg" />
          <Skeleton className="h-16 w-1/2 rounded-lg" />
          <Skeleton className="h-6 w-2/3 rounded" />
          <Skeleton className="h-5 w-1/3 rounded" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
