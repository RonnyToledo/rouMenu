"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { logoApp } from "@/lib/image";
import LoginPopover from "@/components/GeneralComponents/LoginPopover";

// ============== TIPOS ==============

// Auth Types
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  requireAuth: (message?: string) => Promise<boolean>;
  openLoginPopover: (message?: string) => void;
  closeLoginPopover: () => void;
}

// General Types
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
  sitioweb: string;
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
  store_sitioweb: string;
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

// History Types
export type HistoryEntry = {
  path: string;
  shop?: string;
};

// ============== CONTEXTO UNIFICADO ==============

interface AppContextType extends AuthContextType {
  // General Data
  generalData: AppState;
  setGeneralData: React.Dispatch<React.SetStateAction<AppState>>;
  // History
  record: HistoryEntry[];
  smartBack: () => void;
}

const defaultGeneralData: AppState = {
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

const AppContext = createContext<AppContextType>({
  // Auth defaults
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  requireAuth: async () => false,
  openLoginPopover: () => {},
  closeLoginPopover: () => {},
  // General defaults
  generalData: defaultGeneralData,
  setGeneralData: () => null,
  // History defaults
  record: [],
  smartBack: () => {},
});

// ============== PROVIDER ==============

interface AppProviderProps {
  children: ReactNode;
  storeSSD?: AppState;
}

export function AppProvider({ children, storeSSD }: AppProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | undefined>(
    undefined,
  );
  const supabase = createClient();

  // Promise resolver para manejar el resultado del login
  const authResolverRef = useRef<((value: boolean) => void) | null>(null);

  // General State
  const [generalData, setGeneralData] = useState<AppState>(
    storeSSD ?? defaultGeneralData,
  );

  // History State
  const [record, setRecord] = useState<HistoryEntry[]>([]);
  const prevPathRef = useRef<string | null>(null);

  // ============== AUTH EFFECTS ==============
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Si hay un resolver esperando y el usuario se autenticó
      if (authResolverRef.current && session?.user) {
        authResolverRef.current(true);
        authResolverRef.current = null;
        setIsLoginOpen(false);
        setLoginMessage(undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // ============== GENERAL EFFECTS ==============

  // Scroll al cambiar de página
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const el = document.getElementById(window.location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // Mostrar login popover si no hay usuario (comportamiento inicial)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loading) return;

    // Solo mostrar automáticamente si no es una solicitud manual
    if (!authResolverRef.current && !user) {
      queueMicrotask(() => setIsLoginOpen(true));
    } else if (user) {
      queueMicrotask(() => setIsLoginOpen(false));
    }
  }, [loading, user]);

  // ============== HISTORY EFFECTS ==============

  // Guardar ruta + shop en historial
  useEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (prevPathRef.current) {
      setRecord((h) => [
        ...h,
        {
          path: prevPathRef.current!,
          shop: params.shop as string | undefined,
        },
      ]);
    }
  }, [params.shop]);

  // ============== FUNCIONES ==============

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Función para requerir autenticación (para reviews, etc.)
  const requireAuth = async (message?: string): Promise<boolean> => {
    // Si ya está autenticado, retornar true inmediatamente
    if (user && session) {
      return true;
    }

    // Si ya hay un proceso de auth en curso, esperar a que termine
    if (authResolverRef.current) {
      return false;
    }

    // Crear una nueva Promise que se resolverá cuando el usuario se autentique
    return new Promise<boolean>((resolve) => {
      authResolverRef.current = resolve;
      setLoginMessage(message || "Debes iniciar sesión para continuar");
      setIsLoginOpen(true);

      // Timeout de 5 minutos para cancelar si el usuario no se loguea
      setTimeout(() => {
        if (authResolverRef.current) {
          authResolverRef.current(false);
          authResolverRef.current = null;
          setIsLoginOpen(false);
          setLoginMessage(undefined);
        }
      }, 300000); // 5 minutos
    });
  };

  // Función para abrir el popover de login manualmente
  const openLoginPopover = (message?: string) => {
    setLoginMessage(message);
    setIsLoginOpen(true);
  };

  // Función para cerrar el popover de login manualmente
  const closeLoginPopover = () => {
    // Si hay un resolver esperando, cancelar el proceso
    if (authResolverRef.current) {
      authResolverRef.current(false);
      authResolverRef.current = null;
    }
    setIsLoginOpen(false);
    setLoginMessage(undefined);
  };

  const smartBack = () => {
    // Función helper para extraer la ruta base sin query params
    const getBasePath = (path: string) => {
      return path.split("?")[0];
    };

    // Buscar la última ruta válida (saltando productos y búsquedas repetidas)
    for (let i = record.length - 2; i >= 0; i--) {
      const candidate = record[i];
      const candidateBasePath = getBasePath(candidate.path);

      // Saltar páginas de productos
      if (/^\/t\/[^/]+\/producto\/[^/]+/.test(candidateBasePath)) {
        continue;
      }

      // Saltar páginas de búsqueda consecutivas (mismo base path)
      if (/^\/t\/[^/]+\/search/.test(candidateBasePath)) {
        // Verificar si la siguiente entrada también es una búsqueda del mismo shop
        let isConsecutiveSearch = false;

        for (let j = i + 1; j < record.length; j++) {
          const nextBasePath = getBasePath(record[j].path);
          if (nextBasePath === candidateBasePath) {
            isConsecutiveSearch = true;
            break;
          }
        }

        // Si es una búsqueda consecutiva, continuar buscando
        if (isConsecutiveSearch) {
          continue;
        }
      }

      // Esta es una ruta válida, navegar a ella
      router.push(candidate.path);
      return;
    }

    // Si no hay ninguna válida, usar el último shop registrado
    const lastShop = record.at(-1)?.shop;
    if (lastShop) {
      router.push(`/t/${lastShop}`);
    } else {
      router.push("/");
    }
  };

  // ============== RENDER ==============

  return (
    <AppContext.Provider
      value={{
        // Auth
        user,
        session,
        loading,
        signOut,
        requireAuth,
        openLoginPopover,
        closeLoginPopover,
        // General
        generalData,
        setGeneralData,
        // History
        record,
        smartBack,
      }}
    >
      <LoginPopover
        isOpen={isLoginOpen}
        onClose={closeLoginPopover}
        redirectTo={pathname ?? "/"}
        message={loginMessage}
      />
      <main>{children}</main>
    </AppContext.Provider>
  );
}

// ============== HOOKS ==============

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp debe ser usado dentro de AppProvider");
  }
  return context;
};

// Hooks específicos para mantener compatibilidad
export const useAuth = () => {
  const {
    user,
    session,
    loading,
    signOut,
    requireAuth,
    openLoginPopover,
    closeLoginPopover,
  } = useApp();
  return {
    user,
    session,
    loading,
    signOut,
    requireAuth,
    openLoginPopover,
    closeLoginPopover,
  };
};

export const useHistory = () => {
  const { record, smartBack } = useApp();
  return { record, smartBack };
};

export const useGeneralData = () => {
  const { generalData, setGeneralData } = useApp();
  return { generalData, setGeneralData };
};
