"use client";
// MyContextProvider.tsx
import React, {
  createContext,
  useReducer,
  ReactNode,
  Dispatch,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { reducerStore, AppAction } from "@/reducer/reducerGeneral";
import { AppState, initialState, Product } from "./InitialStatus";
import SitioRealtime from "@/components/Catalogos/General/RealTime";
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
import Header from "@/components/Catalogos/General/Header";
import { SheetProvider } from "@/components/Catalogos/General/SheetComponent";
import { supabase } from "@/lib/supabase";

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
}

export default function MyProvider({ children, storeSSD }: MyProviderProps) {
  const storeArreglado = storeSSD ?? initialState;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const afiliate = searchParams.get("afiliate");

  // Rastrear si ya procesamos el afiliado
  const afiliateProcessedRef = useRef(false);

  const [store, dispatchStore] = useReducer(reducerStore, {
    ...(storeArreglado || initialState),
    afiliate: getAfiliate(storeSSD.sitioweb || ""),
  });

  // Sincronizar con storeSSD cuando cambie (SSR → client hydration)
  useEffect(() => {
    dispatchStore({ type: "Add", payload: storeSSD });
  }, [storeSSD]);

  // Procesar código de afiliado de la URL SOLO UNA VEZ
  useEffect(() => {
    if (afiliate && !afiliateProcessedRef.current && storeSSD.sitioweb) {
      afiliateProcessedRef.current = true;

      const cartKey = `afiliate_${storeSSD.sitioweb}`;
      const codeFound = storeSSD.codeDiscount.find(
        (code) => code.code === afiliate,
      );

      if (codeFound) {
        window.localStorage.setItem(cartKey, afiliate);
        dispatchStore({ type: "SetAfiliate", payload: afiliate });
        sileo.success({
          title: "Código de afiliado aplicado con éxito",
        });
        PostViewCode(codeFound.id);
      } else {
        sileo.error({
          title: "Error",
          description: "Error con el código de afiliado",
        });
      }
    }
  }, [afiliate, storeSSD.sitioweb, storeSSD.codeDiscount]);

  // Cargar carrito desde IndexedDB
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

  // Memoizar el contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({ store, dispatchStore }), [store]);

  // Aplicar color primario via CSS variable
  useEffect(() => {
    if (store.color) {
      document.documentElement.style.setProperty("--primary", store.color);
    }
  }, [store.color]);

  const isSearchPage = pathname.includes("/search");

  return (
    <MyContext.Provider value={contextValue}>
      <SheetProvider>
        {!isSearchPage ? <Header /> : null}
        <SitioRealtime uuid={store.UUID || ""} />
        <div className={!isSearchPage ? "-translate-y-16" : ""}>{children}</div>
        {store.compraUUID ? (
          <EditPurchaseDialog dispatchStore={dispatchStore} router={router} />
        ) : null}
      </SheetProvider>
    </MyContext.Provider>
  );
}

// Componente extraído para evitar re-renders del árbol principal
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

// Helper para obtener afiliado guardado (solo client-side)
function getAfiliate(shopName: string): string {
  if (typeof window === "undefined" || !shopName) return "";
  try {
    return window.localStorage.getItem(`afiliate_${shopName}`) ?? "";
  } catch (error) {
    console.error("Error loading afiliate from localStorage:", error);
    return "";
  }
}

// Registrar vista del código de afiliado
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
