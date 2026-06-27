"use client";
import React, { useCallback, useContext, useMemo, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { TbShoppingCartPlus, TbShoppingCartMinus } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/types/InitialStatus";
import { FaRegTrashCan } from "react-icons/fa6";
import { ScrollTo } from "@/functions/ScrollTo";
import { cartKey } from "@/reducer/reducerGeneral";
import { repriceVariantForQuantity } from "@/lib/discountUtils";
import { cn } from "@/lib/utils";
// Variantes de animación fuera del componente (se crean solo una vez)
const slideVariants = {
  initial: { opacity: 0, width: 0 },
  animate: { opacity: 1, width: "100%" },
  exit: { opacity: 0, width: 0 },
};

const iconVariants = {
  trash: {
    initial: { opacity: 0, scale: 0.8, rotate: -45 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0.8, rotate: 45 },
  },
  minus: {
    initial: { opacity: 0, scale: 0.8, y: -8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 8 },
  },
};

const transition = { duration: 0.4 };

interface ButtonOfCartProps {
  product: Product;
  variant?: "outline" | "default";
}

export const ButtonOfCart = memo(function ButtonOfCart({
  product,
  variant = "default",
}: ButtonOfCartProps) {
  const { store, dispatchStore } = useContext(MyContext);

  // Buscar la cantidad real de este producto+variante en el store
  const productInStore = useMemo(() => {
    const key = cartKey(product);
    return store.products.find((p) => cartKey(p) === key);
  }, [store.products, product]);

  const productCant = productInStore?.selected_variant?.Cant ?? 0;
  const productStock = product.selected_variant?.stock ?? 0;

  const slideOpen = productCant > 0;

  const isDisabled = useMemo(
    () => store.stocks && productCant >= productStock,
    [store.stocks, productCant, productStock],
  );

  const isLastItem = productCant === 1;

  const handleIncrement = useCallback(() => {
    ScrollTo(product.productId, 120);
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify({
        ...product,
        selected_variant: repriceVariantForQuantity(
          product.selected_variant,
          productCant + 1,
        ),
      }),
    });
  }, [dispatchStore, product, productCant]);

  const handleDecrement = useCallback(() => {
    const newCant = productCant - 1;
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify({
        ...product,
        selected_variant: repriceVariantForQuantity(
          product.selected_variant,
          newCant,
        ),
      }),
    });
  }, [dispatchStore, product, productCant]);

  const containerClasses = useMemo(
    () =>
      `absolute flex items-center justify-end rounded-[9px] right-0 overflow-hidden z-1 ${
        variant === "default" ? "bg-primary" : ""
      }`,
    [variant],
  );

  return (
    <motion.div className={containerClasses} transition={transition}>
      <AnimatePresence>
        {slideOpen && (
          <motion.div
            className="flex items-center rounded-l-full"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            <button
              type="button"
              className={cn(
                "w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0",
                "bg-primary text-white transition-colors duration-200",
                "hover:bg-primary/90",
              )}
              onClick={handleDecrement}
              disabled={productCant === 0}
              aria-label={
                isLastItem ? "Eliminar del carrito" : "Reducir cantidad"
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                {isLastItem ? (
                  <motion.span
                    key="trash"
                    variants={iconVariants.trash}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="inline-flex"
                  >
                    <FaRegTrashCan aria-hidden="true" className="w-4 h-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="minus"
                    variants={iconVariants.minus}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="inline-flex"
                  >
                    <TbShoppingCartMinus
                      className="w-4 h-4"
                      aria-hidden="true"
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <div className="flex items-center justify-center bg-primary">
              <Badge
                className="bg-primary"
                aria-label={`Cantidad: ${productCant}`}
              >
                {productCant}
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        disabled={isDisabled}
        className={cn(
          "w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0",
          "bg-primary text-white transition-colors duration-200",
          "hover:bg-primary/90",
        )}
        onClick={handleIncrement}
        aria-label="Añadir al carrito"
      >
        {!slideOpen && productCant > 0 ? (
          productCant
        ) : (
          <TbShoppingCartPlus className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </motion.div>
  );
});
