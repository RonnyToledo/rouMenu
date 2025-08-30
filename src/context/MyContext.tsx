"use client";
// MyContextProvider.tsx
import React, { createContext, useReducer, ReactNode, Dispatch } from "react";
import { reducerStore, AppAction } from "@/reducer/reducerGeneral";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  return (
    <MyContext.Provider value={{ store, dispatchStore }}>
      {/* Animación simple entre páginas dentro del mismo layout */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </MyContext.Provider>
  );
}
