"use client";
import React, { useState, useContext, useEffect, useRef } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/context/InitialStatus";
import { logoApp } from "@/lib/image";
import Image from "next/image";
import { smartRound } from "@/functions/precios";
import {
  MdOutlineShoppingCart,
  MdOutlineShoppingCartCheckout,
} from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StickyCart() {
  const { store, dispatchStore } = useContext(MyContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [contentCart, setContentCart] = useState<number>(0);
  const router = useRouter();
  const pathname = usePathname();

  // ref para el contenedor del carrito
  const cartRef = useRef<HTMLDivElement | null>(null);

  const handleToCart = (productToCart: Product) => {
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify(productToCart),
    });
  };

  const getTotalItems = () => {
    return store.products.reduce((total, item) => total + item.Cant, 0);
  };

  const getTotalPrice = () => {
    return store.products.reduce(
      (total, item) => total + (item.price || 0) * item.Cant,
      0
    );
  };

  useEffect(() => {
    setContentCart(
      store.products.reduce(
        (sum, product) => (sum = sum + (product.Cant || 0)),
        0
      )
    );
  }, [store.products]);

  useEffect(() => {
    // Auto-abrir el carrito brevemente
    if (!manualOpen) {
      setIsCartOpen(true);
      setTimeout(() => setIsCartOpen(false), 3000);
    }
  }, [contentCart, manualOpen]);

  // Cerrar al hacer click fuera (o con Esc)
  useEffect(() => {
    const handleOutside = (e: PointerEvent) => {
      // si no está abierto, no hacemos nada
      if (!isCartOpen && !manualOpen) return;

      // si no existe el ref, no hacemos nada
      if (!cartRef.current) return;

      // si el target no está dentro del contenedor, cerramos
      if (!cartRef.current.contains(e.target as Node)) {
        setIsCartOpen(false);
        setManualOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
        setManualOpen(false);
      }
    };

    // escuchamos pointerdown para detectar taps y clicks
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isCartOpen, manualOpen]);

  return (
    <div>
      {" "}
      {/* Mini Cart - Fixed Bottom */}
      {contentCart > 0 &&
        !(pathname.includes("/carrito") || pathname.includes("/producto")) && (
          // ref colocado aquí en el contenedor fijo
          <div ref={cartRef} className="fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-white border-t shadow-lg">
              {/* Cart Toggle Button */}
              <div className="flex items-center justify-between px-4 py-1">
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className="relative">
                    <Shop />{" "}
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {getTotalItems()}
                    </Badge>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {getTotalItems()}{" "}
                      {getTotalItems() === 1 ? "producto" : "productos"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Total: ${getTotalPrice().toFixed(2)}
                    </p>
                  </div>
                </button>
                <Button
                  size="sm"
                  variant={"outline"}
                  onClick={() => {
                    setIsCartOpen(!isCartOpen);
                    setManualOpen(true);
                  }}
                >
                  <MdOutlineShoppingCart />
                  Ver Pedido
                </Button>
              </div>

              {/* Expandable Cart Items */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isCartOpen ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="border-t bg-gray-50">
                  <div className="max-h-80 overflow-y-auto">
                    <ScrollArea className="max-h-44">
                      {store.products
                        .filter((item) => item.Cant > 0)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex h-12 items-center gap-3 px-3 py-1 border-b border-gray-200 bg-white animate-in slide-in-from-bottom-2 duration-300"
                          >
                            <Image
                              src={item.image || store.urlPoster || logoApp}
                              alt={item.title || "Producto"}
                              className="size-10 object-cover rounded"
                              width={150}
                              height={150}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                ${smartRound(item.price || 0)} × {item.Cant}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleToCart({
                                    ...item,
                                    Cant: (item.Cant || 0) - 1,
                                  })
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.Cant}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleToCart({
                                    ...item,
                                    Cant: (item.Cant || 0) + 1,
                                  })
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </ScrollArea>
                  </div>
                  <div className="px-3 py-1 bg-white border-t">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg">
                        ${getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() =>
                        router.push(`/t/${store.sitioweb}/carrito`)
                      }
                    >
                      Proceder al Checkout
                      <MdOutlineShoppingCartCheckout />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
function Shop() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}
