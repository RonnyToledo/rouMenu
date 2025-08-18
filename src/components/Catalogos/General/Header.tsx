"use client";
import React, { useContext, useEffect, useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import { ScheduleInterface } from "@/context/InitialStatus";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import "@github/relative-time-element";
import { CiMenuFries } from "react-icons/ci";
import { MdCategory, MdCurrencyExchange } from "react-icons/md";
import { IoStorefrontOutline, IoSearch } from "react-icons/io5";
import { isOpen, IsOpenStoreInteface } from "@/functions/time";
import OpenClose from "./OpenClose";
import { useHistory } from "@/context/HistoryContext";
import ShareButton from "@/components/myUI/buttonShare";
import { FaBalanceScale } from "react-icons/fa";

// Motion variants for page transitions
const containerVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { when: "beforeChildren", staggerChildren: 0.1 },
  },
  exit: { opacity: 0, x: -50, transition: { when: "afterChildren" } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function Header() {
  const { store, dispatchStore } = useContext(MyContext);
  const { smartBack } = useHistory();
  const router = useRouter();
  const pathname = usePathname();
  const [showState, setShowState] = useState<string>("home");
  const [open, setOpen] = useState(false);
  const [isOpenStore, setisOpenStore] = useState<IsOpenStoreInteface>({
    week: 1,
    open: false,
  });

  useEffect(() => {
    // Si la URL tiene hash no hacemos scroll
    if (typeof window !== "undefined" && window.location.hash) {
      const el = document.getElementById(window.location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    if (!open) setShowState("home");
  }, [open]);
  useEffect(() => {
    setisOpenStore(isOpen((store.horario || []) as ScheduleInterface[]));
  }, [store]);

  return (
    <header className="sticky top-0 z-50 bg-white h-12 p-4 flex items-center justify-between border-b-2 border-[var(--border-gold)]">
      <div className="flex items-center">
        <Button variant="ghost" onClick={smartBack} size="icon">
          <Image
            alt={(store?.name || "Rou-Menu") + " Logo"}
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
            {isOpenStore?.open ? (
              <span className="text-green-400 font-bold">ABIERTO</span>
            ) : (
              <span className="text-red-400 font-bold">CERRADO</span>
            )}{" "}
            · <OpenClose open={isOpenStore} newHorario={store.horario || []} />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {pathname.includes("/about") && (
          <ShareButton
            title={`${store.name}`}
            text={store.parrrafo}
            url={`https://roumenu.vercel.app/t/${store.sitioweb}`}
          />
        )}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <CiMenuFries
              className="text-[var(--text-gold)] cursor-pointer"
              onClick={() => setOpen(true)}
            />
          </SheetTrigger>

          {/* Animated sheet content */}
          <SheetContent className="overflow-hidden">
            <SheetHeader>
              <SheetTitle className="text-[var(--text-gold)] line-clamp-1">
                {store?.name || "Rou-Menu"}
              </SheetTitle>
              <SheetDescription className="line-clamp-2">
                {store?.parrrafo || "Rou-Menu"}
              </SheetDescription>
            </SheetHeader>

            <AnimatePresence>
              {showState === "home" && (
                <motion.div
                  key="home"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-2 w-full"
                >
                  {[
                    {
                      name: "Buscar",
                      icon: <IoSearch />,
                      action: () => {
                        router.push(`/t/${store.sitioweb}/search`);
                        setOpen(false);
                      },
                    },
                    {
                      name: "Info",
                      icon: <IoStorefrontOutline />,
                      action: () => {
                        router.push(`/t/${store.sitioweb}/about`);
                        setOpen(false);
                      },
                    },
                    {
                      name: "Categorias",
                      icon: <MdCategory />,
                      action: () => setShowState("categories"),
                    },
                    {
                      name: "Monedas",
                      icon: <MdCurrencyExchange />,
                      action: () => setShowState("coins"),
                    },
                    {
                      name: "Comprar produtos",
                      icon: <FaBalanceScale />,
                      action: () => {
                        router.push(`/t/${store.sitioweb}/comparar`);

                        setOpen(false);
                      },
                    },
                  ].map((item) => (
                    <motion.div key={item.name} variants={containerVariants}>
                      <ListSheet
                        name={item.name}
                        icon={item.icon}
                        icon2={<ChevronRight />}
                        action={item.action}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {showState === "categories" && (
                <motion.div
                  key="categories"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-2 w-full"
                >
                  <ListSheet
                    name="Atrás"
                    icon2={<ChevronLeft />}
                    action={() => setShowState("home")}
                    className="shadow-md"
                  />
                  <ScrollArea className="h-[70vh] rounded-md border">
                    <ListSheet
                      name="Todas"
                      icon2={<ChevronLeft />}
                      action={() => {
                        router.push(`/t/${store?.sitioweb}/category`);
                        setOpen(false);
                      }}
                    />
                    {store?.categorias?.map((category) => (
                      <motion.div key={category.id} variants={itemVariants}>
                        <ListSheet
                          name={category.name || ""}
                          icon2={<ChevronRight />}
                          action={() => {
                            if (category.subtienda) {
                              router.push(
                                `/t/${store?.sitioweb}/category/${category.id}`
                              );
                            } else {
                              router.push(
                                `/t/${store?.sitioweb}#${category.id}`
                              );
                            }
                            setOpen(false);
                          }}
                        />
                      </motion.div>
                    ))}
                  </ScrollArea>
                </motion.div>
              )}

              {showState === "coins" && (
                <motion.div
                  key="coins"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-2 w-full"
                >
                  <ListSheet
                    name="Atrás"
                    icon2={<ChevronLeft />}
                    action={() => setShowState("home")}
                    className="shadow-md"
                  />
                  <ScrollArea className="h-[70vh] rounded-md border">
                    {store?.moneda?.map((coin, i) => (
                      <motion.div key={i} variants={itemVariants}>
                        <ListSheet
                          name={coin.moneda || ""}
                          icon2={<MdCurrencyExchange />}
                          action={() => {
                            setOpen(false);
                            dispatchStore({
                              type: "ChangeCurrent",
                              payload: JSON.stringify(coin),
                            });
                            /* cambiar moneda aquí */
                          }}
                        />
                      </motion.div>
                    ))}
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

interface ListSheetProps {
  name: string;
  icon?: React.ReactNode;
  icon2?: React.ReactNode;
  action?: () => void;
  className?: string;
}

function ListSheet({ name, icon, icon2, action, className }: ListSheetProps) {
  return (
    <Button
      onClick={action}
      variant="ghost"
      className={cn(
        "w-full flex justify-between items-center h-10 text-base border-b-2 text-[var(--text-gold)]",
        className
      )}
    >
      <div className="flex items-center gap-2 truncate line-clamp-1 justify-between">
        {icon}
        {name}
      </div>
      {icon2}
    </Button>
  );
}
