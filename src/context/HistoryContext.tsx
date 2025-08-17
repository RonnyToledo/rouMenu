"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

type HistoryEntry = {
  path: string;
  shop?: string;
};

type HistoryContextValue = {
  record: HistoryEntry[];
  smartBack: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const params = useParams();

  const [record, setRecord] = useState<HistoryEntry[]>([]);
  const prevPathRef = useRef<string | null>(null);

  // Guardar ruta + shop
  useEffect(() => {
    if (prevPathRef.current !== path) {
      setRecord((h) => [
        ...h,
        {
          path: path!,
          shop: params.shop as string | undefined,
        },
      ]);
      prevPathRef.current = path!;
    }
  }, [path, params.shop]);

  const smartBack = () => {
    // Buscar la última ruta válida
    for (let i = record.length - 2; i >= 0; i--) {
      const candidate = record[i];
      if (!/^\/t\/[^/]+\/producto\/[^/]+/.test(candidate.path)) {
        router.push(candidate.path);
        return;
      }
    }
    // Si no hay ninguna válida, usar el último shop registrado
    const lastShop = record.at(-1)?.shop;
    if (lastShop) {
      router.push(`/t/${lastShop}`);
    } else {
      router.push("/");
    }
  };

  return (
    <HistoryContext.Provider value={{ record, smartBack }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be inside HistoryProvider");
  return ctx;
}
