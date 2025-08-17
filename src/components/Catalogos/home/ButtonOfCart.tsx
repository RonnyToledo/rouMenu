"use client";
import React, { useCallback, useContext, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { TbShoppingCartPlus, TbShoppingCartMinus } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { MyContext } from "@/context/MyContext";
import { Button } from "@/components/ui/button";
import { Product } from "@/context/InitialStatus";

export function ButtonOfCart({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "outline" | "default";
}) {
  const { dispatchStore } = useContext(MyContext);
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
                <TbShoppingCartMinus className="size-4" />
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
        className="size-8 flex justify-center items-center rounded-full"
        onClick={() => {
          const el = document.getElementById(product.productId);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
          handleToCart({ ...product, Cant: (product.Cant || 0) + 1 });
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
