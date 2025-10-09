"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";

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
  items: number;
  total: string;
}

interface EditOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Datos de ejemplo de productos en el pedido
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

export function EditOrderDialog({
  order,
  open,
  onOpenChange,
}: EditOrderDialogProps) {
  const [items, setItems] = useState<OrderItem[]>([]);

  // Cargar items cuando se abre el diálogo
  useState(() => {
    if (order && mockOrderItems[order.id]) {
      setItems(mockOrderItems[order.id]);
    }
  });

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

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios
    console.log("[v0] Guardando cambios del pedido:", {
      orderId: order?.id,
      items,
    });
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-light">
            Editar Pedido
          </DialogTitle>
          <DialogDescription>
            Modifica las cantidades o elimina productos de tu pedido en estado
            enviado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Pedido #{order.id}</p>
            <p className="font-medium">{order.catalogName}</p>
          </div>

          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No hay productos en este pedido
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <Image
                      fill
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover bg-muted"
                    />

                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">
                        {item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="w-12 text-center">
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="w-24 text-right">
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
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

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-light tracking-tight">
              ${calculateTotal()}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={items.length === 0}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
