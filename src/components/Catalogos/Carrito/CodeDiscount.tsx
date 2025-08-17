"use client";
import React, { useContext, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyContext } from "@/context/MyContext";
import { Trash2, Tag } from "lucide-react";
import { CompraInterface } from "./CarritoPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Props = {
  compra: CompraInterface;
  setCompra: React.Dispatch<React.SetStateAction<CompraInterface>>;
};

export default function CodeDiscount({ compra, setCompra }: Props) {
  const { store } = useContext(MyContext);
  const [appliedCoupon, setAppliedCoupon] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>("");

  const applyCoupon = () => {
    const validCoupons = store.codeDiscount.find(
      (obj) => obj.code == couponCode
    );
    setAppliedCoupon(
      store.codeDiscount.some((item) => item.code === couponCode)
    );

    if (validCoupons == undefined) {
      toast("Tarea Ejecutada", {
        description: "Comentario realizado",
      });
    } else if (validCoupons) {
      setCompra({
        ...compra,
        code: {
          discount: validCoupons?.discount || 0,
          name: validCoupons?.code || "",
        },
      });
      toast("Codigo Aplicado");
    } else {
      toast("Tarea Ejecutada", {
        description: "Ha ocurrido un error inesperado",
      });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="w-5 h-5" />
            Código de Descuento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <Input
                placeholder="Ingresa tu código"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <Button onClick={applyCoupon} variant="outline">
                Aplicar
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">
                  {compra.code.name}
                </span>
                <span className="text-sm text-green-600">
                  (-{compra.code.discount}%)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
                className="text-green-600 hover:text-green-800"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
