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

  const getTotalPrice = () => {
    return compra.pedido.reduce(
      (total, item) =>
        total +
        ((item.price || 0) + item.embalaje) * item.Cant +
        (item?.agregados.reduce(
          (sum, agg) => (sum = sum + (agg.price + item.embalaje)) * agg.cant,
          0
        ) || 0),
      0
    );
  };

  return (
    <Card className="p-2 gap-2">
      <CardHeader className="p-2 gap-0">
        <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        <div className="space-y-2">
          <div className="text-sm space-y-1">
            <div className="flex justify-between text-slate-700">
              <span>
                Subtotal (
                {store.products.reduce(
                  (total, item) =>
                    total +
                    item.Cant +
                    (item?.agregados.reduce(
                      (sum, agg) => (sum = sum + agg.cant),
                      0
                    ) || 0),
                  0
                )}{" "}
                productos)
              </span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>

            {compra.code.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento ({compra.code.discount}%)</span>
                <span>
                  -${((compra.total * compra.code.discount) / 100).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-slate-700">
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
            <div className="flex justify-between text-slate-700">
              <div className="flex items-center gap-1">
                <GrCurrency className="w-4 h-4" />
                <span>Moneda</span>
              </div>
              <span>{compra.moneda}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>
            $
            {(
              getTotalPrice() +
              smartRound(compra.shipping) -
              (compra.total * compra.code.discount) / 100
            ).toFixed(2)}
          </span>
        </div>

        {/*shipping > 0 && (
                  <div className="text-xs text-slate-500 text-center">Envío gratis en compras mayores a $100</div>
                )*/}

        <Button
          className="w-full"
          size="lg"
          onClick={handleOrderClick}
          disabled={downloading}
        >
          {!downloading ? (
            <>
              <MdOutlineShoppingCart className="h-8 w-8 text-white" />
              {store.compraUUID ? "Modificar compra" : "Proceder al Checkout"}
            </>
          ) : (
            <>
              <Loader className=" animate-spin h-8 w-8 text-white" />
              Preparando su pedido
            </>
          )}
        </Button>

        <div className="text-xs text-slate-500 text-center">
          Envío seguro y protegido
        </div>
      </CardContent>
    </Card>
  );
}
