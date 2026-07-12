"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { MyContext } from "@/context/MyContext";
import { ChevronLeft, ChevronRight, Star, MapPin } from "lucide-react";

const AUTOPLAY_MS = 4500;

/* ─── Tipos ──────────────────────────────────────────────────── */

interface HeroSlide {
  id: string;
  type: "store" | "event" | "promo"; // extensible a futuro
  image: string;
  title: string;
  subtitle?: string;
  tag?: string;
}

/* ─── Hook de carrusel ───────────────────────────────────────── */

function useCarousel(count: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const goTo = useCallback(
    (i: number) => setIndex((i + count) % count),
    [count],
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, next, count]);

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    if (delta > 40) prev();
    else if (delta < -40) next();
    touchX.current = null;
    setPaused(false);
  }

  return { index, goTo, next, prev, setPaused, onTouchStart, onTouchEnd };
}

/* ─── Slide: info de la tienda (el único por ahora) ─────────── */

function StoreSlide({
  image,
  name,
  subtitle,
  expand,
}: {
  image: string;
  name: string;
  subtitle?: string;
  expand: boolean;
}) {
  return (
    <div className="relative w-full shrink-0">
      {/* Imagen */}
      <div
        className={`w-full overflow-hidden ${expand ? "aspect-video" : "aspect-square"}`}
      >
        <Image fill src={image} alt={name} className="object-cover" priority />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      {/* Contenido sobre la imagen */}
      <div className="absolute inset-0 flex flex-col justify-end gap-1 p-5">
        <h2
          className={`font-serif leading-tight text-white drop-shadow-sm ${
            expand ? "text-4xl" : "text-2xl"
          }`}
        >
          {name}
        </h2>
        {subtitle && (
          <p
            className={`text-sm text-white/75 leading-relaxed ${
              expand ? "line-clamp-4 max-w-[85%]" : "line-clamp-2"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Componente principal ───────────────────────────────────── */

export default function HeroGlobal({ expand = false }: { expand?: boolean }) {
  const { store } = useContext(MyContext);

  // Construye el array de slides — por ahora solo el de la tienda.
  // En el futuro: [...storeSlide, ...eventos, ...promos]
  const slides: HeroSlide[] = [
    {
      id: "store",
      type: "store",
      image: store.banner || logoApp,
      title: "Bienvenido",
      subtitle: store.history,
    },
  ];

  const count = slides.length;
  const { index, goTo, next, prev, setPaused, onTouchStart, onTouchEnd } =
    useCarousel(count);
  return (
    <section
      className=""
      aria-roledescription="carrusel"
      aria-label="Información de la tienda"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-border shadow-sm"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Track */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${count}: ${slide.title}`}
              aria-hidden={i !== index}
              className="w-full shrink-0"
            >
              {slide.type === "store" && (
                <StoreSlide
                  image={slide.image}
                  name={slide.title}
                  subtitle={slide.subtitle}
                  expand={expand}
                />
              )}
              {/* slide.type === "event" → <EventSlide ... /> */}
              {/* slide.type === "promo" → <PromoSlide ... /> */}
            </div>
          ))}
        </div>

        {/* Controles de navegación — solo visibles con más de 1 slide */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-background/70 p-1.5 text-foreground backdrop-blur transition-colors hover:bg-background sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Siguiente"
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-background/70 p-1.5 text-foreground backdrop-blur transition-colors hover:bg-background sm:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 right-4 flex gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir a la diapositiva ${i + 1}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {/* Info de la tienda */}
      <div className="mt-4 flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-1">
          <h1 className="font-serif text-xl leading-tight text-foreground">
            {store.name}
          </h1>

          {store.comentTienda.total > 0 && (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-sm text-accent">
              <Star className="h-3.5 w-3.5 fill-gray-200 text-primary" />
              <span className="font-medium">{store.comentTienda.promedio}</span>
              <span className="text-xs text-foreground">
                ({store.comentTienda.total})
              </span>
            </div>
          )}
        </div>

        {store.parrrafo && (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {store.parrrafo}
          </p>
        )}

        {(store.municipio || store.Provincia) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span>
              {store.municipio}
              {store.Provincia && store.municipio ? ", " : ""}
              {store.Provincia}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
