"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import GoogleOneTap from "@/components/GeneralComponents/GoogleOneTap";
import LoginPopover from "@/components/GeneralComponents/LoginPopover";
import { ThemeProvider } from "next-themes";
import { HomeContentData } from "@/types/HomeContentInterface";

// ============== TIPOS ==============

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  requireAuth: (message?: string) => Promise<boolean>;
  openLoginPopover: (message?: string) => void;
  closeLoginPopover: () => void;
}

export type HistoryEntry = {
  path: string;
  shop?: string;
};

interface AppContextType extends AuthContextType {
  generalData: HomeContentData;
  setGeneralData: React.Dispatch<React.SetStateAction<HomeContentData>>;
  record: HistoryEntry[];
  smartBack: () => void;
}

// ============== DEFAULTS ==============

const defaultGeneralData: HomeContentData = {} as HomeContentData;

const AppContext = createContext<AppContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  requireAuth: async () => false,
  openLoginPopover: () => {},
  closeLoginPopover: () => {},
  generalData: defaultGeneralData,
  setGeneralData: () => null,
  record: [],
  smartBack: () => {},
});

// ============== CONSTANTES ==============

const AUTH_TIMEOUT_MS = 300_000;

// ============== PROVIDER ==============

interface AppProviderProps {
  children: ReactNode;
  storeSSD?: HomeContentData;
}

export function AppProvider({ children, storeSSD }: AppProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | undefined>(
    undefined,
  );

  const authResolverRef = useRef<((value: boolean) => void) | null>(null);
  const authTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // ── General ───────────────────────────────────────────────────────────────
  const [generalData, setGeneralData] = useState<HomeContentData>(
    storeSSD ?? defaultGeneralData,
  );

  // ── History ───────────────────────────────────────────────────────────────
  const [record, setRecord] = useState<HistoryEntry[]>([]);
  const prevPathRef = useRef<string>(pathname);

  // ============== EFECTOS DE AUTH ==============

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        // Autenticado → cerrar todo y resolver cualquier requireAuth pendiente
        setIsLoginOpen(false);
        setLoginMessage(undefined);

        if (authResolverRef.current) {
          authResolverRef.current(true);
          authResolverRef.current = null;
          clearTimeout(authTimeoutRef.current ?? undefined);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // ============== EFECTO DE SCROLL ==============

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // ============== EFECTO DE HISTORIAL ==============

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;

    if (prev === pathname) return;

    setRecord((h) => [
      ...h,
      { path: prev, shop: (params.shop as string | undefined) ?? undefined },
    ]);
  }, [pathname, params.shop]);

  // ============== FUNCIONES ==============

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  const requireAuth = useCallback(
    async (message?: string): Promise<boolean> => {
      if (user && session) return true;
      if (authResolverRef.current) return false;

      return new Promise<boolean>((resolve) => {
        authResolverRef.current = resolve;
        setLoginMessage(message ?? "Debes iniciar sesión para continuar");
        setIsLoginOpen(true);

        authTimeoutRef.current = setTimeout(() => {
          if (authResolverRef.current) {
            authResolverRef.current(false);
            authResolverRef.current = null;
            setIsLoginOpen(false);
            setLoginMessage(undefined);
          }
        }, AUTH_TIMEOUT_MS);
      });
    },
    [user, session],
  );

  const openLoginPopover = useCallback((message?: string) => {
    setLoginMessage(message);
    setIsLoginOpen(true);
  }, []);

  const closeLoginPopover = useCallback(() => {
    if (authResolverRef.current) {
      authResolverRef.current(false);
      authResolverRef.current = null;
      clearTimeout(authTimeoutRef.current ?? undefined);
    }
    setIsLoginOpen(false);
    setLoginMessage(undefined);
  }, []);

  const smartBack = useCallback(() => {
    const getBasePath = (path: string) => path.split("?")[0];

    for (let i = record.length - 2; i >= 0; i--) {
      const candidateBase = getBasePath(record[i].path);

      if (/^\/t\/[^/]+\/producto\/[^/]+/.test(candidateBase)) continue;

      if (/^\/t\/[^/]+\/search/.test(candidateBase)) {
        const isConsecutive = record
          .slice(i + 1)
          .some((r) => getBasePath(r.path) === candidateBase);
        if (isConsecutive) continue;
      }

      router.push(record[i].path);
      return;
    }

    const lastShop = record.at(-1)?.shop;
    router.push(lastShop ? `/t/${lastShop}` : "/");
  }, [record, router]);

  // ============== CONTEXT VALUE ==============

  const contextValue = useMemo(
    () => ({
      user,
      session,
      loading,
      signOut,
      requireAuth,
      openLoginPopover,
      closeLoginPopover,
      generalData,
      setGeneralData,
      record,
      smartBack,
    }),
    [
      user,
      session,
      loading,
      signOut,
      requireAuth,
      openLoginPopover,
      closeLoginPopover,
      generalData,
      record,
      smartBack,
    ],
  );

  // ============== RENDER ==============

  return (
    <AppContext.Provider value={contextValue}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {!user && <GoogleOneTap />}

        {!user && (
          <LoginPopover
            isOpen={isLoginOpen}
            onClose={closeLoginPopover}
            redirectTo={pathname ?? "/"}
            message={loginMessage}
          />
        )}

        <main>{children}</main>
      </ThemeProvider>
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
