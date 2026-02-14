import React from "react";
import { ShoppingBag } from "lucide-react";

interface ProfileStatsInterface {
  total: number;
}

export function ProfileStats({ total = 0 }: ProfileStatsInterface) {
  return (
    <div className="grid gap-6 ">
      {/* Total Purchases Card */}
      <div className="bg-slate-300/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-800 text-sm mb-2">Total de Compras</p>
            <p className="text-6xl font-bold text-slate-600 mb-2">{total}</p>
            <p className="text-slate-700 text-sm">En los últimos 6 meses</p>
          </div>
          <div className="p-3 bg-slate-300/50 rounded-xl">
            <ShoppingBag className="w-8 h-8 text-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
