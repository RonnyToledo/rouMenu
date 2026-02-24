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
    <Card className="gap-2 py-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="w-5 h-5" />
          Cupón de Descuento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!appliedCoupon ? (
          <div className="rounded-full flex items-center gap-2 w-full max-w-3xl mx-auto px-2">
            <div className="flex w-full flex-1 items-stretch rounded-2xl h-full overflow-hidden">
              <Input
                placeholder="¿Tienes algún cupón?"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                className="form-input h-full flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#0d141c] dark:text-slate-100 focus:outline-0 focus:ring-0 border-none bg-white dark:bg-slate-900 focus:border-none placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 text-xs font-normal leading-normal"
              />
            </div>
            <Button
              onClick={applyCoupon}
              variant="ghost"
              className="rounded-full"
              disabled={!couponCode}
            >
              Aplicar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-300">
                {compra.code.name}
              </span>
              <span className="text-sm text-green-600 dark:text-green-400">
                (-{compra.code.discount}%)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeCoupon}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
