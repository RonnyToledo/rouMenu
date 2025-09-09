import React from "react";
import { ShoppingBag } from "lucide-react";
export default function CartClean({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="animate-bounce mb-8">
        <div className="relative">
          <ShoppingBag className="h-20 w-20 text-gray-300" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">0</span>
          </div>
        </div>
      </div>
      <h3 className="text-2xl font-light text-gray-700 mb-3">
        Tu carrito está vacío
      </h3>
      <p className="text-gray-500 text-center mb-8 max-w-sm leading-relaxed">
        Descubre nuestros productos y encuentra algo que te encante.
      </p>

      <div className="flex items-center gap-3 text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
        <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
        <span className="text-sm font-medium">Redirigiendo...</span>
        <div className="text-xl font-bold text-gray-500 animate-pulse">
          {count >= 0 ? count : 0}
        </div>
      </div>
    </div>
  );
}
