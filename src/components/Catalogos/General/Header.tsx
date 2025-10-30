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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import {
  AppState,
  Categoria,
  Current,
  ScheduleInterface,
} from "@/context/InitialStatus";
import { cn } from "@/lib/utils";
import "@github/relative-time-element";
import { TbMenuDeep } from "react-icons/tb";
import { MdCategory, MdCurrencyExchange, MdRateReview } from "react-icons/md";
import { IoStorefrontOutline, IoSearch } from "react-icons/io5";
import { isOpen, IsOpenStoreInteface } from "@/functions/time";
import OpenClose from "./OpenClose";
import { useHistory } from "@/context/HistoryContext";
import ShareButton from "@/components/myUI/buttonShare";
import { FaBalanceScale } from "react-icons/fa";
import LoginPopover from "../../GeneralComponents/LoginPopover";
import { AuthContext } from "@/context/AuthContext";
import { LiaSignInAltSolid } from "react-icons/lia";
import { Separator } from "@/components/ui/separator";
import { logoUser } from "@/lib/image";
import PreviewRatingGeneral from "./PreviewRatingGeneral";
import { ExtraerCategorias } from "@/functions/extraerCategoriass";
import { BsFileEarmarkPostFill } from "react-icons/bs";
type SheetView = "home" | "categories" | "coins";

