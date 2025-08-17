"use client";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/context/InitialStatus";
import React, { useContext } from "react";
import Image from "next/image";
import { smartRound } from "@/functions/precios";
import { logoApp } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { FaChevronUp, FaChevronDown, FaRegTrashCan } from "react-icons/fa6";
import CartClean from "./CartClean";
export default function CartItems({ count }: { count: number }) {
  const { store, dispatchStore } = useContext(MyContext);

  const getProducts = () => {
    return store.products.filter((item) => item.Cant > 0);
  };

  const handleToCart = (productToCart: Product) => {
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify(productToCart),
    });
  };

  return (
    <div id="cart-items" className="p-2 grid gap-2">
      {getProducts().length > 0 ? (
        getProducts().map((item, index) => (
          <div
            key={index}
            className="flex items-center  border-b border-gray-200"
          >
            <Image
              width={100}
              height={100}
              alt={item.title || "Producto"}
              className="w-24 h-24 object-cover rounded-lg border-2 border-[var(--border-gold)]"
              src={item.image || store.urlPoster || logoApp}
            />
            <div className="ml-4 flex-grow">
              <h4 className="font-bold font-cinzel line-clamp-1 text-[var(--text-dark)] text-lg">
                {item.title}
              </h4>
              <p className="font-bold text-lg text-[var(--text-dark)] mt-1">
                ${smartRound(item.price || 0)} {store.moneda_default?.moneda}
              </p>
            </div>
            <div className="flex flex-col items-center ">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  handleToCart({
                    ...item,
                    Cant: (item.Cant || 0) + 1,
                  })
                }
                className="size-8 p-0 hover:bg-green-50 hover:border-green-300 hover:scale-110 transition-all duration-200"
              >
                <FaChevronUp className="w-4 h-4" />
              </Button>

              <div className="relative overflow-hidden size-8 flex items-center justify-center">
                <span
                  key={`${item.id}-${item.Cant}`}
                  className="font-bold text-lg text-center animate-in slide-in-from-bottom-5 duration-500 ease-out"
                  style={{
                    animation:
                      "slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  {item.Cant}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                disabled={item.Cant == 0}
                onClick={() =>
                  handleToCart({
                    ...item,
                    Cant: (item.Cant || 0) - 1,
                  })
                }
                className="size-8 p-0 hover:bg-red-50 hover:border-red-300 hover:scale-110 transition-all duration-200"
              >
                {item.Cant === 1 ? (
                  <FaRegTrashCan />
                ) : (
                  <FaChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))
      ) : (
        <CartClean count={count} />
      )}
    </div>
  );
}
