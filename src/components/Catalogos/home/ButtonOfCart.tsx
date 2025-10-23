"use client";
import React, { useCallback, useContext, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { TbShoppingCartPlus, TbShoppingCartMinus } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { MyContext } from "@/context/MyContext";
import { Button } from "@/components/ui/button";
import { Product } from "@/context/InitialStatus";
import { FaRegTrashCan } from "react-icons/fa6";

export function ButtonOfCart({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "outline" | "default";
}) {
  const { store, dispatchStore } = useContext(MyContext);
  const [slideOpen, setSlideOpen] = useState(false);

  const handleToCart = useCallback(
    (productToCart: Product) => {
      dispatchStore({
        type: "AddCart",
        payload: JSON.stringify(productToCart),
      });
    },
    [dispatchStore]
  );
  useEffect(() => {
    if (product.Cant == 0) setSlideOpen(false);
  }, [product.Cant]);

  return (
    <motion.div
      className={`absolute flex items-center justify-end rounded-full right-0 overflow-hidden z-1 ${
        variant && variant == "default" && "bg-primary"
      }`}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence>
        {slideOpen && (
          <motion.div
            className="flex items-center rounded-l-full"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-center items-center">
              <Button
                size="icon"
                type="button"
                variant={variant || "default"}
                className="size-8 flex justify-center items-center rounded-full"
                onClick={() => {
                  handleToCart({ ...product, Cant: (product.Cant || 0) - 1 });
                  if (product.Cant == 1) setSlideOpen(false);
                }}
                disabled={product.Cant === 0}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {product.Cant === 1 ? (
                    <motion.span
                      key="trash"
                      initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="inline-flex"
                    >
                      <FaRegTrashCan />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="chevron"
                      initial={{ opacity: 0, scale: 0.8, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="inline-flex"
                    >
                      <TbShoppingCartMinus className="size-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <Badge variant={variant || "default"}>{product.Cant}</Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        size="icon"
        type="button"
        variant={variant || "default"}
        disabled={store.stocks && product.Cant >= (product.stock || 0)}
        className="size-8 flex justify-center items-center rounded-full"
        onClick={() => {
          if (slideOpen) {
            const el = document.getElementById(product.productId);
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
            handleToCart({ ...product, Cant: (product.Cant || 0) + 1 });
          }
          setSlideOpen(true);
        }}
      >
        {!slideOpen && product.Cant > 0 ? (
          product.Cant
        ) : (
          <TbShoppingCartPlus className="size-5" />
        )}
      </Button>
    </motion.div>
  );
}
