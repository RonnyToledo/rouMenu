"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ArrowLeft, Save } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  catalogName: string;
  catalogType: string;
  date: string;
  status: string;
  location: string;
}

// Datos de ejemplo
const mockOrders: Record<string, Order> = {
  "2": {
    id: "2",
    catalogName: "Catálogo Tecnología",
    catalogType: "Electrónica",
    date: "08 Mar 2024",
    status: "shipped",
    location: "Barcelona, España",
  },
};

const mockOrderItems: Record<string, OrderItem[]> = {
  "2": [
    {
      id: "item-1",
      name: "Laptop Pro 15",
      quantity: 1,
      price: 899.0,
      image: "/modern-laptop-workspace.png",
    },
  ],
};

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Cargar datos del pedido
    if (mockOrders[orderId]) {
      setOrder(mockOrders[orderId]);
      setItems(mockOrderItems[orderId] || []);
    }
  }, [orderId]);

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Aquí iría la lógica para guardar los cambios en el backend
    console.log("[v0] Guardando cambios del pedido:", { orderId, items });

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    router.push("/");
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Pedido no encontrado</p>
          </Card>
        </div>
      </div>
    );
  }

  // Verificar que el pedido esté en estado "enviado"
  if (order.status !== "shipped") {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Este pedido no puede ser editado
            </p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al perfil
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-2">
                Editar Pedido
              </h1>
              <p className="text-muted-foreground">
                Modifica las cantidades o elimina productos de tu pedido
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            >
              Enviado
            </Badge>
          </div>

          <Card className="p-6 bg-muted/30">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Pedido</p>
                <p className="font-medium">#{order.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Catálogo</p>
                <p className="font-medium">{order.catalogName}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Fecha</p>
                <p className="font-medium">{order.date}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Ubicación</p>
                <p className="font-medium">{order.location}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-light mb-4">Productos</h2>
            {items.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No hay productos en este pedido
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-6">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-24 w-24 rounded-lg object-cover bg-muted"
                      />

                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          {item.name}
                        </h3>
                        <p className="text-muted-foreground">
                          ${item.price.toFixed(2)} por unidad
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 bg-transparent"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="w-16 text-center">
                            <span className="text-lg font-medium">
                              {item.quantity}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 bg-transparent"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="w-28 text-right">
                          <p className="text-xl font-light tracking-tight">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card className="p-6 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xl font-medium">Total del pedido</span>
              <span className="text-3xl font-light tracking-tight">
                ${calculateTotal()}
              </span>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={items.length === 0 || isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
