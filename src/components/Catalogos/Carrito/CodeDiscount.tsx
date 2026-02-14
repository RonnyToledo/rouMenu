"use client";
import React, { useContext, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyContext } from "@/context/MyContext";
import { Trash2, Tag } from "lucide-react";
import { CompraInterface } from "./CarritoPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export type Props = {
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
      <Card className="gap-2 py-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="w-5 h-5" />
            Cupón de Descuento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!appliedCoupon ? (
            <div className=" rounded-full flex items-center gap-2 w-full max-w-3xl mx-auto px-2">
              <div className="flex w-full flex-1 items-stretch rounded-2xl h-full overflow-hidden">
                <Input
                  placeholder="Tienes algun cupón?"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="form-input h-full flex w-full min-w-0 flex-1 resize-none overflow-hidden  text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-white focus:border-none placeholder:text-slate-500 px-4 text-xs font-normal leading-normal line-clamp-1"
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
