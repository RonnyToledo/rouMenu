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
    [events, orderId]
  );

  const [items, setItems] = useState<OrderItem[]>([]);
  const [productStocks, setProductStocks] = useState<ProductStock>({});
  const [storeHasStockControl, setStoreHasStockControl] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(false);

  // Calcular stock disponible considerando cantidades ya pedidas
  const getAvailableStock = (
    productId: string,
    currentQuantityInOrder: number = 0
  ) => {
    const stockInDB = Number(productStocks[productId] ?? 0);
    const currentQty = Number(currentQuantityInOrder ?? 0);
    const available = stockInDB + currentQty;
    return Math.max(0, available);
  };

  const orderData = useMemo(() => {
    return event ? eventToOrderData(event) : null;
  }, [event]);

  // Cargar stock actual de productos y agregados
  useEffect(() => {
    if (!event) return;

    const loadStockData = async () => {
      setLoadingStocks(true);
      try {
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
          return;
        }

        const parsed = eventToOrderData(event);
        const allProductIds = new Set<string>();

        parsed.items.forEach((item) => {
          if (item.productId || item.id) {
            allProductIds.add(item.productId || item.id);
          }
        });

        const agregadosIds = new Set<string>();
        parsed.items.forEach((item) => {
          item.agregados?.forEach((agg) => {
            if (agg.id) {
              agregadosIds.add(agg.id);
            }
          });
        });

        const stockMap: ProductStock = {};

        const productIds = Array.from(allProductIds);
        if (productIds.length > 0) {
          const numericIds = productIds.filter((id) =>
            /^\d+$/.test(String(id))
          );
          const stringIds = productIds.filter(
            (id) => !/^\d+$/.test(String(id))
          );

          if (numericIds.length > 0) {
            const { data: productsData } = await supabase
              .from("Products")
              .select("id, productId, stock")
              .in("id", numericIds.map(Number));

            if (productsData) {
              productsData.forEach((p) => {
                stockMap[String(p.id)] = p.stock || 0;
                if (p.productId) {
                  stockMap[String(p.productId)] = p.stock || 0;
                }
              });
            }
          }

          if (stringIds.length > 0) {
            const { data: productsData } = await supabase
              .from("Products")
              .select("id, productId, stock")
              .in("productId", stringIds);

            if (productsData) {
              productsData.forEach((p) => {
                stockMap[String(p.id)] = p.stock || 0;
                if (p.productId) {
                  stockMap[String(p.productId)] = p.stock || 0;
                }
              });
            }
          }
        }

        if (agregadosIds.size > 0) {
          const { data: agregadosData } = await supabase
            .from("agregados")
            .select("id, id_product")
            .in("id", Array.from(agregadosIds));

          if (agregadosData && agregadosData.length > 0) {
            const agregadosProductIds = agregadosData
              .map((agg) => agg.id_product)
              .filter(Boolean);

            if (agregadosProductIds.length > 0) {
              const { data: productsFromAgregados } = await supabase
                .from("Products")
                .select("id, productId, stock")
                .in("productId", agregadosProductIds);

              if (productsFromAgregados) {
                agregadosData.forEach((agg) => {
                  const product = productsFromAgregados.find(
                    (p) => p.productId === agg.id_product
                  );
                  if (product) {
                    stockMap[String(agg.id)] = product.stock || 0;
                  }
                });
              }
            }
          }
        }

        setProductStocks(stockMap);
      } catch (err) {
        console.error("Error loading stock data:", err);
      } finally {
        setLoadingStocks(false);
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

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => {
        const itemTotal = (item.price + item.packing) * item.quantity;
        const agregadosTotal = (item.agregados || []).reduce(
          (aggSum, agg) => aggSum + (agg.price + item.packing) * agg.cant,
          0
        );
        return sum + itemTotal + agregadosTotal;
      }, 0)
      .toFixed(2);
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
                Vista del Pedido
              </h1>
              <p className="text-muted-foreground">
                Visualiza los detalles del pedido (modo solo lectura).
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
            <div className="grid grid-cols-1 gap-4 text-sm">
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
                  Esta tienda controla stock. Los valores mostrados reflejan la
                  disponibilidad actual.
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
                  const availableStock = getAvailableStock(
                    item.id,
                    item.quantity
                  );
                  const isOutOfStock =
                    storeHasStockControl && availableStock <= 0;

                  return (
                    <div key={item.id} className="space-y-2">
                      {/* Producto principal (solo lectura) */}
                      {item.quantity > 0 && (
                        <Card
                          className={`p-6 hover:shadow-md transition-shadow ${
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
                                  <span className="text-lg font-medium">
                                    {item.quantity}
                                  </span>
                                  <div className="text-xs text-muted-foreground">
                                    unidades
                                  </div>
                                </div>
                                {item.packing ? (
                                  <div className="w-16 text-center">
                                    <span className="text-lg font-medium">
                                      {item.packing}
                                    </span>
                                    <div className="text-xs text-muted-foreground">
                                      embalaje
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                              <div className="w-28 text-center">
                                <p className="text-xl font-light tracking-tight">
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

                      {/* Agregados (solo lectura) */}
                      {(item.agregados || []).map((agg) => {
                        if (agg.cant === 0) return null;

                        const aggStock = getAvailableStock(agg.id, agg.cant);
                        const aggOutOfStock =
                          storeHasStockControl && aggStock <= 0;

                        return (
                          <Card
                            key={agg.id}
                            className={`p-6  border-l-4 border-l-blue-200 dark:border-l-blue-800 hover:shadow-md transition-shadow ${
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
                                    className="rounded-lg object-cover bg-muted size-16"
                                  />
                                </div>

                                <div className="flex-1">
                                  <h3 className="text-lg font-medium text-foreground mb-2">
                                    {item.name} + {agg.name}
                                  </h3>
                                  <p className="text-muted-foreground">
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
                                    <span className="text-lg font-medium">
                                      {agg.cant}
                                    </span>
                                    <div className="text-xs text-muted-foreground">
                                      unidades
                                    </div>
                                  </div>
                                  {item.packing ? (
                                    <div className="w-16 text-center">
                                      <span className="text-lg font-medium">
                                        {item.packing}
                                      </span>
                                      <div className="text-xs text-muted-foreground">
                                        embalaje
                                      </div>
                                    </div>
                                  ) : null}
                                </div>

                                <div className="w-28 text-center">
                                  <p className="text-xl font-light tracking-tight">
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

          <Card className="p-6 bg-muted/30">
            <div className="flex flex-col items-center justify-between space-y-2">
              <span className="text-xl font-medium">Total del pedido</span>
              <span className="text-3xl font-light tracking-tight">
                ${calculateTotal()}
                {orderData?.currency && (
                  <span className="text-sm ml-2">{orderData.currency}</span>
                )}
              </span>
              <span className="text-base font-light tracking-tight">
                {orderData?.discount ? `Descuento: $${orderData.discount}` : ""}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
