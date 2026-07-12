"use client";
import { MyContext } from "@/context/MyContext";
import { Product, ProductVariant } from "@/types/InitialStatus";
import React, { useContext, useCallback, memo, useMemo } from "react";
import Image from "next/image";
import { smartRound } from "@/functions/precios";
import { logoApp } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { FaChevronUp, FaChevronDown, FaRegTrashCan } from "react-icons/fa6";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { CompraInterface } from "@/types/interfaces_Cart";
import { cartKey } from "@/reducer/reducerGeneral";
import { buildCartTitle } from "@/lib/variantUtils";
import {
  discountLabel,
  getApplicableDiscount,
  repriceVariantForQuantity,
} from "@/lib/discountUtils";

const trashVariants = {
  initial: { opacity: 0, scale: 0.8, rotate: -45 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0.8, rotate: 45 },
};
const chevronVariants = {
  initial: { opacity: 0, scale: 0.8, y: -8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 8 },
};
const iconTransition = { duration: 0.25, ease: easeOut };
const rowTransition = { duration: 0.2, ease: easeOut };

type CartItemsProps = {
  compra: CompraInterface;
  setCompra: React.Dispatch<React.SetStateAction<CompraInterface>>;
};

export default function CartItems({ compra }: CartItemsProps) {
  const { dispatchStore } = useContext(MyContext);

  const handleToCart = useCallback(
    (productToCart: Product) => {
      dispatchStore({
        type: "AddCart",
        payload: JSON.stringify(productToCart),
      });
    },
    [dispatchStore],
  );

  const activeItems = compra.pedido.filter(
    (item) => (item.selected_variant?.Cant || 0) > 0,
  );

  return (
    <div id="cart-items" className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground px-1">
        {activeItems.length} producto{activeItems.length === 1 ? "" : "s"} en tu
        carrito
      </p>

      <AnimatePresence mode="popLayout">
        {activeItems.map((item: Product) => {
          const displayTitle = buildCartTitle(
            item.title || "",
            item.selected_variant,
          );

          return (
            <motion.div
              key={cartKey(item)}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
              transition={rowTransition}
            >
              <CartItemRow
                item={{ ...item, title: displayTitle }}
                cantidad={item.selected_variant?.Cant || 0}
                price={smartRound(item.selected_variant?.price || 0)}
                onIncrement={() =>
                  handleToCart({
                    ...item,
                    selected_variant: repriceVariantForQuantity(
                      item.selected_variant,
                      (item.selected_variant?.Cant || 0) + 1,
                    ) as ProductVariant,
                  })
                }
                onDecrement={() =>
                  handleToCart({
                    ...item,
                    selected_variant: repriceVariantForQuantity(
                      item.selected_variant,
                      (item.selected_variant?.Cant || 0) - 1,
                    ) as ProductVariant,
                  })
                }
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

interface CartItemRowProps {
  item: Product;
  cantidad: number;
  price: number;
  onIncrement: () => void;
  onDecrement: () => void;
  stockLimit?: number;
}

const CartItemRow = memo(function CartItemRow({
  item,
  cantidad,
  price,
  onIncrement,
  onDecrement,
  stockLimit,
}: CartItemRowProps) {
  const { store } = useContext(MyContext);

  const moneda = useMemo(
    () => store.moneda.find((m) => m.defecto)?.nombre || "",
    [store.moneda],
  );

  const stockTop =
    stockLimit !== undefined ? stockLimit : item.selected_variant?.stock || 0;
  const isAtStockLimit = store.stocks && cantidad >= stockTop;
  const activeDiscount = useMemo(
    () => getApplicableDiscount(item.selected_variant, cantidad),
    [item.selected_variant, cantidad],
  );

  // Imagen: preferir la de la variante activa
  const itemImage = item.selected_variant?.image || logoApp;

  return (
    <div className="rounded-2xl border border-border bg-card p-2.5 flex items-center gap-3 shadow-sm">
      <Image
        width={100}
        height={100}
        alt={item.title || "Producto"}
        className="w-16 h-16 object-cover rounded-xl border border-border shrink-0"
        src={itemImage || logoApp}
      />
      <div className="grow min-w-0 space-y-0.5">
        <h4 className="font-semibold text-sm text-foreground line-clamp-2">
          {item.title}
        </h4>
        <p className="text-xs text-muted-foreground">
          ${price} {moneda}
          {activeDiscount && (
            <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              {discountLabel(activeDiscount)}
            </span>
          )}
        </p>
        {(item.selected_variant?.embalaje || 0) > 0 && (
          <p className="text-[10px] text-muted-foreground">
            Embalaje P/U: {item.selected_variant?.embalaje}
          </p>
        )}
      </div>

      {/* Quantity controls */}
      <div className="flex flex-col items-center gap-0.5 shrink-0 bg-secondary rounded-full py-1 px-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onIncrement}
          disabled={!!isAtStockLimit}
          className="w-7 h-7 rounded-full hover:bg-background transition-colors"
        >
          <FaChevronUp className="w-3 h-3" />
        </Button>

        <div className="relative overflow-hidden w-6 flex items-center justify-center">
          <span
            key={`${cartKey(item)}-${cantidad}`}
            className="font-bold text-sm text-center text-foreground animate-in slide-in-from-bottom-2 duration-300"
          >
            {cantidad}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          disabled={cantidad === 0}
          onClick={onDecrement}
          className="w-7 h-7 rounded-full hover:bg-background transition-colors"
        >
          <AnimatePresence mode="wait" initial={false}>
            {cantidad === 1 ? (
              <motion.span
                key="trash"
                variants={trashVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={iconTransition}
                className="inline-flex"
              >
                <FaRegTrashCan className="w-3 h-3 text-red-500" />
              </motion.span>
            ) : (
              <motion.span
                key="chevron"
                variants={chevronVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={iconTransition}
                className="inline-flex"
              >
                <FaChevronDown className="w-3 h-3" />
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
});
