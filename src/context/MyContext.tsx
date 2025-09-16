"use client";
// MyContextProvider.tsx
import React, { createContext, useReducer, ReactNode, Dispatch } from "react";
import { reducerStore, AppAction } from "@/reducer/reducerGeneral";
import { AppState, initialState, Product } from "./InitialStatus";
import SitioRealtime from "@/components/Catalogos/General/RealTime";

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
  let storeArregaldo = storeSSD ?? initialState;
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

  const [store, dispatchStore] = useReducer(
    reducerStore,
    storeArregaldo || initialState
  );

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
    console.log(cartKey);
    const savedCart = localStorage.getItem(cartKey);
    console.log(savedCart);
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
  console.log(savedCart);
  return products.map((product) => {
    const savedProduct = savedCart.find(
      (saved) => saved.productId === product.productId
    );

    if (savedProduct) {
      const updatedProduct = { ...product };

      // Restaurar cantidad del producto
      if (savedProduct.Cant) {
        updatedProduct.Cant = savedProduct.Cant;
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
