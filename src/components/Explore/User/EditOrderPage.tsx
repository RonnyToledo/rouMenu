"use client";

import { useState, useMemo, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Image from "next/image";
import { userContext } from "@/context/userContext";
import { logoApp } from "@/lib/image";
import { AgregadosInterface } from "@/types/InitialStatus";

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
  sitio_stocks?: boolean;
};

interface Agregado {
  id: string;
  name: string;
  cant: number;
  price: number;
}

interface OrderItem {
  id: string;
  name: string;
  title?: string;
  nombre?: string;
  quantity: number;
  Cant?: number;
  cant?: number;
  qty?: number;
  price: number;
  packing: number;
  embalaje?: number;
  precio?: number;
  image?: string;
  imagen?: string;
  productId?: string;
  agregados?: Agregado[];
  stock?: number;
}

interface ProductStock {
  [productId: string]: number;
}

interface ParsedEventData {
  code: { discount?: number | string; name: string };
  pedido?: OrderItem[];
  items?: OrderItem[];
  total?: number;
  moneda?: string;
  direccion?: string;
  lugar?: string;
  address?: string;
  phone?: string;
  phonenumber?: string;
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
    discount: undefined as number | string | undefined,
  };
  if (!event.event_desc) return result;
  try {
    const parsed: ParsedEventData = JSON.parse(event.event_desc);
    result.discount = parsed.code.discount;
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
            Number(item.Cant ?? item.cant ?? item.quantity ?? item.qty ?? 0) ||
            0;
          const price = Number(item.price ?? item.precio ?? 0) || 0;
          const name =
            item.nombre ?? item.title ?? item.name ?? `Producto ${index + 1}`;
          const agregados = Array.isArray(item.agregados)
            ? item.agregados.map((agg: AgregadosInterface) => ({
                id: agg.id,
                name: agg.name,
                cant: Number(agg.cant ?? 0) || 0,
                price: Number(agg.price ?? 0) || 0,
              }))
            : [];
          return {
            id: item.productId ?? item.id ?? `item-${index}`,
            name,
            quantity,
            price,
            image: item.imagen ?? item.image ?? undefined,
            productId: item.productId ?? item.id,
            agregados,
            stock: item.stock ?? 0,
            packing: item.embalaje ?? 0,
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

function getStatusLabel(event: EventRow): string {
  if (event.visto === true) return "Completado";
  if (event.visto === false) return "Enviado";
  return "Procesando";
}

function getStatusClass(event: EventRow): string {
  if (event.visto === true)
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
  return "bg-primary/10 text-primary border border-primary/20";
}

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { events } = useContext(userContext);
  const orderId = params.id_order as string;
  const event = useMemo(
    () => events.find((e) => e.event_id === parseInt(orderId)),
    [events, orderId],
  );

  const [items] = useState<OrderItem[]>([]);
  const [productStocks] = useState<ProductStock>({});
  const [storeHasStockControl] = useState(false);
  const [loadingStocks] = useState(false);

  const getAvailableStock = (
    productId: string,
    currentQuantityInOrder: number = 0,
  ) => {
    const stockInDB = Number(productStocks[productId] ?? 0);
    return Math.max(0, stockInDB + Number(currentQuantityInOrder ?? 0));
  };

  const orderData = useMemo(
    () => (event ? eventToOrderData(event) : null),
    [event],
  );

  const calculateTotal = () =>
    items
      .reduce((sum, item) => {
        const itemTotal = (item.price + item.packing) * item.quantity;
        const agregadosTotal = (item.agregados || []).reduce(
          (aggSum, agg) => aggSum + (agg.price + item.packing) * agg.cant,
          0,
        );
        return sum + itemTotal + agregadosTotal;
      }, 0)
      .toFixed(2);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-12 border border-border rounded-2xl bg-secondary/30">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-base font-medium text-foreground">
            Orden no encontrada
          </p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="rounded-full gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="rounded-full gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-0.5">
                Pedido #{event.event_id}
              </h1>
              <p className="text-sm text-muted-foreground">
                {event.sitio_name || event.nombre_event}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={`rounded-full text-xs px-3 ${getStatusClass(event)}`}
            >
              {getStatusLabel(event)}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {/* Info del pedido */}
          <Card className="border-border">
            <div className="p-4 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">
                Información del Pedido
              </h2>
              <div className="space-y-2 text-sm">
                {orderData?.address && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Dirección</span>
                    <span className="font-medium text-foreground text-right">
                      {orderData.address}
                    </span>
                  </div>
                )}
                {orderData?.phone && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Teléfono</span>
                    <span className="font-medium text-foreground">
                      {orderData.phone}
                    </span>
                  </div>
                )}
                {orderData?.paymentMethod && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">
                      Método de Pago
                    </span>
                    <span className="font-medium text-foreground">
                      {orderData.paymentMethod}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Productos */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Productos</h2>

            {items.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-border bg-secondary/30">
                <p className="text-sm text-muted-foreground">
                  No hay productos en este pedido
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const availableStock = getAvailableStock(
                    item.id,
                    item.quantity,
                  );
                  const isOutOfStock =
                    storeHasStockControl && availableStock <= 0;

                  return (
                    <div key={item.id} className="space-y-2">
                      {item.quantity > 0 && (
                        <Card
                          className={`border-border transition-all ${isOutOfStock ? "opacity-60" : ""} ${loadingStocks ? "grayscale-25" : ""}`}
                        >
                          <div className="p-4 flex items-center gap-3">
                            <Image
                              src={item.image || logoApp}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="rounded-xl object-cover border border-border w-14 h-14 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-0.5">
                                {item.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                ${item.price.toFixed(2)} por unidad
                              </p>
                              {storeHasStockControl && (
                                <p
                                  className={`text-xs mt-0.5 ${isOutOfStock ? "text-red-500" : "text-emerald-500"}`}
                                >
                                  {isOutOfStock
                                    ? "Sin stock"
                                    : `Stock: ${availableStock}`}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold text-foreground">
                                $
                                {(
                                  (item.price + item.packing) *
                                  item.quantity
                                ).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} un.
                              </p>
                              {item.packing > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  +{item.packing} emb.
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      )}

                      {(item.agregados || []).map((agg) => {
                        if (agg.cant === 0) return null;
                        const aggStock = getAvailableStock(agg.id, agg.cant);
                        const aggOutOfStock =
                          storeHasStockControl && aggStock <= 0;
                        return (
                          <Card
                            key={agg.id}
                            className={`border-l-2 border-l-primary/40 border-border ${aggOutOfStock ? "opacity-60" : ""}`}
                          >
                            <div className="p-4 flex items-center gap-3">
                              <Image
                                src={item.image || logoApp}
                                alt={agg.name}
                                width={64}
                                height={64}
                                className="rounded-xl object-cover border border-border w-14 h-14 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-0.5">
                                  {item.name} + {agg.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  ${agg.price.toFixed(2)} por unidad
                                </p>
                                {storeHasStockControl && (
                                  <p
                                    className={`text-xs mt-0.5 ${aggOutOfStock ? "text-red-500" : "text-emerald-500"}`}
                                  >
                                    {aggOutOfStock
                                      ? "Sin stock"
                                      : `Stock: ${aggStock}`}
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-semibold text-foreground">
                                  $
                                  {(
                                    (agg.price + item.packing) *
                                    agg.cant
                                  ).toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {agg.cant} un.
                                </p>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total */}
          <Card className="border-border bg-secondary/30">
            <div className="p-4 flex flex-col items-center gap-1">
              <span className="text-sm text-muted-foreground">
                Total del pedido
              </span>
              <span className="font-serif text-3xl font-bold text-foreground">
                ${calculateTotal()}
                {orderData?.currency && (
                  <span className="text-base font-normal text-muted-foreground ml-1.5">
                    {orderData.currency}
                  </span>
                )}
              </span>
              {orderData?.discount ? (
                <span className="text-xs text-muted-foreground">
                  Descuento: ${orderData.discount}
                </span>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
