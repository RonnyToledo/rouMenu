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
    <main className="p-4">
      <div className="sticky top-12">
        <div className="relative mb-6 p-4 bg-white">
          <Input
            ref={inputRef}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-full text-[var(--text-dark)] placeholder-text-muted font-cinzel"
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
          />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Search />
          </span>
        </div>
      </div>

      <div>
        {ListSearch.length > 0 ? (
          <>
            <div className="text-center mb-8">
              <p className="text-lg text-[var(--text-muted)]">
                {suggestions.length > 0
                  ? "Busquedas recientes"
                  : "Encuentra tus productos"}
              </p>
            </div>
            <div id="search-results">
              {ListSearch.slice(0, 10).map((product) => (
                <Link
                  key={product.id}
                  className="bg-white rounded-lg h-28 shadow-sm overflow-hidden mb-2 flex items-center transition-transform duration-300 hover:scale-105"
                  href={`/t/${store.sitioweb}/producto/${product.productId}`}
                  onClick={() => saveSearch(product.title)}
                >
                  <Image
                    width={100}
                    height={100}
                    alt={product.title || `Producto ${product.id}`}
                    src={product.image || store.urlPoster || logoApp}
                    className="h-full object-cover rounded-l-lg"
                  />
                  <div className="p-3 flex-grow">
                    <h4 className="font-bold font-cinzel text-[var(--text-dark)] text-base  line-clamp-1">
                      {product.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1  whitespace-pre-line">
                      {product.descripcion || "..."}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-[var(--text-dark)] mt-2">
                        ${smartRound(product.price || 0)}{" "}
                        {store.moneda_default?.moneda}
                      </p>
                      <div>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {product.coment.promedio.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10" id="no-results">
            <p className="mt-4 text-xl font-cinzel text-[var(--text-dark)]">
              No se encontraron resultados
            </p>
            <p className="text-[var(--text-muted)]">
              Intenta con otra palabra clave.
            </p>
          </div>
        )}
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
