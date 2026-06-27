"use client";

import React, { useMemo, useContext, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseEventDesc, formatCurrency } from "@/utils/purchaseParser";
import { persistCartIDB } from "@/reducer/reducerGeneral";
import { userContext } from "@/context/userContext";
import { Link as LinkRef } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types/InitialStatus";

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

type PurchaseStatus = "completed" | "shipped";
type FilterType = "all" | "completed" | "shipped";
interface RawPedidoItem {
  id?: number | string;
  productId?: string;
  Cant?: number;
  selected_variant?: {
    id?: string;
    default?: boolean;
    Cant?: number;
    price?: number;
    stock?: number;
    image?: string;
    label?: string;
    attributes?: Record<string, unknown>;
  };
}
interface Purchase {
  id: string;
  catalogName: string;
  catalogType: string;
  items: number;
  total: string;
  rawTotalValue: number;
  currency?: string;
  date: string;
  status: PurchaseStatus;
  location: string;
  phone?: string;
  paymentMethod?: string;
  discountCode?: string | null;
  rawEvent: EventRow;
  detailUrl: string;
}

const STATUS_CONFIG: Record<
  PurchaseStatus,
  { label: string; className: string }
> = {
  completed: {
    label: "Completado",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  },
  shipped: {
    label: "Enviado",
    className: "bg-primary/10 text-primary border border-primary/20",
  },
};

const FILTERS = ["all", "completed", "shipped"] as const;

function inferPurchaseStatus(event: EventRow): PurchaseStatus {
  return event.visto === true ? "completed" : "shipped";
}

function eventToPurchase(event: EventRow): Purchase {
  const parsed = parseEventDesc(event.event_desc);
  const date = event.created_at
    ? new Date(event.created_at).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";
  const catalogName =
    event.sitio_name ?? event.nombre_event ?? event.events_text ?? "Evento";
  const catalogType = event.sitio_sitioweb ?? "";
  const location =
    parsed.address ?? event.sitio_sitioweb ?? event.descripcion ?? "";
  const status = inferPurchaseStatus(event);
  return {
    id: String(event.event_id),
    catalogName,
    catalogType,
    items: parsed.items,
    total: formatCurrency(parsed.total, parsed.currency),
    rawTotalValue: parsed.total,
    currency: parsed.currency,
    date,
    status,
    location,
    phone: parsed.phone,
    paymentMethod: parsed.paymentMethod,
    discountCode: parsed.discountCode,
    rawEvent: event,
    detailUrl: event.uid_venta
      ? `/checkout/${event.uid_venta}`
      : `/events/${event.event_id}`,
  };
}

export function PurchaseHistory() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const { events } = useContext(userContext);

  const { purchases, filteredPurchases } = useMemo(() => {
    const allPurchases = (events ?? []).map(eventToPurchase);
    const filtered =
      selectedFilter === "all"
        ? allPurchases
        : allPurchases.filter((p) => p.status === selectedFilter);
    return { purchases: allPurchases, filteredPurchases: filtered };
  }, [events, selectedFilter]);

  const EditarComprar = (idCompra: string) => {
    const e = events.find((e) => e.event_id === Number(idCompra));
    if (!e) return;

    const parsed = JSON.parse(e.event_desc || "{}");
    const pedido: RawPedidoItem[] = parsed.pedido ?? [];

    // Convertir items del pedido al formato que mergeCartDataWithProducts entiende
    const cartProducts = pedido
      .filter((item) => {
        const qty = Number(item.Cant ?? item.selected_variant?.Cant ?? 0) || 0;
        return qty > 0;
      })
      .map((item) => {
        const qty = Number(item.Cant ?? item.selected_variant?.Cant ?? 0) || 0;
        const hasNonDefaultVariant =
          item.selected_variant && !item.selected_variant.default;

        return {
          productId: item.productId ?? String(item.id),
          selected_variant: hasNonDefaultVariant
            ? {
                // Marcar explícitamente como no-default para que cartKey funcione
                ...item.selected_variant,
                default: false,
                Cant: qty,
              }
            : {
                // Variante default: solo necesita Cant
                Cant: qty,
                default: true,
              },
        };
      });

    persistCartIDB(
      e.sitio_sitioweb || "",
      cartProducts as Product[],
      e.uid_venta || "",
    );

    router.push(`/t/${e.sitio_sitioweb}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
          Historial de Compras
        </h2>
        <p className="text-sm text-muted-foreground">
          Revisa todas tus compras ({purchases.length} total)
        </p>
      </div>

      {/* Filtros — rounded-full coherente con el sistema */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((filter) => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter)}
            className={`rounded-full px-4 h-8 text-xs ${
              selectedFilter === filter ? "" : "border-border text-foreground"
            }`}
          >
            {filter === "all"
              ? "Todos"
              : (STATUS_CONFIG[filter as PurchaseStatus]?.label ?? filter)}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredPurchases.length > 0 ? (
          filteredPurchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onView={() => router.push(`/user/order/${purchase.id}`)}
              onEdit={() => EditarComprar(purchase.id)}
              onDelete={() => console.info("Delete", purchase.id)}
            />
          ))
        ) : (
          <div className="py-12 text-center rounded-2xl border border-border bg-secondary/30">
            <p className="text-sm text-muted-foreground">
              No se encontraron compras con este filtro
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface PurchaseCardProps {
  purchase: Purchase;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PurchaseCard({
  purchase,
  onView,
  onEdit,
  onDelete,
}: PurchaseCardProps) {
  const status = STATUS_CONFIG[purchase.status];

  return (
    <div className="bg-secondary/40 border border-border rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">
            {purchase.catalogName}
          </h3>
          {purchase.catalogType && (
            <Link
              href={`/t/${purchase.catalogType}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-75 transition-opacity mt-0.5"
            >
              {purchase.catalogType}
              <LinkRef className="w-3 h-3" />
            </Link>
          )}
        </div>
        <Badge
          variant="secondary"
          className={`shrink-0 rounded-full text-xs px-2 ${status.className}`}
        >
          {status.label}
        </Badge>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{purchase.date}</span>
        </div>
        {purchase.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{purchase.location}</span>
          </div>
        )}
        <span>
          <span className="font-medium text-foreground">{purchase.items}</span>{" "}
          artículos
        </span>
      </div>

      {(purchase.phone || purchase.paymentMethod || purchase.discountCode) && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {purchase.phone && (
            <span>
              <strong className="text-foreground">Tel:</strong> {purchase.phone}
            </span>
          )}
          {purchase.paymentMethod && (
            <span>
              <strong className="text-foreground">Pago:</strong>{" "}
              {purchase.paymentMethod}
            </span>
          )}
          {purchase.discountCode && (
            <span>
              <strong className="text-foreground">Cupón:</strong>{" "}
              {purchase.discountCode}
            </span>
          )}
        </div>
      )}

      {/* Total */}
      <div className="text-center py-3 border-t border-b border-border">
        <p className="text-2xl font-bold text-foreground">{purchase.total}</p>
      </div>

      {/* Acciones — rounded-full del sistema */}
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          className="w-full h-10 rounded-full font-medium gap-2 active:scale-[0.98] transition-all"
          onClick={onView}
        >
          <Eye className="w-3.5 h-3.5" />
          Ver
        </Button>
        {purchase.status === "shipped" && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-10 rounded-full border-border font-medium gap-2 active:scale-[0.98] transition-all"
              onClick={onEdit}
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-10 rounded-full border-red-500/40 text-red-500 hover:bg-red-500/10 hover:border-red-500 bg-transparent font-medium gap-2 active:scale-[0.98] transition-all"
              onClick={onDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
