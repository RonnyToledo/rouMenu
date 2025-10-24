"use client";
// MyContextProvider.tsx
import React, {
  createContext,
  useReducer,
  ReactNode,
  Dispatch,
  useMemo,
  useEffect,
} from "react";
import { reducerStore, AppAction } from "@/reducer/reducerGeneral";
import { AppState, CodeDiscount, initialState, Product } from "./InitialStatus";
import SitioRealtime from "@/components/Catalogos/General/RealTime";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadCartFromIDB } from "@/lib/indexedDBCart"; // <-- cargar desde IDB
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
  //Crear estado global base
  const storeArregaldo = storeSSD ?? initialState;
  //Buscar afiliado
  const searchParams = useSearchParams();
  const router = useRouter();
  const afiliate = searchParams.get("afiliate");

  let afiliateNew = afiliate;
  //Verificar, salvar o buscar afiliado

  if (afiliate) {
    afiliateNew = verifyAndSavedAfiliate(
      storeSSD.sitioweb || "",
      storeSSD.codeDiscount,
      afiliate
    );
  } else {
    afiliateNew = getAfiliate(storeSSD.sitioweb || "");
  }

  // Nota: ya NO cargamos el carrito desde localStorage aquí.
  // Inicializamos el reducer con los productos del servidor (storeSSD)
  const [store, dispatchStore] = useReducer(reducerStore, {
    ...(storeArregaldo || initialState),
    afiliate: afiliateNew,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await loadCartFromIDB(store.sitioweb || "");
        if (!res) return;
        // si res es { products, purchaseUuid }
        const { products, purchaseUuid } = res;
        if (products && products.length > 0) {
          dispatchStore({
            type: "HydrateCart",
            payload: products as Product[],
          });
        }
        // opcional: guardar purchaseUuid en el estado si quieres
        if (purchaseUuid) {
          dispatchStore({ type: "SetPurchaseUuid", payload: purchaseUuid });
        }
      } catch (err) {
        console.error("Error cargando carrito desde IDB:", err);
      }
    })();
  }, [store.sitioweb]);

  const contextValue = useMemo(() => ({ store, dispatchStore }), [store]);
  return (
    <MyContext.Provider value={contextValue}>
      <SitioRealtime uuid={store.UUID || ""} />
      {children}
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
    </MyContext.Provider>
  );
}

function verifyAndSavedAfiliate(
  shopName: string,
  codeDiscount: CodeDiscount[],
  afiliate: string
): string {
  try {
    const cartKey = `afiliate_${shopName}`;
    if (codeDiscount.some((code) => code.code == afiliate)) {
      window.localStorage.setItem(cartKey, afiliate);
      toast("Codigo de afiliado aplicado con exito");
      return afiliate;
    } else {
      toast.error("Error con el codigo de afiliado");
      return "";
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    toast.error("Error inesperado");
    return "";
  }
}
function getAfiliate(shopName: string): string {
  try {
    const cartKey = `afiliate_${shopName}`;
    return window.localStorage.getItem(cartKey) || "";
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return "";
  }
}