export default function Header() {
  const { store, dispatchStore } = useContext(MyContext);
  const context = useContext(AuthContext);
  const { smartBack } = useHistory();
  const router = useRouter();
  const pathname = usePathname();

  const [showState, setShowState] = useState<SheetView>("home");
  const [open, setOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isOpenStore, setIsOpenStore] = useState<IsOpenStoreInteface>({
    week: 1,
    open: false,
  });

  // Reset view when sheet closes
  useEffect(() => {
    if (!open) setShowState("home");
  }, [open]);

  // Update store open status
  useEffect(() => {
    setIsOpenStore(isOpen((store.horario || []) as ScheduleInterface[]));
  }, [store.horario]);

  // Memoized handlers
  const closeSheet = useCallback(() => setOpen(false), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const handleReviewAction = useCallback(() => {
    if (context?.user && !context.loading) {
      setReviewOpen(true);
      closeSheet();
    } else {
      setIsLoginOpen(true);
      closeSheet();
    }
  }, [context?.user, context?.loading, closeSheet]);

  const handleCoinChange = useCallback(
    (coinId: number) => {
      closeSheet();
      dispatchStore({ type: "ChangeCurrent", payload: coinId });
    },
    [closeSheet, dispatchStore]
  );

  // Profile configuration
  const profile = useMemo(() => {
    if (context?.user) {
      const userMeta = context.user.user_metadata;
      return {
        name: userMeta.full_name || "Perfil",
        icon: (
          <Image
            width={100}
            height={100}
            src={userMeta.avatar_url || logoUser}
            className="size-8 rounded-full"
            alt={userMeta.full_name || "Avatar"}
          />
        ),
        action: () => {
          router.push(`/user`);
          closeSheet();
        },
      };
    }
    return {
      name: "Registrarse / Iniciar Sesión",
      icon: <LiaSignInAltSolid />,
      action: () => {
        setIsLoginOpen(true);
        closeSheet();
      },
    };
  }, [context?.user, router, closeSheet]);

  // Home menu items
  const homeItems = useMemo(
    () => [
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
    ],
    [store.sitioweb, router, closeSheet, handleReviewAction]
  );

  return (
    <header className="sticky top-0 z-50 bg-white h-12 p-4 flex items-center justify-between shadow-md">
      <LoginPopover
        isOpen={isLoginOpen}
        onClose={closeLogin}
        redirectTo={pathname}
      />

      <PreviewRatingGeneral
        reviewOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />

      <div className="flex items-center">
        <Button variant="ghost" onClick={smartBack} size="icon">
          <Image
            alt={`${store?.name || "Rou-Menu"} Logo`}
            width={100}
            height={100}
            className="rounded-full w-8 h-8"
            src={store?.urlPoster || "/default-logo.png"}
          />
        </Button>
        <div className="ml-4">
          <h1 className="text-base font-cinzel tracking-wider text-[var(--text-gold)] uppercase line-clamp-1 truncate">
            {store?.name || "Rou-Menu"}
          </h1>
          <div className="flex text-[8px] text-[var(--text-muted)] gap-1">
            <span
              className={
                isOpenStore.open
                  ? "text-green-400 font-bold"
                  : "text-red-400 font-bold"
              }
            >
              {isOpenStore.open ? "ABIERTO" : "CERRADO"}
            </span>
            {" · "}
            <OpenClose open={isOpenStore} newHorario={store.horario || []} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {pathname.includes("/about") && (
          <ShareButton
            title={store.name}
            text={store.parrrafo}
            url={`https://roumenu.vercel.app/t/${store.sitioweb}`}
          />
        )}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button aria-label="Abrir menú" variant={"ghost"}>
              <TbMenuDeep className="text-[var(--text-gold)] cursor-pointer" />
            </Button>
          </SheetTrigger>

          <SheetContent className="overflow-hidden">
            <SheetHeader className="px-6 pt-8 pb-2 space-y-1">
              <SheetTitle className="text-2xl font-semibold tracking-tight">
                {store?.name || "Rou-Menu"}
              </SheetTitle>
              <SheetDescription className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {store?.parrrafo || "Rou-Menu"}
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <div className="flex-1 overflow-y-auto px-3 py-1">
              {showState === "home" && <HomeView items={homeItems} />}

              {showState === "categories" && (
                <CategoriesView
                  store={store}
                  onBack={() => {
                    setShowState("home");
                  }}
                  onClose={closeSheet}
                />
              )}

              {showState === "coins" && (
                <CoinsView
                  coins={store?.moneda || []}
                  onBack={() => {
                    setShowState("home");
                  }}
                  onSelectCoin={handleCoinChange}
                />
              )}
            </div>
            <div className="space-y-2 p-2">
              <Separator />
              <ListSheet
                name={profile.name}
                icon={profile.icon}
                icon2={<ChevronRight />}
                action={profile.action}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
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
  store: AppState;
  onBack: () => void;
  onClose: () => void;
}

function CategoriesView({ store, onBack, onClose }: CategoriesViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleCategoryClick = useCallback(
    (category: Categoria) => {
      if (category.subtienda) {
        // Navegar a página de categoría
        router.push(`/t/${store?.sitioweb}/category/${category.id}`);
        onClose();
      } else {
        // Scroll suave al elemento con el ID
        const targetUrl = `/t/${store?.sitioweb}`;
        const targetId = category.id;

        // Si ya estamos en la página principal
        if (pathname === targetUrl) {
          scrollToElement(targetId);
          onClose();
        } else {
          // Navegar primero y luego hacer scroll
          router.push(targetUrl);
          onClose();

          // Esperar a que la navegación se complete
          setTimeout(() => {
            scrollToElement(targetId);
          }, 100);
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

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden  px-3 py-1">
      <ListSheet
        name="Atrás"
        icon2={<ChevronLeft />}
        action={onBack}
        className="shadow-"
      />
      <Separator />

      <ListSheet
        name="Todas"
        icon2={<ChevronLeft />}
        action={() => {
          router.push(`/t/${store?.sitioweb}/category`);
          onClose();
        }}
      />
      <Separator />

      {ExtraerCategorias(store?.categorias, store.products).map(
        (category: Categoria) => (
          <ListSheet
            key={category.id}
            name={category.name || ""}
            icon2={<ChevronRight />}
            action={() => handleCategoryClick(category)}
          />
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
      <Separator />

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
          "flex items-center gap-1 p-1 rounded-lg text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors group",
          className
        )}
      >
        {icon}
        <div className="flex items-center gap-2 truncate justify-between">
          {name}
        </div>
        {icon2}
      </Button>
      {final && <Separator />}
    </>
  );
});
