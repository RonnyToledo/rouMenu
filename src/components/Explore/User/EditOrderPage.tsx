"use client";

import { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { userContext } from "@/context/userContext";
import { logoApp } from "@/lib/image";
import { AgregadosInterface } from "@/context/InitialStatus";

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
  code: {
    discount?: number | string;
    name: string;
  };
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
          const image = item.imagen ?? item.image ?? undefined;
          const productId = item.productId ?? item.id;
          const stock = item.stock ?? 0;
          const packing = item.embalaje ?? 0;

          const agregados = Array.isArray(item.agregados)
            ? item.agregados.map((agg: AgregadosInterface) => ({
                id: agg.id,
                name: agg.name,
                cant: Number(agg.cant ?? 0) || 0,
                price: Number(agg.price ?? 0) || 0,
              }))
            : [];

          return {
            id: productId ?? `item-${index}`,
            name,
            quantity,
            price,
            image,
            productId,
            agregados,
            stock,
            packing,
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

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { events } = useContext(userContext);
  const orderId = params.id_order as string;
  const event = useMemo(
    () => events.find((e) => e.event_id === parseInt(orderId)),
    [events, orderId],
  );

  const [items, setItems] = useState<OrderItem[]>([]);
  const [productStocks, setProductStocks] = useState<ProductStock>({});
  const [storeHasStockControl, setStoreHasStockControl] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(false);

  // Calcular stock disponible considerando cantidades ya pedidas
  const getAvailableStock = (
    productId: string,
    currentQuantityInOrder: number = 0,
  ) => {
    const stockInDB = Number(productStocks[productId] ?? 0);
    const currentQty = Number(currentQuantityInOrder ?? 0);
    const available = stockInDB + currentQty;
    return Math.max(0, available);
  };

  const orderData = useMemo(() => {
    return event ? eventToOrderData(event) : null;
  }, [event]);

  // Resto del código del componente se mantiene igual hasta la parte del return
  // ... (todas las funciones useEffect y lógica)

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => {
        const itemTotal = (item.price + item.packing) * item.quantity;
        const agregadosTotal = (item.agregados || []).reduce(
          (aggSum, agg) => aggSum + (agg.price + item.packing) * agg.cant,
          0,
        );
        return sum + itemTotal + agregadosTotal;
      }, 0)
      .toFixed(2);
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-background dark:bg-slate-950 flex items-center justify-center">
        <Card className="p-12 dark:bg-slate-900 dark:border-slate-700">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground dark:text-slate-500" />
            <p className="text-xl font-medium dark:text-slate-200">
              Orden no encontrada
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="dark:border-slate-600 dark:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <div className="container dark:bg-slate-900 mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground dark:text-slate-100 mb-2">
                Detalles del Pedido #{event.event_id}
              </h1>
              <p className="text-muted-foreground dark:text-slate-400">
                {event.sitio_name || event.nombre_event}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="text-sm dark:bg-slate-700 dark:text-slate-200"
            >
              {getStatusLabel(event)}
            </Badge>
          </div>
        </div>

        {/* Order Info */}
        <div className="space-y-6">
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold dark:text-slate-100">
                Información del Pedido
              </h2>
              <div className="grid gap-3 text-sm">
                {orderData?.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground dark:text-slate-400">
                      Dirección:
                    </span>
                    <span className="font-medium text-right dark:text-slate-200">
                      {orderData.address}
                    </span>
                  </div>
                )}
                {orderData?.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground dark:text-slate-400">
                      Teléfono:
                    </span>
                    <span className="font-medium dark:text-slate-200">
                      {orderData.phone}
                    </span>
                  </div>
                )}
                {orderData?.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground dark:text-slate-400">
                      Método de Pago:
                    </span>
                    <span className="font-medium dark:text-slate-200">
                      {orderData.paymentMethod}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Items */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold dark:text-slate-100">
              Productos
            </h2>

            {items.length === 0 ? (
              <Card className="p-12 dark:bg-slate-900 dark:border-slate-700">
                <p className="text-center text-muted-foreground dark:text-slate-400">
                  No hay productos en este pedido
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const availableStock = getAvailableStock(
                    item.id,
                    item.quantity,
                  );
                  const isOutOfStock =
                    storeHasStockControl && availableStock <= 0;

                  return (
                    <div key={item.id} className="space-y-2">
                      {/* Producto principal */}
                      {item.quantity > 0 && (
                        <Card
                          className={`p-6 hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-700 ${
                            isOutOfStock ? "opacity-60" : ""
                          } ${loadingStocks ? "backdrop-grayscale-25" : ""}`}
                        >
                          <div className="flex items-center gap-6 flex-col">
                            <div className="flex flex-row gap-2 w-full">
                              <div className="relative">
                                <Image
                                  src={item.image || logoApp}
                                  alt={item.name}
                                  width={100}
                                  height={100}
                                  className="rounded-lg object-cover bg-muted dark:bg-slate-700 size-16"
                                />
                              </div>

                              <div className="flex-1">
                                <h3 className="text-lg font-medium text-foreground dark:text-slate-100 mb-2">
                                  {item.name}
                                </h3>
                                <p className="text-muted-foreground dark:text-slate-400">
                                  ${item.price.toFixed(2)} por unidad
                                </p>
                                {storeHasStockControl && (
                                  <p
                                    className={`text-sm mt-1 ${
                                      isOutOfStock
                                        ? "text-red-600 dark:text-red-400 font-medium"
                                        : "text-green-600 dark:text-green-400"
                                    }`}
                                  >
                                    {isOutOfStock
                                      ? "Sin stock"
                                      : `Stock disponible: ${availableStock}`}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-col sm:flex-row w-full sm:w-auto">
                              <div className="flex justify-around">
                                <div className="w-16 text-center">
                                  <span className="text-lg font-medium dark:text-slate-200">
                                    {item.quantity}
                                  </span>
                                  <div className="text-xs text-muted-foreground dark:text-slate-400">
                                    unidades
                                  </div>
                                </div>
                                {item.packing ? (
                                  <div className="w-16 text-center">
                                    <span className="text-lg font-medium dark:text-slate-200">
                                      {item.packing}
                                    </span>
                                    <div className="text-xs text-muted-foreground dark:text-slate-400">
                                      embalaje
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                              <div className="w-28 text-center">
                                <p className="text-xl font-light tracking-tight dark:text-slate-200">
                                  $
                                  {(
                                    (item.price + item.packing) *
                                    item.quantity
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* Agregados */}
                      {(item.agregados || []).map((agg) => {
                        if (agg.cant === 0) return null;

                        const aggStock = getAvailableStock(agg.id, agg.cant);
                        const aggOutOfStock =
                          storeHasStockControl && aggStock <= 0;

                        return (
                          <Card
                            key={agg.id}
                            className={`p-6 border-l-4 border-l-blue-200 dark:border-l-blue-800 hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-700 ${
                              aggOutOfStock ? "opacity-60" : ""
                            }`}
                          >
                            <div className="flex items-center gap-6 flex-col">
                              <div className="flex flex-row gap-2 w-full">
                                <div className="relative">
                                  <Image
                                    src={item.image || logoApp}
                                    alt={agg.name}
                                    width={100}
                                    height={100}
                                    className="rounded-lg object-cover bg-muted dark:bg-slate-700 size-16"
                                  />
                                </div>

                                <div className="flex-1">
                                  <h3 className="text-lg font-medium text-foreground dark:text-slate-100 mb-2">
                                    {item.name} + {agg.name}
                                  </h3>
                                  <p className="text-muted-foreground dark:text-slate-400">
                                    ${agg.price.toFixed(2)} por unidad
                                  </p>
                                  {storeHasStockControl && (
                                    <p
                                      className={`text-sm mt-1 ${
                                        aggOutOfStock
                                          ? "text-red-600 dark:text-red-400 font-medium"
                                          : "text-green-600 dark:text-green-400"
                                      }`}
                                    >
                                      {aggOutOfStock
                                        ? "Sin stock"
                                        : `Stock disponible: ${aggStock}`}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-col sm:flex-row w-full sm:w-auto">
                                <div className="flex justify-around">
                                  <div className="w-16 text-center">
                                    <span className="text-lg font-medium dark:text-slate-200">
                                      {agg.cant}
                                    </span>
                                    <div className="text-xs text-muted-foreground dark:text-slate-400">
                                      unidades
                                    </div>
                                  </div>
                                  {item.packing ? (
                                    <div className="w-16 text-center">
                                      <span className="text-lg font-medium dark:text-slate-200">
                                        {item.packing}
                                      </span>
                                      <div className="text-xs text-muted-foreground dark:text-slate-400">
                                        embalaje
                                      </div>
                                    </div>
                                  ) : null}
                                </div>

                                <div className="w-28 text-center">
                                  <p className="text-xl font-light tracking-tight dark:text-slate-200">
                                    $
                                    {(
                                      (agg.price + item.packing) *
                                      agg.cant
                                    ).toFixed(2)}
                                  </p>
                                </div>
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

          <Card className="p-6 bg-muted/30 dark:bg-slate-900/50 dark:border-slate-700">
            <div className="flex flex-col items-center justify-between space-y-2">
              <span className="text-xl font-medium dark:text-slate-100">
                Total del pedido
              </span>
              <span className="text-3xl font-light tracking-tight dark:text-slate-200">
                ${calculateTotal()}
                {orderData?.currency && (
                  <span className="text-sm ml-2 dark:text-slate-400">
                    {orderData.currency}
                  </span>
                )}
              </span>
              <span className="text-base font-light tracking-tight dark:text-slate-400">
                {orderData?.discount ? `Descuento: $${orderData.discount}` : ""}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
