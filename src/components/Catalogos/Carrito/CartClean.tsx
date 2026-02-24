import React from "react";
import { ShoppingBag } from "lucide-react";
export default function CartClean({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="animate-bounce mb-8">
        <div className="relative">
          <ShoppingBag className="h-20 w-20 text-slate-300 dark:text-slate-600" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              0
            </span>
          </div>
        </div>
      </div>
      <h3 className="text-2xl font-light text-slate-700 dark:text-slate-300 mb-3">
        Tu carrito está vacío
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-8 max-w-sm leading-relaxed">
        Descubre nuestros productos y encuentra algo que te encante.
      </p>

      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full">
        <div className="animate-spin h-4 w-4 border-2 border-slate-400 dark:border-slate-500 border-t-transparent rounded-full"></div>
        <span className="text-sm font-medium">Redirigiendo...</span>
        <div className="text-xl font-bold text-slate-500 dark:text-slate-400 animate-pulse">
          {count >= 0 ? count : 0}
        </div>
      </div>
    </div>
  );
}
