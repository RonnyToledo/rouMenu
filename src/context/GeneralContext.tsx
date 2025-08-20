"use client";
// MyContextProvider.tsx
import React, { ReactNode, useState, createContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

type Hero = {
  UUID: string;
  image: string;
  title: string;
  visitas: number;
  sitioweb: string;
  description: string;
};

type Catalog = {
  UUID?: string;
  name: string;
  image: string | null;
  visitas?: number;
  avg_star?: number;
  sitioweb: string;
  provincia: string;
};

type Product = {
  image: string;
  price: number;
  title: string;
  avg_star?: number;
  oldPrice?: number;
  productId?: string;
  score: number;
  visitas: number;
  sitioweb: string;
  site_uuid: string;
  category_id: string;
  cnt_comments?: number;
  category_name: string;
};
type TopPost = {
  image: string;
  price: number;
  score: number;
  title: string;
  avg_star: number;
  oldPrice: number;
  productId: string;
  store_logo: string;
  store_name: string;
  store_uuid: string;
  category_id: string;
  cnt_comments: number;
  category_name: string;
  store_sitioweb: string;
  product_visitas: number;
  product_created_at: string;
};
type TopSites = {
  UUID: string;
  name: string;
  image: string;
  visitas: string;
};
type Top_provinces = {
  provincia: string;
  top_sites: TopSites[];
  sitios_count: number;
  total_visitas: number;
};

type PopularCatalogs = {
  id: string;
  name: string;
  image: string;
  visitas: number;
  cat_score?: number;
  avg_product_star?: number;
};
type CatalogsYouMightLike = {
  image: string;
  visitas: number;
  store_id: string;
  category_id: string;
  category_name: string;
  store_sitioweb: string;
};

interface AppState {
  hero: Hero[];
  catalogs: Catalog[];
  products: Product[];
  featured_catalogs: PopularCatalogs[];
  catalogsYouMightLike: CatalogsYouMightLike[];
  popularCatalogs: PopularCatalogs[];
  top_posts: TopPost[];
  top_provinces: Top_provinces[];
}

const data = {
  hero: [],
  catalogs: [],
  products: [],
  featured_catalogs: [],
  catalogsYouMightLike: [],
  popularCatalogs: [],
  top_posts: [],
  top_provinces: [],
};

interface ContextType {
  generalData: AppState;
  setGeneralData: React.Dispatch<React.SetStateAction<AppState>>;
}

export const MyGeneralContext = createContext<ContextType>({
  generalData: data,
  setGeneralData: () => null,
});

interface MyProviderProps {
  children: ReactNode;
  storeSSD: AppState;
}
export default function GeneralProvider({
  children,
  storeSSD,
}: MyProviderProps) {
  const [generalData, setGeneralData] = useState(storeSSD ?? data);
  const pathname = usePathname();

  return (
    <MyGeneralContext.Provider value={{ generalData, setGeneralData }}>
      {/* Animación simple entre páginas dentro del mismo layout */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </MyGeneralContext.Provider>
  );
}
