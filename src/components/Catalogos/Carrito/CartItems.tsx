"use client";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/types/InitialStatus";
import React, { useContext, useCallback, memo, useMemo } from "react";
import Image from "next/image";
import { smartRound } from "@/functions/precios";
import { logoApp } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { FaChevronUp, FaChevronDown, FaRegTrashCan } from "react-icons/fa6";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { Props } from "./CodeDiscount";
import { cartKey } from "@/reducer/reducerGeneral";
import { buildCartTitle } from "@/lib/variantUtils";

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

export default function CartItems({ compra }: Props) {
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

  return (
    <div id="cart-items" className="px-2 grid mb-4">
      {compra.pedido.map((item) => {
        // Título con atributos: "Cafe Capuchino · Rojo · M"
        const displayTitle = buildCartTitle(
          item.title || "",
          item.selected_variant,
        );

        return (
          <div key={cartKey(item)}>
            {item.Cant > 0 && (
              <CartItemRow
                item={{ ...item, title: displayTitle }}
                cantidad={item.Cant}
                price={smartRound(item.price || 0)}
                onIncrement={() =>
                  handleToCart({ ...item, Cant: (item.Cant || 0) + 1 })
                }
                onDecrement={() =>
                  handleToCart({ ...item, Cant: (item.Cant || 0) - 1 })
                }
              />
            )}
            {item.agregados
              .filter((agg) => agg.cant > 0)
              .map((agg) => (
                <CartItemRow
                  key={`${cartKey(item)}-agg-${agg.id}`}
                  item={{ ...item, title: `${displayTitle}-${agg.name}` }}
                  cantidad={agg.cant}
                  price={smartRound(agg.price || 0)}
                  onIncrement={() =>
                    handleToCart({
                      ...item,
                      agregados: item.agregados.map((obj) =>
                        obj.id === agg.id
                          ? { ...obj, cant: obj.cant + 1 }
                          : obj,
                      ),
                    })
                  }
                  onDecrement={() =>
                    handleToCart({
                      ...item,
                      agregados: item.agregados.map((obj) =>
                        obj.id === agg.id
                          ? { ...obj, cant: obj.cant - 1 }
                          : obj,
                      ),
                    })
                  }
                  stockLimit={(item.stock || 0) - (item.Cant || 0)}
                />
              ))}
          </div>
        );
      })}
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

  const stockTop = stockLimit !== undefined ? stockLimit : item.stock || 0;
  const isAtStockLimit = store.stocks && cantidad >= stockTop;

  // Imagen: preferir la de la variante activa
  const itemImage = item.selected_variant?.image || item.image || logoApp;

  return (
    <div className="space-y-1">
      <div className="flex items-center border-b border-border p-2 gap-3">
        <Image
          width={100}
          height={100}
          alt={item.title || "Producto"}
          className="w-14 h-14 object-cover rounded-xl border border-border shrink-0"
          src={itemImage || logoApp}
        />
        <div className="grow min-w-0">
          <h4 className="font-semibold text-sm text-foreground line-clamp-2">
            {item.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            ${price} {moneda}
          </p>
        </div>

        {/* Quantity controls */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onIncrement}
            disabled={!!isAtStockLimit}
            className="w-7 h-7 rounded-full border border-border hover:bg-secondary transition-colors"
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
            className="w-7 h-7 rounded-full border border-border hover:bg-secondary transition-colors"
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

      {item.embalaje > 0 && (
        <p className="text-[10px] text-muted-foreground px-2">
          Embalaje P/U: {item.embalaje}
        </p>
      )}
    </div>
  );
});
