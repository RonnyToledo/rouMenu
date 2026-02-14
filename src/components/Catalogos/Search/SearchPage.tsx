"use client";
import { Input } from "@/components/ui/input";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/context/InitialStatus";
import { Search, X, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import Fuse from "fuse.js";
import { smartRound } from "@/functions/precios";
import Link from "next/link";
import { Star } from "lucide-react";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { TbMenuDeep } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { useSheet } from "../General/SheetComponent";
import { useApp } from "@/context/AppContext";
import { FaChevronLeft } from "react-icons/fa";

const options = {
  includeScore: true,
  threshold: 0.4,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["title", "descripcion"],
};

const SUGGESTIONS_LIMIT = 10;
const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_DELAY = 300;

export default function SearchPage() {
  const { smartBack } = useApp();
  const { open } = useSheet();
  const { store } = useContext(MyContext);

  const [search, setSearch] = useState<string>("");
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Clave por tienda para almacenar búsquedas recientes
  const storageKey = useMemo(
    () => `recent_searches_${store.sitioweb || "global"}`,
    [store.sitioweb],
  );

  // Memoizar Fuse.js para evitar recrearlo en cada render
  const fuse = useMemo(
    () => new Fuse(store.products, options),
    [store.products],
  );

  // Cargar búsquedas recientes desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      setSuggestions(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.warn("No se pudo leer localStorage:", e);
      setSuggestions([]);
    }
  }, [storageKey]);

  // Inicializar valor desde query string solo una vez
  useEffect(() => {
    const querySearch = searchParams.get("buscar") || "";
    if (querySearch) {
      setSearch(querySearch);
    }
  }, [searchParams]);

  // Función para guardar búsqueda (memoizada)
  const saveSearch = useCallback(
    (term: string) => {
      const t = term?.trim();
      if (!t) return;

      try {
        const raw = localStorage.getItem(storageKey);
        let arr: string[] = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) arr = [];

        // Eliminar duplicados (case-insensitive)
        arr = arr.filter((s) => s.toLowerCase() !== t.toLowerCase());
        arr.unshift(t); // Más reciente al principio
        if (arr.length > SUGGESTIONS_LIMIT) {
          arr = arr.slice(0, SUGGESTIONS_LIMIT);
        }

        localStorage.setItem(storageKey, JSON.stringify(arr));
        setSuggestions(arr);
      } catch (e) {
        console.warn("Error guardando búsqueda:", e);
      }
    },
    [storageKey],
  );

  // Actualizar URL con debounce
  useEffect(() => {
    const currentQuery = searchParams.get("buscar") || "";
    if (search !== currentQuery) {
      const timeoutId = setTimeout(() => {
        router.push(
          `/t/${store.sitioweb}/search?buscar=${encodeURIComponent(search)}`,
          { scroll: false },
        );
      }, DEBOUNCE_DELAY);

      return () => clearTimeout(timeoutId);
    }
  }, [search, store.sitioweb, router, searchParams]);

  // Filtrar productos (corregido)
  useEffect(() => {
    const trimmedSearch = search.trim();

    if (trimmedSearch && trimmedSearch.length >= MIN_SEARCH_LENGTH) {
      const results = fuse.search(trimmedSearch);
      const filteredResults = results.map((obj) => obj.item);
      setListSearch(filteredResults);
    } else {
      // Mostrar favoritos cuando no hay búsqueda, o primeros 5 productos si no hay favoritos
      const favoriteProducts = store.products.filter((obj) => obj.favorito);

      if (favoriteProducts.length > 0) {
        setListSearch(favoriteProducts.slice(0, 5));
      } else {
        setListSearch(store.products.slice(0, 5));
      }
    }
  }, [search, fuse, store.products]);

  // Manejar Enter y Escape
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const t = search.trim();
      if (t) {
        saveSearch(t);
        inputRef.current?.blur();
        setFocused(false);
      }
    }
    if (e.key === "Escape") {
      inputRef.current?.blur();
      setFocused(false);
    }
  };

  // Cerrar sugerencias al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (focused) {
        setFocused(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [focused]);

  // Seleccionar sugerencia
  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      setSearch(suggestion);
      saveSearch(suggestion);
      setFocused(false);
    },
    [saveSearch],
  );

  // Eliminar sugerencia individual
  const handleRemoveSuggestion = useCallback(
    (suggestion: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const updated = suggestions.filter((s) => s !== suggestion);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setSuggestions(updated);
      } catch (e) {
        console.warn("Error eliminando sugerencia:", e);
      }
    },
    [suggestions, storageKey],
  );

  // Limpiar todas las sugerencias
  const handleClearSuggestions = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setSuggestions([]);
    } catch (e) {
      console.warn("Error limpiando sugerencias:", e);
    }
  }, [storageKey]);

  // Guardar búsqueda al hacer clic en un producto
  const handleProductClick = useCallback(() => {
    const t = search.trim();
    if (t) {
      saveSearch(t);
    }
  }, [search, saveSearch]);

  return (
    <main className="scroll-smooth">
      {/* Search Bar */}
      <header className="sticky top-0 z-50 bg-linear-to-b from-slate-50 to-transparent h-16 p-2 w-full">
        <div className="relative flex items-center justify-between shadow-lg rounded-full h-full p-1 gap-3 bg-white overflow-hidden">
          <Button
            variant="ghost"
            onClick={smartBack}
            size="sm"
            className="w-fit text-slate-700 absolute left-2 z-10"
          >
            <FaChevronLeft className="size-6" />
          </Button>

          <Input
            ref={inputRef}
            placeholder="Buscar productos..."
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setTimeout(() => setFocused(false), 150);
            }}
            onKeyDown={handleKeyDown}
            className="w-full h-full border-none rounded-xl pl-12 pr-16 py-3 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-0 focus:ring-slate-400 focus:border-transparent transition-all"
          />

          <Button
            className="p-2 absolute right-4 z-10"
            variant="ghost"
            onClick={open}
          >
            <TbMenuDeep className="size-6 text-slate-600 cursor-pointer" />
          </Button>
        </div>

        {/* Dropdown de Sugerencias */}
        {focused && suggestions.length > 0 && (
          <div className="absolute top-full left-2 right-2 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
              <span className="text-xs font-medium text-slate-500">
                Búsquedas recientes
              </span>
              <button
                onClick={handleClearSuggestions}
                className="text-xs text-slate-600 hover:text-slate-900 transition-colors"
              >
                Limpiar todo
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto scroll-smooth">
              {suggestions.map((sug, index) => (
                <div
                  key={index}
                  onMouseDown={() => handleSelectSuggestion(sug)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 truncate">
                      {sug}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleRemoveSuggestion(sug, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Products List */}
          <div className="flex-1">
            <div className="space-y-2">
              {listSearch.map((product) => (
                <Link
                  key={product.id}
                  href={`/t/${store.sitioweb}/producto/${product.productId}`}
                  onClick={handleProductClick}
                  className="block p-3 transition-all group shadow-md rounded-lg hover:shadow-lg"
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-20 h-20 shrink-0 bg-slate-300 rounded-lg overflow-hidden">
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
                      <h3 className="text-slate-900 font-semibold text-base mb-1 group-hover:text-slate-800 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-slate-600 text-xs mb-2 line-clamp-1">
                        {product.descripcion || "Sin descripción"}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-700 font-bold text-base">
                          ${smartRound(product.price || 0)}{" "}
                          {store.moneda.find(
                            (m) => m.id === product.default_moneda,
                          )?.nombre || ""}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium text-slate-700">
                            {product.coment.promedio.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {listSearch.length === 0 && search.trim() && (
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
