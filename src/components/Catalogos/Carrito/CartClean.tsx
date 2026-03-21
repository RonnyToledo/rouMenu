import React from "react";
import { ShoppingBag } from "lucide-react";

export default function CartClean({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="animate-bounce mb-8">
        <div className="relative">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary border border-border rounded-full flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">
              0
            </span>
          </div>
        </div>
      </div>

      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
        Tu carrito está vacío
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-8 max-w-xs leading-relaxed">
        Descubre nuestros productos y encuentra algo que te encante.
      </p>

      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-secondary border border-border">
        <div className="animate-spin h-3.5 w-3.5 border-2 border-muted-foreground border-t-transparent rounded-full" />
        <span className="text-xs font-medium text-muted-foreground">
          Redirigiendo...
        </span>
        <span className="text-base font-bold text-foreground animate-pulse">
          {count >= 0 ? count : 0}
        </span>
      </div>
    </div>
  );
}
