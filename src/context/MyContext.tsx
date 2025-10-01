"use client";
// MyContextProvider.tsx
import React, { createContext, useReducer, ReactNode, Dispatch } from "react";
import { reducerStore, AppAction } from "@/reducer/reducerGeneral";
import { AppState, CodeDiscount, initialState, Product } from "./InitialStatus";
import SitioRealtime from "@/components/Catalogos/General/RealTime";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

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
  //Crear estado gloabal
  let storeArregaldo = storeSSD ?? initialState;

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

  //Buscar datos de los productos existentes
  if (storeSSD.products) {
    const savedCart = loadCartFromLocalStorage(storeSSD.sitioweb || "");
    const productsWithCartData = mergeCartDataWithProducts(
      storeSSD.products,
      savedCart
    );
    storeArregaldo = {
      ...storeSSD,
      products: productsWithCartData,
    };
  }
  //Crear el estado global
  const [store, dispatchStore] = useReducer(reducerStore, {
    ...(storeArregaldo || initialState),
    afiliate: afiliateNew,
  });

  return (
    <MyContext.Provider value={{ store, dispatchStore }}>
      <SitioRealtime uuid={store.UUID || ""} />
      {children}
    </MyContext.Provider>
  );
}
function loadCartFromLocalStorage(shopName: string): Product[] {
  try {
    const cartKey = `cart_${shopName}`;
    const savedCart = localStorage.getItem(cartKey);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return [];
  }
}

// Función para restaurar datos del localStorage en los productos
function mergeCartDataWithProducts(
  products: Product[],
  savedCart: Product[]
): Product[] {
  return products.map((product) => {
    const savedProduct = savedCart.find(
      (saved) => saved.productId === product.productId
    );

    if (savedProduct) {
      const updatedProduct = { ...product };

      // Restaurar cantidad del producto
      if (savedProduct.Cant) {
        updatedProduct.Cant =
          (product?.stock || 0) < savedProduct.Cant
            ? product?.stock || 0
            : savedProduct.Cant || 0;
      }

      // Restaurar cantidades de agregados
      if (savedProduct.agregados && product.agregados) {
        updatedProduct.agregados = product.agregados.map((agregado) => {
          const savedAgregado = savedProduct.agregados.find(
            (saved) => saved.id === agregado.id
          );

          return savedAgregado
            ? { ...agregado, cant: savedAgregado.cant }
            : agregado;
        });
      }

      return updatedProduct;
    }

    return product;
  });
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
