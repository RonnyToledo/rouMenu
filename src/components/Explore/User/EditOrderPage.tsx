"use client";

import { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { userContext } from "@/context/userContext";
import { toast } from "sonner";
import { logoApp } from "@/lib/image";

type EventRow = {
  event_id: number;
  events_text: string | null;
  event_desc: string | null;
  uid_sitio: string | null;
  uid_venta: string | null;
  visto: boolean | null;
  nombre_event: string | null;
  created_at: string | null;
  phonenumber: number | null;
  descripcion: string | null;
  user_id: string | null;
  sitio_uuid: string | null;
  sitio_sitioweb: string | null;
  sitio_name: string | null;
};

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  nombre?: string;
  Cant?: number;
  cant?: number;
  qty?: number;
  priceCompra?: number;
  precio?: number;
  imagen?: string;
  title?: string;
}

interface ParsedEventData {
  pedido?: Array<{
    id?: string;
    nombre?: string;
    name?: string;
    Cant?: number;
    cant?: number;
    quantity?: number;
    qty?: number;
    price?: number;
    priceCompra?: number;
    precio?: number;
    imagen?: string;
    title?: string;
    image?: string;
  }>;
  items?: OrderItem[];
  total?: number;
  moneda?: string;
  direccion?: string;
  lugar?: string;
  address?: string;
  phone?: string;
  phonenumber?: string | number;
  pago?: string;
  payment?: string;
}

function eventToOrderData(event: EventRow) {
  const result = {
    items: [] as OrderItem[],
    total: 0,
    currency: undefined as string | undefined,
    address: undefined as string | undefined,
    phone: undefined as string | undefined,
    paymentMethod: undefined as string | undefined,
  };

  if (!event.event_desc) return result;

  try {
    const parsed: ParsedEventData = JSON.parse(event.event_desc);

    result.currency = parsed.moneda;
    result.address =
      parsed.direccion ?? parsed.lugar ?? parsed.address ?? undefined;
    result.phone =
      String(parsed.phone ?? parsed.phonenumber ?? "").trim() || undefined;
    result.paymentMethod = parsed.pago ?? parsed.payment ?? undefined;

    const totalValue = Number(parsed.total ?? 0);
    result.total = !isNaN(totalValue) && totalValue > 0 ? totalValue : 0;

    const itemsArray = parsed.pedido ?? parsed.items ?? [];
    if (Array.isArray(itemsArray)) {
      result.items = itemsArray
        .map((item, index): OrderItem | null => {
          if (!item || typeof item !== "object") return null;

          const quantity =
            Number(item.Cant ?? item.cant ?? item.quantity ?? item.qty ?? 1) ||
            1;
          const price =
            Number(item.price ?? item.priceCompra ?? item.precio ?? 0) || 0;
          const name =
            item.nombre ?? item.title ?? item.name ?? `Producto ${index + 1}`;
          const image = item.imagen ?? item.image ?? undefined;

          return {
            id: item.id ?? `item-${index}`,
            name,
            quantity,
            price,
            image,
          };
        })
        .filter((item): item is OrderItem => item !== null);
    }

    return result;
  } catch (error) {
    console.warn("Error parsing event_desc:", error);
    return result;
  }
}

function itemsToEventDesc(
  originalEvent: EventRow,
  updatedItems: OrderItem[]
): string {
  try {
    const parsed: ParsedEventData = JSON.parse(
      originalEvent.event_desc || "{}"
    );

    const updatedPedido = updatedItems.map((item) => {
      const original = (parsed.pedido ?? []).find(
        (p) => p.id === item.id || p.id === undefined
      );
      return {
        ...original,
        id: item.id,
        nombre: item.name,
        Cant: item.quantity,
        price: item.price,
      };
    });

    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return JSON.stringify({
      ...parsed,
      pedido: updatedPedido,
      total: newTotal,
    });
  } catch (error) {
    console.error("Error converting items to event_desc:", error);
    return originalEvent.event_desc ?? "{}";
  }
}

function canEditOrder(event: EventRow): boolean {
  return event.visto === false;
}

function getStatusLabel(event: EventRow): string {
  if (event.visto === true) return "Completado";
  if (event.visto === false) return "Enviado";
  return "Procesando";
}

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { events, setEvents } = useContext(userContext);
  const orderId = params.id_order as string;
  const event = useMemo(
    () => events.find((e) => e.event_id === parseInt(orderId)),
    [events, orderId]
  );

  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const orderData = useMemo(() => {
    return event ? eventToOrderData(event) : null;
  }, [event]);

  useEffect(() => {
    if (event) {
      const parsed = eventToOrderData(event);
      setItems(parsed.items);
    }
  }, [event]);

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
    if (!event || items.length === 0) return;

    setIsSaving(true);
    try {
      const updatedEventDesc = itemsToEventDesc(event, items);

      const paramsRpc = {
        p_uid: event.sitio_uuid,
        p_events: event.events_text,
        p_desc: JSON.parse(updatedEventDesc),
        p_uid_venta: event.uid_venta,
        p_nombre: event.nombre_event,
        p_phonenumber: Number(event.phonenumber) || 0,
        p_descripcion: event.descripcion || "",
        p_created_at: event.created_at || new Date().toISOString(),
      };
      console.log(paramsRpc);
      const { data, error: updateError } = await supabase.rpc(
        "update_event_adjust_stock",
        paramsRpc
      );

      console.log(data);
      if (updateError) {
        throw new Error(updateError.message || "Error al guardar cambios");
      }

      // Actualiza el context
      setEvents((prev) =>
        prev.map((e) =>
          e.event_id === event.event_id
            ? { ...e, event_desc: updatedEventDesc }
            : e
        )
      );

      toast.success("Pedido actualizado correctamente");
      router.push("/user");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      toast.error(errorMessage);
      console.error("Error saving order:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Pedido no encontrado</p>
            <Button variant="outline" onClick={() => router.push("/user")}>
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
          onClick={() => router.push("/user")}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4 flex-col sm:flex-row gap-4">
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
              {getStatusLabel(event)}
            </Badge>
          </div>

          <Card className="p-6 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Pedido</p>
                <p className="font-medium">#{event.event_id}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Catálogo</p>
                <p className="font-medium">
                  {event.sitio_name || event.nombre_event || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Fecha</p>
                <p className="font-medium">
                  {event.created_at
                    ? new Date(event.created_at).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Ubicación</p>
                <p className="font-medium">
                  {orderData?.address || event.descripcion || "N/A"}
                </p>
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
                    <div className="flex items-center gap-6 flex-col ">
                      <div className="flex flex-row gap-2">
                        <div className="relative  ">
                          <Image
                            src={item.image || logoApp}
                            alt={item.name}
                            width={100}
                            height={100}
                            className="rounded-lg object-cover bg-muted size-16"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            {item.name}
                          </h3>
                          <p className="text-muted-foreground">
                            ${item.price.toFixed(2)} por unidad
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-col sm:flex-row w-full sm:w-auto">
                        {canEditOrder(event) && (
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
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
                              className="h-9 w-9"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        <div className="w-28 text-center">
                          <p className="text-xl font-light tracking-tight">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {canEditOrder(event) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
                {orderData?.currency && (
                  <span className="text-sm ml-2">{orderData.currency}</span>
                )}
              </span>
            </div>
          </Card>

          {canEditOrder(event) && (
            <div className="flex gap-3 justify-end flex-col sm:flex-row">
              <Button
                variant="outline"
                onClick={() => router.push("/user")}
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
          )}
        </div>
      </div>
    </div>
  );
}
