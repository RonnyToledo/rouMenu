"use client";
import React, { ReactNode, useState, createContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { logoApp } from "@/lib/image";

export type Hero = {
  UUID?: string;
  image?: string;
  title?: string;
  visitas?: number;
  sitioweb?: string;
  description?: string;
};
type Catalog = {
  banner?: string;
  UUID?: string;
  name?: string;
  image?: string | null;
  visitas?: number;
  avg_star?: number;
  sitioweb?: string;
  provincia?: string;
  post?: string;
  tipo?: string;
};

type Product = {
  image?: string;
  price?: number;
  title?: string;
  avg_star?: number;
  oldPrice?: number;
  productId?: string;
  score?: number;
  visitas?: number;
  sitioweb?: string;
  site_uuid?: string;
  category_id?: string;
  cnt_comments?: number;
  category_name?: string;
};
export type TopPost = {
  image?: string;
  price?: number;
  score?: number;
  title?: string;
  avg_star?: number;
  oldPrice?: number;
  productId?: string;
  store_logo?: string;
  store_name?: string;
  store_uuid?: string;
  category_id?: string;
  cnt_comments?: number;
  category_name?: string;
  store_sitioweb?: string;
  product_visitas?: number;
  product_created_at?: string;
};
type TopSites = {
  UUID?: string;
  name?: string;
  image?: string;
  visitas?: string;
};
export type Top_provinces = {
  provincia?: string;
  top_sites: TopSites[];
  sitios_count?: number;
  total_visitas?: number;
  image?: string;
};

type PopularCatalogs = {
  id?: string;
  name?: string;
  image?: string;
  visitas?: number;
  cat_scored?: number;
  avg_product_star?: number;
};
type CatalogsYouMightLike = {
  image?: string;
  visitas?: number;
  store_id?: string;
  category_id?: string;
  category_name?: string;
  store_sitioweb?: string;
};

export interface AppState {
  hero: Hero[];
  images: string[];
  catalogs: Catalog[];
  products: Product[];
  featured_catalogs: PopularCatalogs[];
  catalogsYouMightLike: CatalogsYouMightLike[];
  popularCatalogs: PopularCatalogs[];
  top_posts: TopPost[];
  top_provinces: Top_provinces[];
  random_title: string;
}

const data = {
  hero: [],
  images: [logoApp, logoApp, logoApp, logoApp, logoApp],
  catalogs: [],
  products: [],
  featured_catalogs: [],
  catalogsYouMightLike: [],
  popularCatalogs: [],
  top_posts: [],
  top_provinces: [],
  random_title: "",
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

  useEffect(() => {
    // Si la URL tiene hash no hacemos scroll
    if (typeof window !== "undefined" && window.location.hash) {
      const el = document.getElementById(window.location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <MyGeneralContext.Provider value={{ generalData, setGeneralData }}>
      <main>{children}</main>
    </MyGeneralContext.Provider>
  );
}
