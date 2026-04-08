"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  createContext,
} from "react";
import { User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AppContext";
import Link from "next/link";
import { MyContext } from "@/context/MyContext";
import { MdCategory, MdCurrencyExchange, MdRateReview } from "react-icons/md";
import { IoStorefrontOutline, IoSearch } from "react-icons/io5";
import { IoIosHome } from "react-icons/io";
import { FaBalanceScale } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { ExtraerCategorias } from "@/functions/extraerCategoriass";
import { BsFileEarmarkPostFill } from "react-icons/bs";
import { MdTravelExplore } from "react-icons/md";
import { useRouter, usePathname } from "next/navigation";
import PreviewRatingGeneral from "./PreviewRatingGeneral";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Categoria, Current } from "@/types/InitialStatus";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScrollTo } from "@/functions/ScrollTo";

type SheetView = "home" | "categories" | "coins";

interface SheetContextType {
  open: () => void;
  close: () => void;
  toggle: () => void;
  openToView: (view: SheetView) => void;
  highlightCategory: (categoryId: string) => void;
  isOpen: boolean;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export function useSheet() {
  const context = useContext(SheetContext);
  if (!context)
    throw new Error("useSheet debe ser usado dentro de SheetProvider");
  return context;
}

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showState, setShowState] = useState<SheetView>("home");
  const [highlightCategoryId, setHighlightCategoryId] = useState<string | null>(
    null,
  );

  const open = useCallback(() => setIsMenuOpen(true), []);
  const close = useCallback(() => setIsMenuOpen(false), []);
  const toggle = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const openToView = useCallback((view: SheetView) => {
    setShowState(view);
    setIsMenuOpen(true);
  }, []);
  const highlightCategory = useCallback((categoryId: string) => {
    setShowState("categories");
    setIsMenuOpen(true);
    setTimeout(() => setHighlightCategoryId(categoryId), 300);
  }, []);

  const value = useMemo(
    () => ({
      open,
      close,
      toggle,
      openToView,
      highlightCategory,
      isOpen: isMenuOpen,
    }),
    [open, close, toggle, openToView, highlightCategory, isMenuOpen],
  );

  return (
    <SheetContext.Provider value={value}>
      {children}
      <SheetComponent
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        showState={showState}
        setShowState={setShowState}
        highlightCategoryId={highlightCategoryId}
        onHighlightComplete={() => setHighlightCategoryId(null)}
      />
    </SheetContext.Provider>
  );
}

interface SheetComponentProps {
  className?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  showState: SheetView;
  setShowState: (view: SheetView) => void;
  highlightCategoryId: string | null;
  onHighlightComplete: () => void;
}

