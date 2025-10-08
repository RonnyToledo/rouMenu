"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Purchase {
  id: string;
  catalogName: string;
  catalogType: string;
  items: number;
  total: string;
  date: string;
  status: "completed" | "processing" | "shipped";
  location: string;
}

const mockPurchases: Purchase[] = [
  {
    id: "1",
    catalogName: "Catálogo Primavera 2024",
    catalogType: "Moda",
    items: 3,
    total: "$245.00",
    date: "15 Mar 2024",
    status: "completed",
    location: "Madrid, España",
  },
  {
    id: "2",
    catalogName: "Catálogo Tecnología",
    catalogType: "Electrónica",
    items: 1,
    total: "$899.00",
    date: "08 Mar 2024",
    status: "shipped",
    location: "Barcelona, España",
  },
  {
    id: "3",
    catalogName: "Catálogo Hogar & Deco",
    catalogType: "Decoración",
    items: 5,
    total: "$432.50",
    date: "02 Mar 2024",
    status: "completed",
    location: "Valencia, España",
  },
  {
    id: "4",
    catalogName: "Catálogo Deportes",
    catalogType: "Deportes",
    items: 2,
    total: "$178.00",
    date: "28 Feb 2024",
    status: "completed",
    location: "Sevilla, España",
  },
  {
    id: "5",
    catalogName: "Catálogo Belleza",
    catalogType: "Cosmética",
    items: 4,
    total: "$156.75",
    date: "22 Feb 2024",
    status: "processing",
    location: "Bilbao, España",
  },
];

const statusConfig = {
  completed: {
    label: "Completado",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  processing: {
    label: "Procesando",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  shipped: {
    label: "Enviado",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

export function PurchaseHistory() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const router = useRouter();

  const filters = ["all", "completed", "processing", "shipped"];

  const filteredPurchases =
    selectedFilter === "all"
      ? mockPurchases
      : mockPurchases.filter((p) => p.status === selectedFilter);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-light tracking-tight text-foreground mb-2">
            Historial de Compras
          </h2>
          <p className="text-muted-foreground">
            Revisa todas tus compras realizadas en nuestros catálogos
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter)}
            className="capitalize"
          >
            {filter === "all"
              ? "Todos"
              : statusConfig[filter as keyof typeof statusConfig]?.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredPurchases.map((purchase) => (
          <Card
            key={purchase.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-1">
                      {purchase.catalogName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {purchase.catalogType}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={statusConfig[purchase.status].className}
                  >
                    {statusConfig[purchase.status].label}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{purchase.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{purchase.location}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      {purchase.items}
                    </span>{" "}
                    artículos
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <p className="text-2xl font-light tracking-tight text-foreground">
                  {purchase.total}
                </p>
                <div className="flex gap-2">
                  {purchase.status === "shipped" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => router.push(`/orders/${purchase.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPurchases.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No se encontraron compras con este filtro
          </p>
        </Card>
      )}
    </div>
  );
}
