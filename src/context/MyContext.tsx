"use client";
// MyContextProvider.tsx
import React, {
  createContext,
  useReducer,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";
import { reducerStore, AppAction } from "@/reducer/reducerGeneral";
import { AppState, CodeDiscount, initialState, Product } from "./InitialStatus";
import SitioRealtime from "@/components/Catalogos/General/RealTime";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { loadCartFromIDB } from "@/lib/indexedDBCart"; // <-- cargar desde IDB

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
  const afiliate = searchParams.get("afiliate");

  //Verificar, salvar o buscar afiliado
  let afiliateNew = afiliate;
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

  // Hidratar carrito desde IndexedDB después del mount
  useEffect(() => {
    (async () => {
      try {
        const savedCart = await loadCartFromIDB(store.sitioweb || "");
        if (savedCart && Array.isArray(savedCart) && savedCart.length > 0) {
          // dispatch HydrateCart con el array (no serializado)
          dispatchStore({
            type: "HydrateCart",
            payload: savedCart as Product[],
          });
        }
      } catch (err) {
        console.error("Error cargando carrito desde IDB:", err);
      }
    })();
  }, [store.sitioweb]); // se ejecuta cuando tenemos el sitio

  return (
    <MyContext.Provider value={{ store, dispatchStore }}>
      <SitioRealtime uuid={store.UUID || ""} />
      {children}
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
