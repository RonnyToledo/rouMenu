import React from "react";
import { ShoppingBag } from "lucide-react";

interface ProfileStatsInterface {
  total: number;
}

export function ProfileStats({ total = 0 }: ProfileStatsInterface) {
  return (
    <div className="mb-6">
      <div className="bg-secondary/50 border border-border rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Total de Compras
            </p>
            <p className="text-5xl font-bold text-foreground mb-1">{total}</p>
            <p className="text-xs text-muted-foreground">
              En los últimos 6 meses
            </p>
          </div>
          <div className="p-2.5 bg-secondary border border-border rounded-xl">
            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
