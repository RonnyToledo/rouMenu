"use client";
import { MyContext } from "@/context/MyContext";
import React, { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Truck, Loader } from "lucide-react";
import { CompraInterface } from "./CarritoPage";
import { Button } from "@/components/ui/button";
import { MdOutlineShoppingCart } from "react-icons/md";
import { smartRound } from "@/functions/precios";

type Props = {
  compra: CompraInterface;
  handleOrderClick: () => void;
  downloading: boolean;
};
export default function Resumen({
  compra,
  handleOrderClick,
  downloading,
}: Props) {
  const { store } = useContext(MyContext);

  const getTotalPrice = () => {
    return store.products.reduce(
      (total, item) => total + (item.price || 0) * item.Cant,
      0
    );
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal ({compra.pedido.length} productos)</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>

          {/*savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Ahorros</span>
                      <span>-${savings.toFixed(2)}</span>
                    </div>
                  )*/}

          {compra.code.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento ({compra.code.discount}%)</span>
              <span>
                -${((compra.total * compra.code.discount) / 100).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              <span>Envío</span>
            </div>
            <span>
              {compra.shipping === 0
                ? "GRATIS"
                : `$${smartRound(compra.shipping).toFixed(2)}`}
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>
            ${(getTotalPrice() + smartRound(compra.shipping)).toFixed(2)}
          </span>
        </div>

        {/*shipping > 0 && (
                  <div className="text-xs text-gray-500 text-center">Envío gratis en compras mayores a $100</div>
                )*/}

        <Button className="w-full" size="lg" onClick={handleOrderClick}>
          {!downloading ? (
            <>
              <MdOutlineShoppingCart className="h-8 w-8 text-white" />
              Proceder al Checkout
            </>
          ) : (
            <>
              <Loader className=" animate-spin h-8 w-8 text-white" />
              Preparando su pedido
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Envío seguro y protegido
        </div>
      </CardContent>
    </Card>
  );
}
