import { Card } from "@/components/ui/card";
import { ShoppingBag, Package, Star } from "lucide-react";

export function ProfileStats() {
  const stats = [
    {
      label: "Total de Compras",
      value: "24",
      icon: ShoppingBag,
      description: "En los últimos 6 meses",
    },
    {
      label: "Catálogos Activos",
      value: "8",
      icon: Package,
      description: "Catálogos disponibles",
    },
    {
      label: "Puntos Acumulados",
      value: "1,250",
      icon: Star,
      description: "Programa de fidelidad",
    },
  ];

  return (
    <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-4xl font-light tracking-tight text-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div className="rounded-full bg-secondary p-3">
                <Icon className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