function SheetComponent({
  isOpen,
  onOpenChange,
  showState,
  setShowState,
  highlightCategoryId,
  onHighlightComplete,
}: SheetComponentProps) {
  const { store, dispatchStore } = useContext(MyContext);
  const { user, loading, signOut, requireAuth, openLoginPopover } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) setShowState("home");
  }, [isOpen, setShowState]);
  const closeSheet = useCallback(() => onOpenChange(false), [onOpenChange]);

  const handleReviewAction = useCallback(async () => {
    const isAuthenticated = await requireAuth(
      "Debes iniciar sesión para dejar una reseña",
    );
    if (!isAuthenticated) {
      closeSheet();
      return;
    }
    setReviewOpen(true);
    closeSheet();
  }, [requireAuth, closeSheet]);

  const handleCoinChange = useCallback(
    (coinId: number) => {
      closeSheet();
      dispatchStore({ type: "ChangeCurrent", payload: coinId });
    },
    [closeSheet, dispatchStore],
  );

  const homeItems = useMemo(
    () => [
      {
        name: "Inicio",
        icon: <IoIosHome />,
        action: () => {
          router.push(`/t/${store.sitioweb}/`);
          closeSheet();
        },
      },
      {
        name: "Sobre Nosotros",
        icon: <IoStorefrontOutline />,
        action: () => {
          router.push(`/t/${store.sitioweb}/about`);
          closeSheet();
        },
      },
      {
        name: "Ver Categorías",
        icon: <MdCategory />,
        action: () => setShowState("categories"),
      },
      {
        name: "Moneda de Compra",
        icon: <MdCurrencyExchange />,
        action: () => setShowState("coins"),
      },
      {
        name: "Dejar una reseña",
        icon: <MdRateReview />,
        action: () => {
          handleReviewAction();
          closeSheet();
        },
      },
      {
        name: "Comparar productos",
        icon: <FaBalanceScale />,
        action: () => {
          router.push(`/t/${store.sitioweb}/comparar`);
          closeSheet();
        },
      },
      {
        name: "Blog",
        icon: <BsFileEarmarkPostFill />,
        action: () => {
          router.push(`/t/${store.sitioweb}/blog`);
          closeSheet();
        },
      },
      {
        name: "Explorar más catálogos",
        icon: <MdTravelExplore />,
        action: () => {
          router.push(`/`);
          closeSheet();
        },
      },
    ],
    [store.sitioweb, router, closeSheet, handleReviewAction, setShowState],
  );

  const displayName = useMemo(() => {
    if (!isMounted || loading) return "Cargando...";
    return user?.user_metadata?.full_name?.split(" ")[0] || "Guest";
  }, [user, isMounted, loading]);

  useEffect(() => {
    queueMicrotask(() => setIsMounted(true));
  }, []);

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={isOpen}>
        <SheetContent className="bg-secondary/95 backdrop-blur-xl border-border p-4 transition-colors duration-300">
          <SheetHeader>
            <SheetTitle>
              <Link href="/user" className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-background border border-border rounded-full flex items-center justify-center overflow-hidden">
                  {isMounted && user?.user_metadata?.avatar_url ? (
                    <Image
                      width={36}
                      height={36}
                      src={user.user_metadata.avatar_url}
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Hi, {displayName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isMounted && user ? "Welcome back" : "Guest"}
                  </p>
                </div>
              </Link>
            </SheetTitle>
            <SheetDescription />
          </SheetHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 mt-2">
            {/* Búsqueda rápida */}
            <Button
              variant="outline"
              onClick={() => {
                router.push(`/t/${store.sitioweb}/search`);
                closeSheet();
              }}
              className="justify-start rounded-full h-9 w-full border-border text-xs gap-2 text-muted-foreground"
            >
              <IoSearch className="w-3.5 h-3.5" />
              Búsqueda avanzada
            </Button>

            <div className="min-h-fit">
              {showState === "home" && <HomeView items={homeItems} />}
              {showState === "categories" && (
                <CategoriesView
                  onBack={() => setShowState("home")}
                  onClose={closeSheet}
                  highlightCategoryId={highlightCategoryId}
                  onHighlightComplete={onHighlightComplete}
                />
              )}
              {showState === "coins" && (
                <CoinsView
                  coins={store?.moneda || []}
                  onBack={() => setShowState("home")}
                  onSelectCoin={handleCoinChange}
                />
              )}
            </div>
          </div>

          {user ? (
            <div className="space-y-1">
              <Separator className="bg-border" />
              <ListSheet
                name="Cerrar Sesión"
                icon={<User className="w-4 h-4 text-muted-foreground" />}
                icon2={
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                }
                action={() => {
                  signOut();
                  closeSheet();
                }}
              />
            </div>
          ) : (
            <div className="p-3 flex items-center justify-center">
              <Button
                variant="link"
                className="p-0 h-auto flex-col"
                onClick={() => {
                  closeSheet();
                  openLoginPopover();
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  {" "}
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />{" "}
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />{" "}
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />{" "}
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />{" "}
                </svg>
                Acceder con Google
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <PreviewRatingGeneral
        reviewOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
    </>
  );
}

function HomeView({
  items,
}: {
  items: Array<{ name: string; icon: React.ReactNode; action: () => void }>;
}) {
  return (
    <>
      {items.map((item) => (
        <ListSheet
          key={item.name}
          name={item.name}
          icon={item.icon}
          icon2={<ChevronRight className="w-4 h-4" />}
          action={item.action}
        />
      ))}
    </>
  );
}

function CategoriesView({
  onBack,
  onClose,
  highlightCategoryId,
  onHighlightComplete,
}: {
  onBack: () => void;
  onClose: () => void;
  highlightCategoryId: string | null;
  onHighlightComplete: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { store } = useContext(MyContext);
  const [blinkingCategoryId, setBlinkingCategoryId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (highlightCategoryId !== null) {
      const el = document.getElementById(`category-${highlightCategoryId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setBlinkingCategoryId(highlightCategoryId);
      const t = setTimeout(() => {
        setBlinkingCategoryId(null);
        onHighlightComplete();
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [highlightCategoryId, onHighlightComplete]);

  const handleCategoryClick = useCallback(
    (category: Categoria) => {
      if (category.subtienda || pathname !== `/t/${store?.sitioweb}`) {
        router.push(`/t/${store?.sitioweb}/category/${category.id}`);
        onClose();
      } else {
        if (pathname === `/t/${store?.sitioweb}`) {
          ScrollTo(category.id);
          onClose();
        } else {
          router.push(`/t/${store?.sitioweb}`);
          onClose();
          setTimeout(() => ScrollTo(category.id), 100);
        }
      }
    },
    [store?.sitioweb, pathname, router, onClose],
  );

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
      <ListSheet
        name="Atrás"
        icon2={<ChevronLeft className="w-4 h-4" />}
        action={onBack}
        className="font-semibold"
      />
      <Separator className="bg-border my-1" />
      <ListSheet
        name="Todas"
        icon2={<ChevronRight className="w-4 h-4" />}
        action={() => {
          router.push(`/t/${store?.sitioweb}/category`);
          onClose();
        }}
        className="font-semibold"
      />
      <Separator className="bg-border my-1" />
      {ExtraerCategorias(store?.categorias, store.products).map(
        (category: Categoria) => (
          <ListSheet
            key={category.id}
            id={`category-${category.id}`}
            name={category.name || ""}
            icon2={<ChevronRight className="w-4 h-4" />}
            action={() => handleCategoryClick(category)}
            className={
              blinkingCategoryId === category.id ? "animate-blink" : ""
            }
          />
        ),
      )}
    </div>
  );
}

function CoinsView({
  coins,
  onBack,
  onSelectCoin,
}: {
  coins: Current[];
  onBack: () => void;
  onSelectCoin: (id: number) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
      <ListSheet
        name="Atrás"
        icon2={<ChevronLeft className="w-4 h-4" />}
        action={onBack}
        className="font-semibold"
      />
      <Separator className="bg-border my-1" />
      {coins.map((coin) => (
        <ListSheet
          key={coin.id}
          name={coin.nombre || ""}
          icon2={<MdCurrencyExchange />}
          action={() => onSelectCoin(coin.id)}
        />
      ))}
    </div>
  );
}

const ListSheet = React.memo(function ListSheet({
  name,
  icon,
  icon2,
  action,
  className,
  final = false,
  id,
}: {
  name: string;
  icon?: React.ReactNode;
  icon2?: React.ReactNode;
  action?: () => void;
  className?: string;
  final?: boolean;
  id?: string;
}) {
  return (
    <>
      <Button
        id={id}
        onClick={action}
        variant="ghost"
        className={cn(
          "w-full flex items-center justify-between gap-2 px-2 py-2 rounded-xl hover:bg-background transition-colors text-foreground text-sm h-auto",
          className,
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && (
            <span className="shrink-0 text-muted-foreground">{icon}</span>
          )}
          <span className="truncate">{ReturnCurrentName(name)}</span>
        </div>
        {icon2 && (
          <span className="shrink-0 text-muted-foreground">{icon2}</span>
        )}
      </Button>
      {final && <Separator className="bg-border" />}
    </>
  );
});
function ReturnCurrentName(name: string): string {
  if (name === "ECU") return "EURO";
  if (name === "USDT_TRC20") return "USDT";
  return name;
}
