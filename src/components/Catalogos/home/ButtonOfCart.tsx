"use client";
import React, {
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
  memo,
} from "react";
import { Badge } from "@/components/ui/badge";
import { TbShoppingCartPlus, TbShoppingCartMinus } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { MyContext } from "@/context/MyContext";
import { Button } from "@/components/ui/button";
import { Product } from "@/context/InitialStatus";
import { FaRegTrashCan } from "react-icons/fa6";
import { ScrollTo } from "@/functions/ScrollTo";

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
  const [slideOpen, setSlideOpen] = useState(false);

  const productCant = product.Cant || 0;
  const productStock = product.stock || 0;

  // Memoizar valores calculados
  const isDisabled = useMemo(
    () => store.stocks && productCant >= productStock,
    [store.stocks, productCant, productStock]
  );

  const isLastItem = productCant === 1;

  // Handlers optimizados
  const handleIncrement = useCallback(() => {
    ScrollTo(product.productId, 120);
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify({ ...product, Cant: productCant + 1 }),
    });
    setSlideOpen(true);
  }, [dispatchStore, product, productCant]);

  const handleDecrement = useCallback(() => {
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify({ ...product, Cant: productCant - 1 }),
    });
    if (isLastItem) setSlideOpen(false);
  }, [dispatchStore, product, productCant, isLastItem]);

  // Efecto optimizado
  useEffect(() => {
    if (productCant === 0) setSlideOpen(false);
  }, [productCant]);

  // Clases memoizadas
  const containerClasses = useMemo(
    () =>
      `absolute flex items-center justify-end rounded-full right-0 overflow-hidden z-1 ${
        variant === "default" ? "bg-primary" : ""
      }`,
    [variant]
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
            <Button
              size="icon"
              type="button"
              variant={variant}
              className="size-8 flex justify-center items-center rounded-full"
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
                    <FaRegTrashCan aria-hidden="true" />
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
                      className="size-4"
                      aria-hidden="true"
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            <div className="flex items-center justify-center">
              <Badge variant={variant} aria-label={`Cantidad: ${productCant}`}>
                {productCant}
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        size="icon"
        type="button"
        variant={variant}
        disabled={isDisabled}
        className="size-8 flex justify-center items-center rounded-full"
        onClick={handleIncrement}
        aria-label="Añadir al carrito"
      >
        {!slideOpen && productCant > 0 ? (
          productCant
        ) : (
          <TbShoppingCartPlus className="size-5" aria-hidden="true" />
        )}
      </Button>
    </motion.div>
  );
});
