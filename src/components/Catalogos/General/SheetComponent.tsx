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
import { Categoria, Current } from "@/context/InitialStatus";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type SheetView = "home" | "categories" | "coins";

// Context para controlar el Sheet
interface SheetContextType {
  open: () => void;
  close: () => void;
  toggle: () => void;
  openToView: (view: SheetView) => void;
  isOpen: boolean;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export function useSheet() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("useSheet debe ser usado dentro de SheetProvider");
  }
  return context;
}

// Provider Component
export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showState, setShowState] = useState<SheetView>("home");

  const open = useCallback(() => setIsMenuOpen(true), []);
  const close = useCallback(() => setIsMenuOpen(false), []);
  const toggle = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const openToView = useCallback((view: SheetView) => {
    setShowState(view);
    setIsMenuOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      open,
      close,
      toggle,
      openToView,
      isOpen: isMenuOpen,
    }),
    [open, close, toggle, openToView, isMenuOpen]
  );

  return (
    <SheetContext.Provider value={value}>
      {children}
      <SheetComponent
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        showState={showState}
        setShowState={setShowState}
      />
    </SheetContext.Provider>
  );
}

// Componente Sheet actualizado para recibir props del Provider
interface SheetComponentProps {
  className?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  showState: SheetView;
  setShowState: (view: SheetView) => void;
}

function SheetComponent({
  isOpen,
  onOpenChange,
  showState,
  setShowState,
}: SheetComponentProps) {
  const { store, dispatchStore } = useContext(MyContext);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  // Reset view when sheet closes
  useEffect(() => {
    if (!isOpen) setShowState("home");
  }, [isOpen, setShowState]);

  const closeSheet = useCallback(() => onOpenChange(false), [onOpenChange]);

  const handleReviewAction = useCallback(() => {
    if (user && !loading) {
      setReviewOpen(true);
      closeSheet();
    } else {
      closeSheet();
    }
  }, [user, loading, closeSheet]);

  const handleCoinChange = useCallback(
    (coinId: number) => {
      closeSheet();
      dispatchStore({ type: "ChangeCurrent", payload: coinId });
    },
    [closeSheet, dispatchStore]
  );

  const homeItems = useMemo(
    () => [
      {
        name: "Home",
        icon: <IoIosHome />,
        action: () => {
          router.push(`/t/${store.sitioweb}/`);
          closeSheet();
        },
      },
      {
        name: "Buscar",
        icon: <IoSearch />,
        action: () => {
          router.push(`/t/${store.sitioweb}/search`);
          closeSheet();
        },
      },
      {
        name: "Info",
        icon: <IoStorefrontOutline />,
        action: () => {
          router.push(`/t/${store.sitioweb}/about`);
          closeSheet();
        },
      },
      {
        name: "Categorias",
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
        action: handleReviewAction,
      },
      {
        name: "Comparar produtos",
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
        name: "Explorar",
        icon: <MdTravelExplore />,
        action: () => {
          router.push(`/`);
          closeSheet();
        },
      },
    ],
    [store.sitioweb, router, closeSheet, handleReviewAction, setShowState]
  );

  const displayName = useMemo(() => {
    if (!isMounted || loading) return "Cargando...";
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ")[0];
    }
    return "Guest";
  }, [user, isMounted, loading]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={isOpen}>
        <SheetContent className="bg-gradient-to-br from-slate-100 to-slate-300 p-4">
          <SheetHeader>
            <SheetTitle>
              <Link href={"/user"} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  {isMounted && user?.user_metadata?.avatar_url ? (
                    <Image
                      width={40}
                      height={40}
                      src={user.user_metadata.avatar_url}
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                  ) : (
                    <User className="w-5 h-5 text-slate-800" />
                  )}
                </div>
                <div>
                  <p className="text-slate-800 font-semibold text-sm">
                    Hi, {displayName}
                  </p>
                  <p className="text-slate-800/70 text-xs">
                    {isMounted && user ? "Welcome back" : "Guest"}
                  </p>
                </div>
              </Link>
            </SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {showState === "home" && <HomeView items={homeItems} />}

            {showState === "categories" && (
              <CategoriesView
                onBack={() => setShowState("home")}
                onClose={closeSheet}
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

          <div className="space-y-2">
            <Separator className="bg-white/20" />
            <ListSheet
              name={"Cerrar Sesion"}
              icon={<User className="w-8 h-8 text-slate-800" />}
              icon2={<ChevronRight />}
              action={signOut}
            />
          </div>
        </SheetContent>
      </Sheet>
      <PreviewRatingGeneral
        reviewOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
    </>
  );
}

// Subcomponents
interface HomeViewProps {
  items: Array<{ name: string; icon: React.ReactNode; action: () => void }>;
}

function HomeView({ items }: HomeViewProps) {
  return (
    <>
      {items.map((item) => (
        <ListSheet
          key={item.name}
          name={item.name}
          icon={item.icon}
          icon2={<ChevronRight />}
          action={item.action}
        />
      ))}
    </>
  );
}

interface CategoriesViewProps {
  onBack: () => void;
  onClose: () => void;
}

function CategoriesView({ onBack, onClose }: CategoriesViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { store } = useContext(MyContext);

  const handleCategoryClick = useCallback(
    (category: Categoria) => {
      if (category.subtienda || pathname !== `/t/${store?.sitioweb}`) {
        router.push(`/t/${store?.sitioweb}/category/${category.id}`);
        onClose();
      } else {
        const targetUrl = `/t/${store?.sitioweb}`;
        const targetId = category.id;

        if (pathname === targetUrl) {
          scrollToElement(targetId);
          onClose();
        } else {
          router.push(targetUrl);
          onClose();
          setTimeout(() => scrollToElement(targetId), 100);
        }
      }
    },
    [store?.sitioweb, pathname, router, onClose]
  );

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };
  console.log(ExtraerCategorias(store?.categorias, store.products), store);
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1">
      <ListSheet name="Atrás" icon2={<ChevronLeft />} action={onBack} />
      <Separator className="bg-white/20" />

      <ListSheet
        name="Todas"
        icon2={<ChevronRight />}
        action={() => {
          router.push(`/t/${store?.sitioweb}/category`);
          onClose();
        }}
      />
      <Separator className="bg-white/20" />

      {ExtraerCategorias(store?.categorias, store.products).map(
        (category: Categoria) => (
          <React.Fragment key={category.id}>
            <ListSheet
              name={category.name || ""}
              icon2={<ChevronRight />}
              action={() => handleCategoryClick(category)}
            />
          </React.Fragment>
        )
      )}
    </div>
  );
}

interface CoinsViewProps {
  coins: Current[];
  onBack: () => void;
  onSelectCoin: (id: number) => void;
}

function CoinsView({ coins, onBack, onSelectCoin }: CoinsViewProps) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1">
      <ListSheet name="Atrás" icon2={<ChevronLeft />} action={onBack} />
      <Separator className="bg-white/20" />

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

interface ListSheetProps {
  name: string;
  icon?: React.ReactNode;
  icon2?: React.ReactNode;
  action?: () => void;
  className?: string;
  final?: boolean;
}

const ListSheet = React.memo(function ListSheet({
  name,
  icon,
  icon2,
  action,
  className,
  final = false,
}: ListSheetProps) {
  return (
    <>
      <Button
        onClick={action}
        variant="ghost"
        className={cn(
          "w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-700",
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="truncate">{name}</span>
        </div>
        {icon2 && <span className="flex-shrink-0">{icon2}</span>}
      </Button>
      {final && <Separator className="bg-white/20" />}
    </>
  );
});
