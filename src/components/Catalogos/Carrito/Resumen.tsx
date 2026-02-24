"use client";
import { MyContext } from "@/context/MyContext";
import React, { useContext, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Truck, Loader } from "lucide-react";
import { CompraInterface } from "./CarritoPage";
import { Button } from "@/components/ui/button";
import { MdOutlineShoppingCart } from "react-icons/md";
import { smartRound } from "@/functions/precios";
import { GrCurrency } from "react-icons/gr";

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

  const subtotal = useMemo(() => {
    return compra.pedido.reduce((total, item) => {
      const productLine = ((item.price || 0) + item.embalaje) * item.Cant;
      const agregadosLine =
        item.agregados?.reduce(
          (sum, agg) => sum + (agg.price + item.embalaje) * agg.cant,
          0,
        ) || 0;
      return total + productLine + agregadosLine;
    }, 0);
  }, [compra.pedido]);

  const totalItems = useMemo(() => {
    return store.products.reduce(
      (total, item) =>
        total +
        item.Cant +
        (item.agregados?.reduce((sum, agg) => sum + agg.cant, 0) || 0),
      0,
    );
  }, [store.products]);

  const discount = useMemo(
    () => (compra.total * compra.code.discount) / 100,
    [compra.total, compra.code.discount],
  );

  const grandTotal = useMemo(
    () => subtotal + smartRound(compra.shipping) - discount,
    [subtotal, compra.shipping, discount],
  );

  return (
    <Card className="p-2 gap-2 dark:bg-slate-900">
      <CardHeader className="p-2 gap-0">
        <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        <div className="space-y-2">
          <div className="text-sm space-y-1">
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Subtotal ({totalItems} productos)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {compra.code.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Descuento ({compra.code.discount}%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-700 dark:text-slate-300">
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

            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1">
                <GrCurrency className="w-4 h-4" />
                <span>Moneda</span>
              </div>
              <span>{compra.moneda}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-semibold text-slate-900 dark:text-slate-100">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>

        <Button
          className="w-full dark:text-slate-100"
          size="lg"
          onClick={handleOrderClick}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <Loader className="animate-spin h-8 w-8 text-white dark:text-slate-100" />
              Preparando su pedido
            </>
          ) : (
            <>
              <MdOutlineShoppingCart className="h-8 w-8 text-white" />
              {store.compraUUID ? "Modificar compra" : "Proceder al Checkout"}
            </>
          )}
        </Button>

        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Envío seguro y protegido
        </div>
      </CardContent>
    </Card>
  );
}
