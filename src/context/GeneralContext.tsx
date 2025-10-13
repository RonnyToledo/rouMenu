"use client";
import React, {
  ReactNode,
  useState,
  createContext,
  useEffect,
  useContext,
} from "react";
import { usePathname } from "next/navigation";
import { logoApp } from "@/lib/image";
import { AuthContext } from "@/context/AuthContext";
import LoginPopover from "@/components/GeneralComponents/LoginPopover"; // <-- import del popover

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
  const { user, loading } = useContext(AuthContext);
  const [generalData, setGeneralData] = useState(storeSSD ?? data);
  const pathname = usePathname();
  // Estado para controlar el LoginPopover
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    // Si la URL tiene hash no hacemos scroll
    if (typeof window !== "undefined" && window.location.hash) {
      const el = document.getElementById(window.location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  // Abrir el popover la primera vez que el usuario entra si no hay user
  useEffect(() => {
    // solo en cliente
    if (typeof window === "undefined") return;

    // Si ya hay usuario, aseguramos que el popover esté cerrado y marcamos como mostrado
    if (user && !loading) {
      setIsLoginOpen(false);

      return;
    }

    // Si no hay usuario, solo abrir si no se ha mostrado antes
    try {
      setIsLoginOpen(true);
    } catch (e) {
      // Si localStorage falla, aún abrimos para no bloquear la UX
      console.error("Error accediendo a localStorage", e);
      setIsLoginOpen(true);
    }
  }, [user]);

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  return (
    <MyGeneralContext.Provider value={{ generalData, setGeneralData }}>
      <LoginPopover
        isOpen={isLoginOpen}
        onClose={handleCloseLogin}
        redirectTo={pathname ?? "/"}
      />
      <main>{children}</main>
    </MyGeneralContext.Provider>
  );
}
