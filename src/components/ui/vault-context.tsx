"use client";
import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VaultContextType {
  open: boolean;
  toggleOpen: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const useVaultContext = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("Vault components must be used within ToggleVault");
  }
  return context;
};

export interface ToggleVaultProps {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export const ToggleVault: React.FC<ToggleVaultProps> = ({
  children,
  className = "",
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const value = useMemo(() => ({ open, toggleOpen }), [open, toggleOpen]);

  return (
    <VaultContext.Provider value={value}>
      <div className={`relative w-full h-full ${className}`}>{children}</div>
    </VaultContext.Provider>
  );
};

const buttonBaseStyles = `
  w-[100px] h-[40px] rounded-full 
  flex items-center justify-center cursor-pointer z-50 
  transition-all duration-300 hover:scale-105 shadow-lg font-bold
`;

interface TriggerProps {
  children: ReactNode;
  className?: string;
}

export const ToggleVaultTrigger: React.FC<TriggerProps> = ({
  children,
  className = "",
}) => {
  const { open, toggleOpen } = useVaultContext();

  if (open) return null;

  return (
    <motion.button
      type="button"
      onClick={toggleOpen}
      aria-expanded={false}
      aria-label="Abrir vault"
      className={`
        ${buttonBaseStyles}
        bg-black text-white dark:bg-white dark:text-black
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

interface CloseProps {
  children: ReactNode;
  className?: string;
}

export const ToggleVaultClose: React.FC<CloseProps> = ({
  children,
  className = "",
}) => {
  const { open, toggleOpen } = useVaultContext();

  if (!open) return null;

  return (
    <motion.button
      type="button"
      onClick={toggleOpen}
      aria-label="Cerrar vault"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      className={`
        ${buttonBaseStyles}
        absolute top-4 right-4 bg-white text-black dark:bg-black dark:text-white
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

const animationConfig = {
  initial: {
    scaleX: 0.2,
    scaleY: 0.066,
    top: "1rem",
    right: "1rem",
    opacity: 0,
  },
  animate: {
    scaleX: 1,
    scaleY: 1,
    top: "0.6rem",
    right: "0.6rem",
    opacity: 1,
    transition: { duration: 0.7, ease: [0.2, 0.9, 0.3, 1] as const },
  },
  exit: {
    scaleX: 0.2,
    scaleY: 0.066,
    top: "1rem",
    right: "1rem",
    opacity: 0,
    transition: { duration: 0.6, ease: [0.2, 0.9, 0.3, 1] as const },
  },
} as const;

interface ContentProps {
  children: ReactNode;
  className?: string;
}

export const ToggleVaultContent: React.FC<ContentProps> = ({
  children,
  className = "",
}) => {
  const { open } = useVaultContext();

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="panel"
          {...animationConfig}
          className={`
            absolute top-0 right-0 rounded-2xl overflow-hidden z-40 shadow-lg 
            bg-black text-white dark:bg-white dark:text-black
            ${className}
          `}
          style={{ transformOrigin: "top right" }}
          aria-hidden={!open}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="p-1 flex flex-col gap-3 font-bold font-bricolage"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Demo
export default function Demo() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <ToggleVault>
        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Toggle Vault Optimizado
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Haz clic en el botón de la esquina superior derecha para abrir el
            vault.
          </p>
        </div>

        <ToggleVaultTrigger>Abrir</ToggleVaultTrigger>

        <ToggleVaultContent className="w-[400px] h-[300px]">
          <div className="p-6">
            <h2 className="text-2xl mb-4">Contenido del Vault</h2>
            <p className="mb-4">Este es el contenido optimizado del vault.</p>
            <ul className="space-y-2">
              <li>✓ Mejor rendimiento</li>
              <li>✓ Accesibilidad mejorada</li>
              <li>✓ Código más limpio</li>
              <li>✓ Mejor experiencia de usuario</li>
            </ul>
          </div>
        </ToggleVaultContent>

        <ToggleVaultClose>Cerrar</ToggleVaultClose>
      </ToggleVault>
    </div>
  );
}
