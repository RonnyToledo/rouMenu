"use client";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/context/InitialStatus";
import React, { useContext } from "react";
import Image from "next/image";
import { smartRound } from "@/functions/precios";
import { logoApp } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { FaChevronUp, FaChevronDown, FaRegTrashCan } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { Props } from "./CodeDiscount";

export default function CartItems({ compra }: Props) {
  const { store, dispatchStore } = useContext(MyContext);

  const handleToCart = (productToCart: Product) => {
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify(productToCart),
    });
  };

  return (
    <div id="cart-items" className="px-2 grid mb-4">
      {compra.pedido.map((item, index) => (
        <div key={index}>
          {" "}
          {item.Cant > 0 && (
            <ItemCard
              title={item.title || "Producto"}
              imagen={item.image || store.urlPoster || logoApp}
              price={smartRound(item.price || 0)}
              moneda={store.moneda.find((m) => m.defecto)?.nombre || ""}
              id={item.id}
              embalaje={item.embalaje}
              camtidad={item.Cant}
              top={item.stock || 0}
              handleToCart={() =>
                handleToCart({
                  ...item,
                  Cant: (item.Cant || 0) + 1,
                })
              }
              handleToCartMinus={() =>
                handleToCart({
                  ...item,
                  Cant: (item.Cant || 0) - 1,
                })
              }
            />
          )}
          {item.agregados
            .filter((agg) => agg.cant > 0)
            .map((agg) => (
              <ItemCard
                key={index}
                title={`${item.title}-${agg.name}` || "Producto"}
                imagen={item.image || store.urlPoster || logoApp}
                price={smartRound(agg.price || 0)}
                moneda={store.moneda.find((m) => m.defecto)?.nombre || ""}
                top={(item.stock || 0) - (item.Cant || 0)}
                id={item.id}
                embalaje={item.embalaje}
                camtidad={agg.cant}
                handleToCart={() =>
                  handleToCart({
                    ...item,
                    agregados: item.agregados.map((obj) =>
                      obj.id === agg.id ? { ...obj, cant: obj.cant + 1 } : obj
                    ),
                  })
                }
                handleToCartMinus={() =>
                  handleToCart({
                    ...item,
                    agregados: item.agregados.map((obj) =>
                      obj.id === agg.id ? { ...obj, cant: obj.cant - 1 } : obj
                    ),
                  })
                }
              />
            ))}
        </div>
      ))}
    </div>
  );
}

interface ItemCardInterface {
  title: string;
  imagen: string;
  price: number;
  moneda: string;
  id: number;
  top: number;
  embalaje: number;
  camtidad: number;
  handleToCart: () => void;
  handleToCartMinus: () => void;
}

function ItemCard({
  title,
  imagen,
  price,
  moneda,
  id,
  embalaje,
  top,
  camtidad,
  handleToCart,
  handleToCartMinus,
}: ItemCardInterface) {
  const { store } = useContext(MyContext);

  return (
    <div className="shadow-xs space-y-1">
      <div className="flex items-center  border-b border-b-slate-200 p-2">
        <Image
          width={100}
          height={100}
          alt={title}
          className="w-16 h-16 object-cover rounded-lg border-2 border-(--border-gold)"
          src={imagen}
        />
        <div className="ml-4 grow">
          <h4 className="font-bold font-cinzel line-clamp-1 text-(--text-dark) text-lg">
            {title}
          </h4>
          <p className=" text-sm text-slate-700 mt-1">
            ${price} {moneda}
          </p>
        </div>
        <div className="flex flex-col items-center ">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToCart()}
            disabled={camtidad >= top && store.stocks}
            className="size-6 p-0 hover:bg-green-50 hover:border-green-300 hover:scale-110 transition-all duration-200"
          >
            <FaChevronUp className="w-4 h-4" />
          </Button>

          <div className="relative overflow-hidden size-6 flex items-center justify-center">
            <span
              key={`${id}-${camtidad}`}
              className="font-bold text-lg text-center animate-in slide-in-from-bottom-5 duration-500 ease-out"
              style={{
                animation: "slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {camtidad}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            disabled={camtidad == 0}
            onClick={() => handleToCartMinus()}
            className="size-6 p-0 hover:bg-red-50 hover:border-red-300 hover:scale-110 transition-all duration-200"
          >
            <AnimatePresence mode="wait" initial={false}>
              {camtidad === 1 ? (
                <motion.span
                  key="trash"
                  initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="inline-flex"
                >
                  <FaRegTrashCan className="text-red-700" />
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
                  <FaChevronDown className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
      <div className="text-slate-700 text-xs">
        <p>{embalaje > 0 && `Embalaje P/U: ${embalaje}`}</p>
      </div>
    </div>
  );
}
