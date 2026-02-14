"use client";
import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PreviewRatingGeneral from "./PreviewRatingGeneral";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import { AppState, Categoria, Current } from "@/context/InitialStatus";
import { cn } from "@/lib/utils";
import "@github/relative-time-element";
import { MdCategory, MdCurrencyExchange, MdRateReview } from "react-icons/md";
import { IoStorefrontOutline, IoSearch } from "react-icons/io5";
import { IoIosHome } from "react-icons/io";
import { FaBalanceScale } from "react-icons/fa";
import { useAuth } from "@/context/AppContext";
import { Separator } from "@/components/ui/separator";
import { ExtraerCategorias } from "@/functions/extraerCategoriass";
import { BsFileEarmarkPostFill } from "react-icons/bs";
import { User, X } from "lucide-react";
import LoginPopover from "@/components/GeneralComponents/LoginPopover";
import Link from "next/link";
import { MdTravelExplore } from "react-icons/md";
import { ScrollTo } from "@/functions/ScrollTo";

type SheetView = "home" | "categories" | "coins";

interface MenuScreenProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function MenuScreen({ isMenuOpen, setIsMenuOpen }: MenuScreenProps) {
  const { store, dispatchStore } = useContext(MyContext);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Estado para detectar montaje del cliente
  const [isMounted, setIsMounted] = useState(false);
  const [showState, setShowState] = useState<SheetView>("home");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Detectar montaje del cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  // Reset view when sheet closes
  useEffect(() => {
    if (!isMenuOpen) setShowState("home");
  }, [isMenuOpen]);

  const closeSheet = useCallback(() => setIsMenuOpen(false), [setIsMenuOpen]);

  const handleReviewAction = useCallback(() => {
    if (user && !loading) {
      setReviewOpen(true);
      closeSheet();
    } else {
      setIsLoginOpen(true);
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

  // Home menu items
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
    [store.sitioweb, router, closeSheet, handleReviewAction]
  );

  // Nombre de usuario para display
  const displayName = useMemo(() => {
    if (!isMounted || loading) return "Cargando...";
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ")[0];
    }
    return "Guest";
  }, [user, isMounted, loading]);

  return (
    <div
      className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-900 transition-opacity duration-500"
      style={{
        opacity: isMenuOpen ? 1 : 0,
        pointerEvents: isMenuOpen ? "auto" : "none",
      }}
    >
      <LoginPopover
        isOpen={isLoginOpen}
        onClose={closeLogin}
        redirectTo={pathname}
      />
      <div className="h-full flex flex-col p-6 pt-14 max-w-60">
        <button
          onClick={() => setIsMenuOpen(false)}
          className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white mb-4 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header del usuario */}
        <div className="flex justify-between items-center mb-4">
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
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                Hi, {displayName}
              </p>
              <p className="text-white/70 text-xs">
                {isMounted && user ? "Welcome back" : "Guest"}
              </p>
            </div>
          </Link>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {showState === "home" && <HomeView items={homeItems} />}

          {showState === "categories" && (
            <CategoriesView
              store={store}
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

        {/* Footer con perfil */}
        <div className="space-y-2">
          <Separator className="bg-white/20" />
          <ListSheet
            name={"Cerrar Sesion"}
            icon={<User className="w-8 h-8 text-white" />}
            icon2={<ChevronRight />}
            action={signOut}
          />
        </div>
      </div>

      <PreviewRatingGeneral
        reviewOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
    </div>
  );
}

export default MenuScreen;

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
  store: AppState;
  onBack: () => void;
  onClose: () => void;
}

function CategoriesView({ store, onBack, onClose }: CategoriesViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleCategoryClick = useCallback(
    (category: Categoria) => {
      if (category.subtienda || pathname !== `/t/${store?.sitioweb}`) {
        router.push(`/t/${store?.sitioweb}/category/${category.id}`);
        onClose();
      } else {
        const targetUrl = `/t/${store?.sitioweb}`;
        const targetId = category.id;

        if (pathname === targetUrl) {
          ScrollTo(targetId);
          onClose();
        } else {
          router.push(targetUrl);
          onClose();
          setTimeout(() => ScrollTo(targetId), 100);
        }
      }
    },
    [store?.sitioweb, pathname, router, onClose]
  );

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
          "w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-100",
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
