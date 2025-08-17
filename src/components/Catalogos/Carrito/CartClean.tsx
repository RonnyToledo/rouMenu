import React from "react";
import { ShoppingCart } from "lucide-react";
export default function CartClean({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-4">
          ¿Listo para agregar algunos productos?
        </p>
        <p className="text-gray-600 mb-4">
          Te vamos a llevar a nuetra pagina principal{" "}
        </p>
        <div className="text-4xl font-bold text-blue-500 animate-pulse">
          {count >= 0 ? count : 0}
        </div>
      </div>
    </div>
  );
}
