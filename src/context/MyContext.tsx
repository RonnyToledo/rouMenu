"use client";
// MyContextProvider.tsx
import React, { createContext, useReducer, ReactNode, Dispatch } from "react";
import { reducerStore, AppAction } from "@/reducer/reducerGeneral";
import { AppState, initialState } from "./InitialStatus";

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
  const [store, dispatchStore] = useReducer(
    reducerStore,
    storeSSD || initialState
  );

  return (
    <MyContext.Provider value={{ store, dispatchStore }}>
      {children}
    </MyContext.Provider>
  );
}
