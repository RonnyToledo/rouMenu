"use client";
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Truck } from "lucide-react";
import { CompraInterface } from "@/types/interfaces_Cart";
import { GrCurrency } from "react-icons/gr";
import { smartRound } from "@/functions/precios";

type Props = {
  compra: CompraInterface;
};

export default function Resumen({ compra }: Props) {
  const subtotal = useMemo(() => {
    return compra.pedido.reduce((total, item) => {
      const productLine =
        ((item.selected_variant?.price || 0) +
          (item.selected_variant?.embalaje || 0)) *
        (item.selected_variant?.Cant || 0);

      return total + productLine;
    }, 0);
  }, [compra.pedido]);

  const totalItems = useMemo(() => {
    return compra.pedido.reduce(
      (total, item) => total + (item.selected_variant?.Cant || 0),
      0,
    );
  }, [compra.pedido]);

  const discount = useMemo(
    () => (compra.total * compra.code.discount) / 100,
    [compra.total, compra.code.discount],
  );

  const grandTotal = useMemo(
    () => subtotal + smartRound(compra.shipping) - discount,
    [subtotal, compra.shipping, discount],
  );

  return (
    <Card className="border-border shadow-sm gap-2 py-4 rounded-2xl">
      <CardHeader className="px-4 py-0">
        <CardTitle className="font-serif text-base font-semibold text-foreground">
          Resumen del Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal ({totalItems} productos)</span>
            <span className="text-foreground">${subtotal.toFixed(2)}</span>
          </div>

          {compra.pedido.some(
            (p) => (p.selected_variant?.quantity_discounts?.length ?? 0) > 0,
          ) && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs">
              <span>✓ Descuentos por cantidad aplicados</span>
            </div>
          )}

          {compra.code.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Descuento ({compra.code.discount}%)</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Envío</span>
            </div>
            <span className="text-foreground">
              {compra.shipping === 0
                ? "GRATIS"
                : `$${smartRound(compra.shipping).toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <GrCurrency className="w-3.5 h-3.5" />
              <span>Moneda</span>
            </div>
            <span className="text-foreground">{compra.moneda}</span>
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="flex justify-between font-semibold text-foreground">
          <span>Total</span>
          <span className="text-lg">${grandTotal.toFixed(2)}</span>
        </div>

        <p className="text-[10px] text-muted-foreground text-center pt-1">
          Envío seguro y protegido · confirmas por WhatsApp
        </p>
      </CardContent>
    </Card>
  );
}
