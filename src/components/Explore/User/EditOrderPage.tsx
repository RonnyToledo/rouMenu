"use client";

import { useMemo, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Image from "next/image";
import { userContext } from "@/context/userContext";
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
  sitio_stocks?: boolean;
};

interface OrderItem {
  key: string; // único por fila: productId + variantId o índice
  id: string;
  name: string;
  variantLabel?: string;
  quantity: number;
  price: number;
  packing: number;
  image?: string;
  productId?: string;
  stock?: number;
}

interface ParsedEventData {
  code?: { discount?: number | string; name?: string };
  pedido?: RawItem[];
  items?: RawItem[];
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

interface RawItem {
  id?: string | number;
  title?: string;
  name?: string;
  nombre?: string;
  Cant?: number;
  cant?: number;
  quantity?: number;
  qty?: number;
  price?: number;
  precio?: number;
  embalaje?: number;
  packing?: number;
  image?: string;
  imagen?: string;
  productId?: string;
  stock?: number;
  selected_variant?: {
    id?: string;
    label?: string;
    Cant?: number;
    price?: number;
    stock?: number;
    image?: string;
    attributes?: Record<string, string | number | boolean>;
  };
}

function eventToOrderData(event: EventRow) {
  const empty = {
    items: [] as OrderItem[],
    total: 0,
    currency: undefined as string | undefined,
    address: undefined as string | undefined,
    phone: undefined as string | undefined,
    paymentMethod: undefined as string | undefined,
    discount: undefined as number | string | undefined,
    customerName: undefined as string | undefined,
  };

  if (!event.event_desc) return empty;

  try {
    const parsed: ParsedEventData =
      typeof event.event_desc === "string"
        ? JSON.parse(event.event_desc)
        : event.event_desc;

    const totalValue = Number(parsed.total ?? 0);
    const rawItems: RawItem[] = parsed.pedido ?? parsed.items ?? [];

    const items: OrderItem[] = Array.isArray(rawItems)
      ? rawItems
          .map((item, index): OrderItem | null => {
            if (!item || typeof item !== "object") return null;

            // Cantidad: raíz primero (fix nuevo), luego dentro de selected_variant (pedidos viejos)
            const quantity =
              Number(
                item.Cant ??
                  item.selected_variant?.Cant ??
                  item.cant ??
                  item.quantity ??
                  item.qty ??
                  0,
              ) || 0;

            // Precio: usar el del raíz (ya viene convertido a moneda destino)
            const price = Number(item.price ?? item.precio ?? 0) || 0;

            // Nombre: title es el campo que viene del backend
            const name =
              item.title ?? item.name ?? item.nombre ?? `Producto ${index + 1}`;

            // Variante no-default: enriquecer nombre con label
            const variant = item.selected_variant;
            const variantLabel = variant?.label ?? undefined;

            // Imagen: preferir la de la variante si existe
            const image =
              variant?.image || item.image || item.imagen || undefined;

            // Key único: productId + variantId si hay variante, si no productId + índice
            const productId = String(item.productId ?? item.id ?? index);
            const key = variant?.id
              ? `${productId}-${variant.id}`
              : `${productId}-${index}`;

            return {
              key,
              id: productId,
              name,
              variantLabel,
              quantity,
              price,
              packing: Number(item.embalaje ?? item.packing ?? 0) || 0,
              image: image || undefined,
              productId,
              stock: Number(item.stock ?? 0) || 0,
            };
          })
          .filter(
            (item): item is OrderItem => item !== null && item.quantity > 0,
          )
      : [];

    return {
      items,
      total: !isNaN(totalValue) && totalValue > 0 ? totalValue : 0,
      currency: parsed.moneda,
      address:
        parsed.direccion && parsed.direccion !== ""
          ? parsed.direccion
          : parsed.lugar !== "Local" && parsed.lugar
            ? parsed.lugar
            : undefined,
      phone:
        String(parsed.phone ?? parsed.phonenumber ?? "").trim() || undefined,
      paymentMethod: parsed.pago ?? parsed.payment ?? undefined,
      discount: parsed.code?.discount,
      customerName: event.nombre_event ?? undefined,
    };
  } catch (error) {
    console.warn("Error parsing event_desc:", error);
    return empty;
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

  const orderData = useMemo(
    () => (event ? eventToOrderData(event) : null),
    [event],
  );

  const items = useMemo(() => orderData?.items ?? [], [orderData]);

  const calculatedTotal = useMemo(
    () =>
      items
        .reduce(
          (sum, item) => sum + (item.price + item.packing) * item.quantity,
          0,
        )
        .toFixed(2),
    [items],
  );

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
                {orderData?.customerName && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Cliente</span>
                    <span className="font-medium text-foreground">
                      {orderData.customerName}
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
                {orderData?.address && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Dirección</span>
                    <span className="font-medium text-foreground text-right">
                      {orderData.address}
                    </span>
                  </div>
                )}
                {orderData?.paymentMethod && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">
                      Método de Pago
                    </span>
                    <span className="font-medium text-foreground capitalize">
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
                {items.map((item, index) => (
                  <Card key={index} className="border-border">
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
                        {item.variantLabel && (
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {item.variantLabel}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} por unidad
                        </p>
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
                            +{item.packing.toFixed(2)} emb.
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
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
                ${calculatedTotal}
                {orderData?.currency && (
                  <span className="text-base font-normal text-muted-foreground ml-1.5">
                    {orderData.currency}
                  </span>
                )}
              </span>
              {orderData?.discount ? (
                <span className="text-xs text-muted-foreground">
                  Descuento aplicado: {orderData.discount}%
                </span>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
