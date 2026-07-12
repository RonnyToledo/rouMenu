import React from "react";
import { ArrowRight, Loader, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  currentStep: 1 | 2;
  totalItems: number;
  stepTotal: number;
  moneda: string;
  downloading: boolean;
  isModification: boolean;
  onContinue: () => void;
  onSubmitOrder: () => void;
};

export default function CartDock({
  currentStep,
  totalItems,
  stepTotal,
  moneda,
  downloading,
  isModification,
  onContinue,
  onSubmitOrder,
}: Props) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-4 pt-2 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto">
        <div className="flex items-center gap-3 rounded-full bg-background/90 backdrop-blur-lg border border-border shadow-lg px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
            {currentStep === 1 ? (
              <ShoppingBag className="w-4 h-4 text-foreground" />
            ) : (
              <Truck className="w-4 h-4 text-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-[10px] text-muted-foreground">
              {currentStep === 1
                ? `${totalItems} producto${totalItems === 1 ? "" : "s"}`
                : "Total a pagar"}
            </p>
            <p className="text-sm font-bold text-foreground">
              ${stepTotal.toFixed(2)}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">
                {moneda}
              </span>
            </p>
          </div>

          {currentStep === 1 ? (
            <Button
              onClick={onContinue}
              className="h-11 rounded-full font-semibold gap-1.5 px-5 active:scale-[0.98] transition-all shrink-0"
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onSubmitOrder}
              disabled={downloading}
              className="h-11 rounded-full font-semibold gap-1.5 px-5 active:scale-[0.98] transition-all shrink-0"
            >
              {downloading ? (
                <>
                  <Loader className="animate-spin w-4 h-4" />
                  Enviando
                </>
              ) : isModification ? (
                "Modificar"
              ) : (
                "Confirmar"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
