"use client";
import { Input } from "@/components/ui/input";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/context/InitialStatus";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import { smartRound } from "@/functions/precios";
import Link from "next/link";
import { Star } from "lucide-react";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { TbMenuDeep } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { useSheet } from "../General/SheetComponent";

const options = {
  includeScore: true,
  threshold: 0.4,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["title", "descripcion"],
};

export default function SearchPage() {
  const { open } = useSheet();
  const { store } = useContext(MyContext);
  const [search, setSearch] = useState<string>("");
  const [ListSearch, setListSearch] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // clave por tienda para almacenar búsquedas recientes
  const storageKey = `recent_searches_${store.sitioweb || "global"}`;
  const SUGGESTIONS_LIMIT = 10;

  useEffect(() => {
    // inicializar valor desde query string
    setSearch(searchParams.get("buscar") || "");
  }, [searchParams]);

  useEffect(() => {
    // cuando cambia la búsqueda, actualizamos la URL
    // (tu código original hacía esto en cada cambio; lo mantenemos)
    router.push(
      `/t/${store.sitioweb}/search?buscar=${encodeURIComponent(search)}`
    );
  }, [search, store.sitioweb, router]);

  useEffect(() => {
    // cargar sugerencias desde localStorage al montar o al cambiar de tienda
    try {
      const raw = localStorage.getItem(storageKey);

      const arr: string[] = raw ? JSON.parse(raw) : [];
      setSuggestions(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.warn("No se pudo leer localStorage:", e);
      setSuggestions([]);
    }
  }, [storageKey]);

  useEffect(() => {
    const productos = obtenerMejoresProductos(store.products, 5);
    const fuse = new Fuse(store.products, options);

    if (search) {
      const results = fuse.search(search);
      const filteredResults = results.map((obj) => obj.item);

      setListSearch(filteredResults);
    } else if (suggestions.length > 0) {
      setListSearch(
        suggestions
          .map((arr) => {
            const results = fuse.search(arr);
            return results.map((obj) => obj.item).slice(0, 1);
          })
          .flat()
      );
    } else {
      const filteredProducts = productos.slice(0, 5);
      setListSearch(filteredProducts);
    }
  }, [store.products, search, focused, suggestions]);

  // guarda la búsqueda en localStorage (mantiene orden reciente, sin duplicados)
  const saveSearch = (term: string) => {
    const t = term?.trim();
    if (!t) return;
    try {
      const raw = localStorage.getItem(storageKey);
      let arr: string[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) arr = [];

      // eliminar duplicados (case-insensitive)
      arr = arr.filter((s) => s.toLowerCase() !== t.toLowerCase());
      arr.unshift(t); // más reciente al principio
      if (arr.length > SUGGESTIONS_LIMIT) arr = arr.slice(0, SUGGESTIONS_LIMIT);

      localStorage.setItem(storageKey, JSON.stringify(arr));
      setSuggestions(arr);
    } catch (e) {
      console.warn("Error guardando búsqueda:", e);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const t = search.trim();
      if (!t) return;
      saveSearch(t);
      // router.push ya lo hace el useEffect. Si quieres forzar:
      // router.push(`/t/${store.sitioweb}/search?buscar=${encodeURIComponent(t)}`);
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      inputRef.current?.blur();
      setFocused(false);
    }
  };

  return (
    <main className="">
      {/* Search Bar */}

      <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-50 to-transparent h-16 p-2 w-full">
        <div className="relative flex items-center justify-between shadow-lg rounded-full h-full p-1 gap-3 bg-white overflow-hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
          <Input
            ref={inputRef}
            placeholder="Buscar productos..."
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              // delay para permitir click en sugerencia (porque usamos onMouseDown allí)
              setTimeout(() => setFocused(false), 150);
            }}
            onKeyDown={handleKeyDown}
            className="w-full h-full border-none rounded-xl pl-12 pr-4 py-3 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-0 focus:ring-slate-400 focus:border-transparent transition-all"
          />
          <Button
            className={"p-2 absolute right-4"}
            variant="ghost"
            onClick={open}
          >
            <TbMenuDeep className="size-6 text-slate-600 cursor-pointer" />
          </Button>
        </div>
      </header>
      <div className="container mx-auto px-4">
        {/* Desktop Sidebar + Products Grid */}
        <div className="flex gap-6 ">
          {/* Filters Sidebar (Desktop) */}
          {false ? (
            <aside className="hidden w-64 flex-shrink-0">
              <div className="sticky top-24 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Filtros</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">
                      Precio
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">
                      Calificación
                    </label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
                      <option>Todas</option>
                      <option>4+ estrellas</option>
                      <option>3+ estrellas</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">
                      Categoría
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded bg-slate-700 border-slate-600"
                        />
                        <span>Bebidas</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded bg-slate-700 border-slate-600"
                        />
                        <span>Postres</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded bg-slate-700 border-slate-600"
                        />
                        <span>Comida</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          ) : null}

          {/* Products List */}
          <div className="flex-1">
            <h2 className="text-xl  font-bold text-slate-900 mb-4 ">
              Encuentra tus productos
            </h2>

            <div className="space-y-1 ">
              {ListSearch.map((product) => (
                <Link
                  key={product.id}
                  href={`/t/${store.sitioweb}/producto/${product.productId}`}
                  className="block rounded-xl p-3   transition-all group"
                >
                  <div className="flex gap-3 ">
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-slate-300 rounded-lg overflow-hidden">
                      <Image
                        width={100}
                        height={100}
                        alt={product.title || `Producto ${product.id}`}
                        src={product.image || store.urlPoster || logoApp}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-salte-900 font-semibold text-base mb-1 group-hover:text-slate-800 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-slate-600 text-xs mb-2 line-clamp-1">
                        {product.descripcion || "..."}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-700 font-bold text-base">
                          ${smartRound(product.price || 0)}{" "}
                          {store.moneda.find(
                            (m) => m.id == product.default_moneda
                          )?.nombre || ""}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star
                            className={`w-4 h-4 fill-slate-400 text-slate-400`}
                          />
                          <span
                            className={`text-sm font-medium text-slate-500`}
                          >
                            {product.coment.promedio.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {ListSearch.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-slate-800 font-semibold text-lg mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-slate-600 text-sm">
                  Intenta con otros términos de búsqueda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
/**
 * Devuelve los N mejores productos ordenados por visitas/día
 */
function obtenerMejoresProductos(productos: Product[], limit: number) {
  const ahoraMs = Date.now();
  return productos
    .map((p) => {
      const creadoMs = new Date(p.creado).getTime();
      const dias = (ahoraMs - creadoMs) / (1000 * 60 * 60 * 24) || 1;
      const visitasPorDia = p.visitas / dias;
      return { ...p, visitasPorDia } as Product & { visitasPorDia: number };
    })
    .sort((a, b) => b.visitasPorDia - a.visitasPorDia)
    .slice(0, limit);
}
