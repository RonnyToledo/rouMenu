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
import { AppState, Categoria, Current } from "@/types/InitialStatus";
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
import { ThemeToggle } from "@/components/theme-toggle";
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
  const [isMounted, setIsMounted] = useState(false);
  const [showState, setShowState] = useState<SheetView>("home");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setIsMounted(true));
  }, []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) queueMicrotask(() => setShowState("home"));
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
    [closeSheet, dispatchStore],
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
        name: "Explorar",
        icon: <MdTravelExplore />,
        action: () => {
          router.push(`/`);
          closeSheet();
        },
      },
    ],
    [store.sitioweb, router, closeSheet, handleReviewAction],
  );

  const displayName = useMemo(() => {
    if (!isMounted || loading) return "Cargando...";
    return user?.user_metadata?.full_name?.split(" ")[0] || "Guest";
  }, [user, isMounted, loading]);

  return (
    <div
      className="absolute inset-0 bg-secondary/90 backdrop-blur-xl transition-all duration-300"
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

      <div className="h-full flex flex-col p-5 pt-14 max-w-64">
        {/* Close button */}
        <button
          onClick={() => setIsMenuOpen(false)}
          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground mb-4 transition-colors rounded-full hover:bg-secondary"
          aria-label="Cerrar menú"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User header */}
        <div className="flex justify-between items-center mb-4">
          <ThemeToggle />
          <Link href="/user" className="flex items-center gap-2">
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
        </div>

        {/* Nav items */}
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

        {/* Footer */}
        <div className="space-y-1">
          <Separator className="bg-border" />
          <ListSheet
            name="Cerrar Sesión"
            icon={<User className="w-4 h-4 text-muted-foreground" />}
            icon2={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
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
  store,
  onBack,
  onClose,
}: {
  store: AppState;
  onBack: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

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
      />
      <Separator className="bg-border my-1" />
      <ListSheet
        name="Todas"
        icon2={<ChevronRight className="w-4 h-4" />}
        action={() => {
          router.push(`/t/${store?.sitioweb}/category`);
          onClose();
        }}
      />
      <Separator className="bg-border my-1" />
      {ExtraerCategorias(store?.categorias, store.products).map(
        (category: Categoria) => (
          <ListSheet
            key={category.id}
            name={category.name || ""}
            icon2={<ChevronRight className="w-4 h-4" />}
            action={() => handleCategoryClick(category)}
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
          <span className="truncate">{name}</span>
        </div>
        {icon2 && (
          <span className="shrink-0 text-muted-foreground">{icon2}</span>
        )}
      </Button>
      {final && <Separator className="bg-border" />}
    </>
  );
});
