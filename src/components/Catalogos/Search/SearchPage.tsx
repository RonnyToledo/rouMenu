"use client";
import { Input } from "@/components/ui/input";
import { MyContext } from "@/context/MyContext";
import { Search, X, Clock, Star, TrendingUp } from "lucide-react";
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
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { TbMenuDeep } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { useSheet } from "../General/SheetComponent";
import { useApp } from "@/context/AppContext";
import { FaChevronLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const fuseOptions = {
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState<string>(
    () => searchParams.get("buscar") || "",
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const storageKey = useMemo(
    () => `recent_searches_${store.sitioweb || "global"}`,
    [store.sitioweb],
  );

  const fuse = useMemo(
    () => new Fuse(store.products, fuseOptions),
    [store.products],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      setSuggestions(Array.isArray(arr) ? arr : []);
    } catch {
      setSuggestions([]);
    }
  }, [storageKey]);

  const saveSearch = useCallback(
    (term: string) => {
      const t = term?.trim();
      if (!t) return;
      try {
        const raw = localStorage.getItem(storageKey);
        let arr: string[] = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) arr = [];
        arr = arr.filter((s) => s.toLowerCase() !== t.toLowerCase());
        arr.unshift(t);
        if (arr.length > SUGGESTIONS_LIMIT)
          arr = arr.slice(0, SUGGESTIONS_LIMIT);
        localStorage.setItem(storageKey, JSON.stringify(arr));
        setSuggestions(arr);
      } catch {}
    },
    [storageKey],
  );

  useEffect(() => {
    const currentQuery = searchParams.get("buscar") || "";
    if (search !== currentQuery) {
      const id = setTimeout(() => {
        router.push(
          `/t/${store.sitioweb}/search?buscar=${encodeURIComponent(search)}`,
          { scroll: false },
        );
      }, DEBOUNCE_DELAY);
      return () => clearTimeout(id);
    }
  }, [search, store.sitioweb, router, searchParams]);

  const listSearch = useMemo(() => {
    const trimmed = search.trim();
    if (trimmed && trimmed.length >= MIN_SEARCH_LENGTH) {
      return fuse.search(trimmed).map((r) => r.item);
    }
    const favorites = store.products.filter((p) => p.favorito);
    return (favorites.length > 0 ? favorites : store.products).slice(0, 6);
  }, [search, fuse, store.products]);

  const isShowingFavorites =
    !search.trim() || search.trim().length < MIN_SEARCH_LENGTH;

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

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      setSearch(suggestion);
      saveSearch(suggestion);
      setFocused(false);
    },
    [saveSearch],
  );

  const handleRemoveSuggestion = useCallback(
    (suggestion: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const updated = suggestions.filter((s) => s !== suggestion);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setSuggestions(updated);
      } catch {}
    },
    [suggestions, storageKey],
  );

  const handleClearSuggestions = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setSuggestions([]);
    } catch {}
  }, [storageKey]);

  const handleProductClick = useCallback(() => {
    const t = search.trim();
    if (t) saveSearch(t);
  }, [search, saveSearch]);

  return (
    <main className="scroll-smooth bg-background min-h-screen">
      {/* Search Bar */}
      <header className="sticky top-0 z-50 px-3 pt-3 pb-2 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="relative flex items-center gap-2 h-11">
          {/* Back */}
          <Button
            variant="ghost"
            onClick={smartBack}
            size="icon"
            className="rounded-full w-9 h-9 shrink-0 border border-border"
          >
            <FaChevronLeft className="w-3.5 h-3.5 text-foreground" />
          </Button>

          {/* Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Buscar productos..."
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={handleKeyDown}
              className="w-full h-10 rounded-full pl-9 pr-10 text-sm border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:ring-0 focus:bg-background transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={open}
            className="rounded-full w-9 h-9 shrink-0 border border-border"
          >
            <TbMenuDeep className="w-4 h-4 text-foreground" />
          </Button>
        </div>

        {/* Dropdown sugerencias */}
        <AnimatePresence>
          {focused && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute left-3 right-3 top-full mt-1 bg-background border border-border rounded-2xl shadow-lg overflow-hidden z-50"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    Recientes
                  </span>
                </div>
                <button
                  onClick={handleClearSuggestions}
                  className="text-xs text-primary hover:opacity-75 transition-opacity"
                >
                  Limpiar
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {suggestions.map((sug, i) => (
                  <div
                    key={i}
                    onMouseDown={() => handleSelectSuggestion(sug)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                      <span className="text-sm text-foreground truncate">
                        {sug}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleRemoveSuggestion(sug, e)}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full hover:bg-border flex items-center justify-center transition-all"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="px-3 py-3">
        {/* Encabezado de sección */}
        {isShowingFavorites && (
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Destacados
            </span>
          </div>
        )}

        {/* Lista de productos */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {listSearch.map((product, i) => (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <Link
                  href={`/t/${store.sitioweb}/producto/${product.productId}`}
                  onClick={handleProductClick}
                  className="flex gap-3 p-2.5 rounded-2xl border border-border bg-background hover:bg-secondary transition-colors group"
                >
                  {/* Imagen */}
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-border bg-secondary">
                    <Image
                      width={100}
                      height={100}
                      alt={product.title || ""}
                      src={product.image || store.urlPoster || logoApp}
                      className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-300 ${!product.stock ? "grayscale opacity-60" : ""}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      {product.descripcion && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {product.descripcion}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-foreground">
                        ${smartRound(product.price || 0)}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {store.moneda.find(
                            (m) => m.id === product.default_moneda,
                          )?.nombre || ""}
                        </span>
                      </span>
                      {product.coment.promedio > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-muted-foreground">
                            {product.coment.promedio.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Indicador stock */}
                  {!product.stock && (
                    <div className="shrink-0 flex items-center self-center">
                      <span className="text-[10px] font-medium text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                        Agotado
                      </span>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Estado vacío */}
        {listSearch.length === 0 && search.trim() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-base font-semibold text-foreground mb-1">
              Sin resultados
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              {`No encontramos "${search}". Intenta con otro término.`}
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
