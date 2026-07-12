"use client";
// MyContextProvider.tsx
import React, {
  useState,
  createContext,
  useReducer,
  ReactNode,
  Dispatch,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { reducerStore, AppAction } from "@/reducer/reducerGeneral";
import { AppState, initialState, Product } from "../types/InitialStatus";
import SitioRealtime from "@/components/catalogo_UI/General/RealTime";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { sileo } from "sileo";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadCartFromIDB } from "@/lib/indexedDBCart";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Header from "@/components/catalogo_UI/General/Header";
import { SheetProvider } from "@/components/catalogo_UI/General/SheetComponent";
import { supabase } from "@/lib/supabase";
import { LoadingScreen } from "@/components/catalogo_UI/General/LoadingScreen";
import { decodeShareCart } from "@/lib/shareCart";

interface ContextType {
  store: AppState;
  dispatchStore: Dispatch<AppAction>;
}

export const MyContext = createContext<ContextType>({
  store: initialState,
  dispatchStore: () => null,
});

interface MyProviderProps {
  children: ReactNode;
  storeSSD: AppState;
  color: string;
}

export default function MyProvider({
  children,
  storeSSD,
  color,
}: MyProviderProps) {
  const storeArreglado = storeSSD ?? initialState;
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const afiliate = searchParams.get("afiliate");
  const raw = searchParams.get("cart");
  const generalRef = useRef<HTMLDivElement>(null);

  const afiliateProcessedRef = useRef(false);

  const [store, dispatchStore] = useReducer(reducerStore, {
    ...(storeArreglado || initialState),
    afiliate: getAfiliate(storeSSD.sitioweb || ""),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Aplicar color a través de la prop "color" (preferencia sobre store.color)
    const colorToApply = color || store.color;
    if (colorToApply) {
      document.documentElement.style.setProperty("--primary", colorToApply);
    }
  }, [color, store.color]);

  useEffect(() => {
    dispatchStore({ type: "Add", payload: storeSSD });
  }, [storeSSD]);

  useEffect(() => {
    if (!mounted) return;
    if (!store.sitioweb) return;

    if (!raw) return;

    const items = decodeShareCart(raw);
    if (!items || items.length === 0) return;

    // Construir un array de Product "parciales" que mergeCartDataWithProducts
    // sabrá fusionar con el catálogo real del store.
    // Solo necesitamos productId, variantId (en selected_variant.id) y Cant.
    const sharedProducts = items.map((item) => ({
      productId: item.id,
      selected_variant: item.vid
        ? { id: item.vid, Cant: item.qty }
        : { Cant: item.qty },
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatchStore({ type: "HydrateCart", payload: sharedProducts as any });

    // Limpiar el parámetro de la URL sin recargar la página
    const url = new URL(window.location.href);
    url.searchParams.delete("cart");
    window.history.replaceState({}, "", url.toString());
  }, [mounted, raw, store.sitioweb, storeSSD]); // ← NO incluir searchParams en deps para que corra solo una vez

  useEffect(() => {
    if (!mounted) return;
    if (!afiliate || afiliateProcessedRef.current || !storeSSD?.sitioweb)
      return;

    const timer = setTimeout(() => {
      const codeFound = storeSSD.codeDiscount.find(
        (code) => code.code === afiliate,
      );

      if (!codeFound) {
        sileo.error({
          title: "Error",
          description: "Error con el código de afiliado",
        });
        return;
      }

      afiliateProcessedRef.current = true;

      const cartKey = `afiliate_${storeSSD.sitioweb}`;
      window.localStorage.setItem(cartKey, afiliate);

      dispatchStore({ type: "SetAfiliate", payload: afiliate });

      sileo.success({
        title: "Código de afiliado aplicado con éxito",
      });

      PostViewCode(codeFound.id);
    }, 2000);

    return () => clearTimeout(timer);
  }, [mounted, afiliate, storeSSD?.sitioweb, storeSSD?.codeDiscount]);

  useEffect(() => {
    if (!store.sitioweb) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await loadCartFromIDB(store.sitioweb || "");
        if (!res || cancelled) return;

        const { products, purchaseUuid } = res;

        if (products?.length > 0) {
          dispatchStore({
            type: "HydrateCart",
            payload: products as Product[],
          });
        }

        if (purchaseUuid) {
          dispatchStore({ type: "SetPurchaseUuid", payload: purchaseUuid });
        }
      } catch (err) {
        console.error("Error cargando carrito desde IDB:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [store.sitioweb]);

  const contextValue = useMemo(() => ({ store, dispatchStore }), [store]);

  const isSearchPage = pathname.includes("/search");
  // Mostrar loading screen hasta que onLoadComplete se llame
  if (!ready) {
    return (
      <LoadingScreen
        comments={store.comentTienda.data}
        loadingDuration={6000}
        onLoadComplete={() => setReady(true)}
      />
    );
  }

  return (
    <MyContext.Provider value={contextValue}>
      <div ref={generalRef}>
        <SheetProvider>
          {!isSearchPage ? <Header /> : null}
          <SitioRealtime uuid={store.UUID || ""} />
          {children}

          {store.compraUUID ? (
            <EditPurchaseDialog dispatchStore={dispatchStore} router={router} />
          ) : null}
        </SheetProvider>
      </div>
    </MyContext.Provider>
  );
}

function EditPurchaseDialog({
  dispatchStore,
  router,
}: {
  dispatchStore: Dispatch<AppAction>;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-16 size-10 right-4 z-50 rounded-full"
        >
          <Pencil />
          <span className="sr-only">Edicion</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edicion de Compras?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta seguro que desea salir de la edicion de compras?. Los cambios
            efectuados se perderan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              dispatchStore({ type: "SetPurchaseUuid", payload: "" });
              dispatchStore({ type: "Clean" });
              router.push("/user");
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getAfiliate(shopName: string): string {
  if (typeof window === "undefined" || !shopName) return "";
  try {
    return window.localStorage.getItem(`afiliate_${shopName}`) ?? "";
  } catch (error) {
    console.error("Error loading afiliate from localStorage:", error);
    return "";
  }
}

async function PostViewCode(id: number) {
  try {
    const { error } = await supabase.rpc("rpc_increment_visit_by_id", {
      _id: id,
    });
    if (error) {
      console.error("Error registrando vista de codigo de afiliado:", error);
    }
  } catch (error) {
    console.error("Error registrando vista de codigo de afiliado:", error);
  }
}
