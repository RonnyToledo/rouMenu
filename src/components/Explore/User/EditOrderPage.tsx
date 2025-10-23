"use client";

import { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { userContext } from "@/context/userContext";
import { toast } from "sonner";
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

interface OrderItem {
  id: string;
  name: string;
  nombre?: string;
  title?: string;
  quantity: number;
  cant?: number;
  Cant?: number;
  qty?: number;
  price: number;
  precio?: number;
  image?: string;
  imagen?: string;
  productId?: string;
  agregados?: AgregadosInterface[];
}

interface ProductStock {
  [productId: string]: number;
}

interface ParsedEventData {
  items?: OrderItem[];
  pedido?: OrderItem[];
  total?: number;
  currency?: string;
  moneda?: string;
  address?: string;
  direccion?: string;
  lugar?: string;
  paymentMethod?: string;
  payment?: string;
  pago?: string;
  phone?: string;
  phonenumber?: string;
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
            Number(item.Cant ?? item.cant ?? item.quantity ?? item.qty ?? 0) ||
            0;
          const price = Number(item.price ?? item.precio ?? 0) || 0;
          const name =
            item.nombre ?? item.title ?? item.name ?? `Producto ${index + 1}`;
          const image = item.imagen ?? item.image ?? undefined;
          const productId = item.productId ?? item.id;
          const agregados = item.agregados;
          return {
            id: productId ?? `item-${index}`,
            name,
            quantity,
            price,
            image,
            productId,
            agregados,
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
  const { events } = useContext(userContext);
  const orderId = params.id_order as string;
  const event = useMemo(
    () => events.find((e) => e.event_id === parseInt(orderId)),
    [events, orderId]
  );
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [productStocks, setProductStocks] = useState<ProductStock>({});
  const [storeHasStockControl, setStoreHasStockControl] = useState(false);

  const orderData = useMemo(() => {
    return event ? eventToOrderData(event) : null;
  }, [event]);

  // Cargar stock actual de productos
  useEffect(() => {
    if (!event) return;

    const loadStockData = async () => {
      setIsSaving(true);
      try {
        // 1. Verificar si la tienda controla stock
        const { data: siteData, error: siteError } = await supabase
          .from("Sitios")
          .select("stocks")
          .eq("UUID", event.sitio_uuid)
          .single();

        if (siteError) {
          console.error("Error loading store config:", siteError);
          setStoreHasStockControl(false);
          return;
        }

        const hasStockControl = siteData?.stocks ?? false;
        setStoreHasStockControl(hasStockControl);

        if (!hasStockControl) {
          // Si no controla stock, no hay restricciones
          return;
        }

        // 2. Obtener stock actual de cada producto
        const parsed = eventToOrderData(event);
        const productIds = parsed.items.map(
          (item) => item.productId || item.id
        );

        if (productIds.length === 0) return;

        const stockMap: ProductStock = {};
        const numericIds = productIds.filter((id) => /^\d+$/.test(String(id)));
        const stringIds = productIds.filter((id) => !/^\d+$/.test(String(id)));

        // Consultar por ID numérico
        if (numericIds.length > 0) {
          const { data: productsData } = await supabase
            .from("Products")
            .select("id, productId, stock")
            .in("id", numericIds.map(Number));

          if (productsData) {
            productsData.forEach((p) => {
              stockMap[p.id] = p.stock || 0;
              if (p.productId) {
                stockMap[p.productId] = p.stock || 0;
              }
            });
          }
        }
        // Consultar por productId string
        if (stringIds.length > 0) {
          const { data: productsData } = await supabase
            .from("Products")
            .select("id, productId, stock")
            .in("productId", stringIds);

          if (productsData) {
            productsData.forEach((p) => {
              stockMap[p.id] = p.stock || 0;
              if (p.productId) {
                stockMap[p.productId] = p.stock || 0;
              }
            });
          }
        }

        setProductStocks(stockMap);
      } catch (err) {
        console.error("Error loading stock data:", err);
      } finally {
        setIsSaving(false);
      }
    };

    loadStockData();
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
          // Si hay control de stock, verificar límite
          if (storeHasStockControl) {
            const availableStock = productStocks[item.id] ?? 0;
            const newQuantity = (item.quantity || 0) + delta;

            if (newQuantity > availableStock) {
              toast.error(
                `Stock disponible: ${availableStock} unidades. No puedes exceder este límite.`
              );
              return item;
            }
          }

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
      .reduce(
        (sum, item) =>
          sum +
          item.price * item.quantity +
          (item.agregados?.reduce(
            (sum, agg) => sum + agg.price * agg.cant,
            0
          ) || 0),
        0
      )
      .toFixed(2);
  };

  const handleSave = async () => {
    if (!event || items.length === 0) return;

    // Validación final de stock antes de guardar
    if (storeHasStockControl) {
      for (const item of items) {
        const availableStock = productStocks[item.id] ?? 0;
        if (item.quantity > availableStock) {
          toast.error(
            `Stock insuficiente para "${item.name}". Disponible: ${availableStock}, solicitado: ${item.quantity}`
          );
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      // Convertir items a formato event_desc
      const parsed: ParsedEventData = JSON.parse(event.event_desc || "{}");
      const updatedPedido = items.map((item) => ({
        ...(parsed.items?.[0] ?? {}),
        id: item.productId || item.id,
        productId: item.productId || item.id,
        nombre: item.name,
        Cant: item.quantity,
        price: item.price,
      }));

      const newTotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const updatedEventDesc = JSON.stringify({
        ...parsed,
        pedido: updatedPedido,
        total: newTotal,
      });

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

      const { error: updateError } = await supabase.rpc(
        "update_event_adjust_stock_v3",
        paramsRpc
      );

      if (updateError) {
        throw new Error(updateError.message || "Error al guardar cambios");
      }

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
      <div className="min-h-screen bg-background p-8 py-2">
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
    <div className="min-h-screen bg-background p-8 py-2">
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

          {storeHasStockControl && (
            <Card className="p-4 mt-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  Esta tienda controla stock. No puedes aumentar cantidades más
                  allá del disponible.
                </div>
              </div>
            </Card>
          )}
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
                {items.map((item) => {
                  const availableStock = productStocks[item.id] || 0;
                  const isOutOfStock =
                    storeHasStockControl &&
                    availableStock !== null &&
                    availableStock <= 0;
                  const canIncrease =
                    !storeHasStockControl ||
                    availableStock === null ||
                    item.quantity < availableStock;

                  return (
                    <div key={item.id}>
                      {(item?.agregados || []).length > 0 &&
                        (item?.agregados || []).map((agg) => (
                          <CardProducts
                            key={agg.id}
                            id={agg.id}
                            image={item.image || logoApp}
                            name={`${item.name} + ${agg.name}`}
                            price={agg.price}
                            quantity={agg.cant || 0}
                            updateQuantity={updateQuantity}
                            removeItem={removeItem}
                            isOutOfStock={isOutOfStock}
                            storeHasStockControl={storeHasStockControl}
                            availableStock={availableStock}
                            canIncrease={canIncrease}
                            event={event}
                          />
                        ))}
                      {item.quantity > 0 && (
                        <CardProducts
                          id={item.id}
                          image={item.image || logoApp}
                          name={item.name}
                          price={item.price}
                          quantity={item.quantity}
                          updateQuantity={updateQuantity}
                          removeItem={removeItem}
                          isOutOfStock={isOutOfStock}
                          storeHasStockControl={storeHasStockControl}
                          availableStock={availableStock}
                          canIncrease={canIncrease}
                          event={event}
                        />
                      )}
                    </div>
                  );
                })}
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
interface CardProductsProps {
  id: string;
  image: string;
  name: string;
  price: number;
  quantity: number;
  updateQuantity: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
  isOutOfStock: boolean;
  storeHasStockControl: boolean;
  availableStock: number;
  event: EventRow;
  canIncrease: boolean;
}
function CardProducts({
  id,
  image,
  name,
  price,
  quantity,
  updateQuantity,
  removeItem,
  isOutOfStock,
  storeHasStockControl,
  availableStock,
  event,
  canIncrease,
}: CardProductsProps) {
  return (
    <Card
      key={id}
      className={`p-6 hover:shadow-md transition-shadow ${
        isOutOfStock ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-6 flex-col">
        <div className="flex flex-row gap-2 w-full">
          <div className="relative">
            <Image
              src={image || logoApp}
              alt={name}
              width={100}
              height={100}
              className="rounded-lg object-cover bg-muted size-16"
            />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-medium text-foreground mb-2">{name}</h3>
            <p className="text-muted-foreground">
              ${price.toFixed(2)} por unidad
            </p>
            {storeHasStockControl && availableStock !== null && (
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
          {canEditOrder(event) && !isOutOfStock && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => updateQuantity(id, -1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-16 text-center">
                <span className="text-lg font-medium">{quantity}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => updateQuantity(id, 1)}
                disabled={!canIncrease}
                title={!canIncrease ? `Stock máximo: ${availableStock}` : ""}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="w-28 text-center">
            <p className="text-xl font-light tracking-tight">
              ${(price * quantity).toFixed(2)}
            </p>
          </div>

          {canEditOrder(event) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => removeItem(id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
