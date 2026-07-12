// SearchBar.tsx
"use client";

import {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { Search, X } from "lucide-react";
import Fuse from "fuse.js";
import { MyContext } from "@/context/MyContext";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/InitialStatus";

const fuseOptions = {
  includeScore: true,
  threshold: 0.4,
  keys: ["title", "descripcion"],
};

const MIN_SEARCH_LENGTH = 2;

interface SearchBarProps {
  onResultsChange?: (results: Product[] | null) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ onResultsChange }, ref) {
    const { store } = useContext(MyContext);
    const [search, setSearch] = useState("");

    const fuse = useMemo(
      () => new Fuse(store.products, fuseOptions),
      [store.products],
    );

    const results = useMemo(() => {
      const t = search.trim();
      if (!t || t.length < MIN_SEARCH_LENGTH) return null;
      return fuse.search(t).map((r) => r.item);
    }, [search, fuse]);

    // Notifica al padre cada vez que cambian los resultados
    useEffect(() => {
      onResultsChange?.(results);
    }, [results, onResultsChange]);

    // Limpia al desmontar (cuando la barra se oculta)
    useEffect(() => {
      return () => onResultsChange?.(null);
    }, [onResultsChange]);

    const handleClear = useCallback(() => setSearch(""), []);

    return (
      <div className="px-4 py-3">
        <div className="relative flex items-center gap-3 rounded-full bg-secondary px-4 h-11">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground pointer-events-none" />
          <input
            ref={ref}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos…"
            aria-label="Buscar productos"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors shrink-0"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);
