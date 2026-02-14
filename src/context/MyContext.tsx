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
import { toast } from "sonner";
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
  // Crear estado global base
  const storeArregaldo = storeSSD ?? initialState;

  // Buscar afiliado
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const afiliate = searchParams.get("afiliate");

  // ✅ Usar useRef para rastrear si ya procesamos el afiliado
  const afiliateProcessedRef = useRef(false);

  // Inicializar el reducer con el afiliado guardado (si existe)
  const [store, dispatchStore] = useReducer(reducerStore, {
    ...(storeArregaldo || initialState),
    afiliate: getAfiliate(storeSSD.sitioweb || ""),
  });
  console.log(store);
  // ✅ Sincronizar con storeSSD cuando cambie
  useEffect(() => {
    dispatchStore({ type: "Add", payload: storeSSD });
  }, [storeSSD]);

  // ✅ Procesar código de afiliado de la URL SOLO UNA VEZ
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
        toast("Codigo de afiliado aplicado con exito");
        PostViewCode(codeFound.id);
      } else {
        toast.error("Error con el codigo de afiliado");
      }
    }
  }, [afiliate, storeSSD.sitioweb, storeSSD.codeDiscount]);

  // ✅ Cargar carrito desde IndexedDB
  useEffect(() => {
    (async () => {
      if (!store.sitioweb) return;

      try {
        const res = await loadCartFromIDB(store.sitioweb);
        if (!res) return;

        const { products, purchaseUuid } = res;

        if (products && products.length > 0) {
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
  }, [store.sitioweb]);

  // ✅ Memoizar el contexto
  const contextValue = useMemo(() => ({ store, dispatchStore }), [store]);

  // ✅ Aplicar color primario
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", store.color);
  }, [store.color]);

  return (
    <MyContext.Provider value={contextValue}>
      <SheetProvider>
        {!pathname.includes("/search") ? <Header /> : null}
        <SitioRealtime uuid={store.UUID || ""} />
        <div
          className={`${!pathname.includes("/search") ? "-translate-y-16" : ""}`}
        >
          {children}
        </div>
        {store.compraUUID ? (
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
                  Esta seguro que desea salir de la edicion de compras?. Los
                  cambios efectuados se perderan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    dispatchStore({
                      type: "SetPurchaseUuid",
                      payload: "",
                    });
                    dispatchStore({ type: "Clean" });
                    router.push("/user");
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </SheetProvider>
    </MyContext.Provider>
  );
}

// ✅ Función helper para obtener afiliado guardado
function getAfiliate(shopName: string): string {
  try {
    if (typeof window === "undefined") return "";

    const cartKey = `afiliate_${shopName}`;
    return window.localStorage.getItem(cartKey) ?? "";
  } catch (error) {
    console.error("Error loading afiliate from localStorage:", error);
    return "";
  }
}

// ✅ Función para registrar vista del código
async function PostViewCode(id: number) {
  try {
    const { data, error } = await supabase.rpc("rpc_increment_visit_by_id", {
      _id: id,
    });

    if (error) {
      console.error("Error registrando vista de codigo de afiliado:", error);
    } else {
      console.log("Vista de codigo de afiliado registrada:", data);
    }
  } catch (error) {
    console.error("Error registrando vista de codigo de afiliado:", error);
  }
}
