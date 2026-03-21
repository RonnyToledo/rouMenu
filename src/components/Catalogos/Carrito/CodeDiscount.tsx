"use client";
import React, { useContext, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyContext } from "@/context/MyContext";
import { Trash2, Tag } from "lucide-react";
import { CompraInterface } from "./CarritoPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sileo } from "sileo";

export type Props = {
  compra: CompraInterface;
  setCompra: React.Dispatch<React.SetStateAction<CompraInterface>>;
};

export default function CodeDiscount({ compra, setCompra }: Props) {
  const { store } = useContext(MyContext);
  const [appliedCoupon, setAppliedCoupon] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>("");

  const applyCoupon = useCallback(() => {
    const validCoupon = store.codeDiscount.find(
      (obj) => obj.code === couponCode,
    );
    if (!validCoupon) {
      sileo.error({
        title: "Cupón no válido",
        description: "El código ingresado no existe o ha expirado.",
      });
      return;
    }
    setCompra((prev) => ({
      ...prev,
      code: {
        discount: validCoupon.discount || 0,
        name: validCoupon.code || "",
      },
    }));
    setAppliedCoupon(true);
    sileo.success({
      title: "Código aplicado",
      description: `Descuento del ${validCoupon.discount}% aplicado correctamente.`,
    });
  }, [couponCode, store.codeDiscount, setCompra]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(false);
    setCouponCode("");
    setCompra((prev) => ({ ...prev, code: { discount: 0, name: "" } }));
  }, [setCompra]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && couponCode) applyCoupon();
    },
    [couponCode, applyCoupon],
  );

  return (
    <Card className="gap-2 py-4 border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Tag className="w-4 h-4 text-muted-foreground" />
          Cupón de Descuento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!appliedCoupon ? (
          <div className="flex items-center gap-2 rounded-full bg-secondary border border-border px-3 py-1">
            <Input
              placeholder="¿Tienes algún cupón?"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              className="flex-1 h-8 border-none bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none px-0"
            />
            <Button
              onClick={applyCoupon}
              variant="ghost"
              size="sm"
              className="rounded-full text-xs h-7 px-3 text-primary hover:bg-primary/10"
              disabled={!couponCode}
            >
              Aplicar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-sm font-medium text-foreground">
                {compra.code.name}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                (-{compra.code.discount}%)
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeCoupon}
              className="w-7 h-7 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
