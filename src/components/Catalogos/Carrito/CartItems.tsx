"use client";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/context/InitialStatus";
import React, { useContext, useCallback, memo, useMemo } from "react";
import Image from "next/image";
import { smartRound } from "@/functions/precios";
import { logoApp } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { FaChevronUp, FaChevronDown, FaRegTrashCan } from "react-icons/fa6";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { Props } from "./CodeDiscount";

// Variantes de animación definidas fuera del componente
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
      {compra.pedido.map((item) => (
        <div key={item.id}>
          {item.Cant > 0 && (
            <CartItemRow
              item={item}
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
                key={`${item.id}-agg-${agg.id}`}
                item={{ ...item, title: `${item.title}-${agg.name}` }}
                cantidad={agg.cant}
                price={smartRound(agg.price || 0)}
                onIncrement={() =>
                  handleToCart({
                    ...item,
                    agregados: item.agregados.map((obj) =>
                      obj.id === agg.id ? { ...obj, cant: obj.cant + 1 } : obj,
                    ),
                  })
                }
                onDecrement={() =>
                  handleToCart({
                    ...item,
                    agregados: item.agregados.map((obj) =>
                      obj.id === agg.id ? { ...obj, cant: obj.cant - 1 } : obj,
                    ),
                  })
                }
                stockLimit={(item.stock || 0) - (item.Cant || 0)}
              />
            ))}
        </div>
      ))}
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

  return (
    <div className="shadow-xs space-y-1">
      <div className="flex items-center border-b border-b-slate-200 dark:border-b-slate-700 p-2">
        <Image
          width={100}
          height={100}
          alt={item.title || "Producto"}
          className="w-16 h-16 object-cover rounded-lg border-2 border-(--border-gold)"
          src={item.image || logoApp}
        />
        <div className="ml-4 grow">
          <h4 className="font-bold font-cinzel line-clamp-1 text-(--text-dark) dark:text-slate-100 text-lg">
            {item.title}
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
            ${price} {moneda}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onIncrement}
            disabled={!!isAtStockLimit}
            className="size-6 p-0 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-700 hover:scale-110 transition-all duration-200"
          >
            <FaChevronUp className="w-4 h-4" />
          </Button>

          <div className="relative overflow-hidden size-6 flex items-center justify-center">
            <span
              key={`${item.id}-${cantidad}`}
              className="font-bold text-lg text-center text-slate-800 dark:text-slate-200 animate-in slide-in-from-bottom-5 duration-500 ease-out"
              style={{
                animation: "slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {cantidad}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            disabled={cantidad === 0}
            onClick={onDecrement}
            className="size-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 hover:scale-110 transition-all duration-200"
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
                  <FaRegTrashCan className="text-red-700 dark:text-red-400" />
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
                  <FaChevronDown className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
      {item.embalaje > 0 && (
        <div className="text-slate-700 dark:text-slate-400 text-xs">
          <p>Embalaje P/U: {item.embalaje}</p>
        </div>
      )}
    </div>
  );
});
